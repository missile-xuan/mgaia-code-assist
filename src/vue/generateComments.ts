/**
 * mgaia-code-assist.generateComments
 * vue文件生成注释功能
 * 抽取props 和 emit
 */
import * as vscode from 'vscode'
import dayjs from 'dayjs'
export default vscode.commands.registerCommand(
  'mgaia-code-assist.generateComments',
  () => {
    // Get the active text editor
    // 获取活动文本编辑器
    const editor = vscode.window.activeTextEditor
    if (editor === undefined) return

    const document = editor.document
    // 获取当前选中
    // const selection = editor.selection
    // 获取选中的文本
    // const word = document.getText(selection)
    // 获取全部文本
    const word = document.getText()
    // 解析出的props
    let props: null | string[] = null
    // 通过正则 拆出props 先贪婪捕获
    const propsReg = /defineProps.*\)/s
    const propsCodeBlock = word.match(propsReg)
    if (propsCodeBlock === null) {
      void vscode.window.showInformationMessage('没有找到props')
    } else {
      // 为了兼容default() 默认值写法  前面采用了贪婪匹配
      // 所以这里需要再次匹配处理
      let count = 1
      let index = propsCodeBlock[0].indexOf('(')
      while (count !== 0) {
        index++
        if (propsCodeBlock[0][index] === '(') {
          count++
        } else if (propsCodeBlock[0][index] === ')') {
          count--
        }
      }
      propsCodeBlock[0] = propsCodeBlock[0].substring(0, index + 1)
      // 判断ts写法
      props = checkTs(propsCodeBlock[0])
      // 判断js写法
      if (props === null) {
        props = checkJs(propsCodeBlock[0])
      }
    }

    // 提取现有注释 如果存在 采用补充模式
    const existingNote = word.match(/<!--[\s\S]*?-->/s)
    const nowNote = existingNote !== null ? existingNote[0] : ''
    const note = buildNote(nowNote, props)
    void editor.edit((editBuilder) => {
      editBuilder.insert(new vscode.Position(0, 0), note)
      void vscode.window.showInformationMessage(
        'mgaia-code-assist.generateComments: 注释生成成功！'
      )
    })
  }
)

/**
 * 检查是否是ts写法
 * @param props
 */
function checkTs (word: string): null | string[] {
  const reg = /<.*>/s
  const result = word.match(reg)
  if (result === null) return null
  const props = result[0].substring(result[0].indexOf('{') + 1, result[0].lastIndexOf('}'))
  // 清理单行注释 以及空行
  const propsArray = props.split('\n')
  const cleanCommasPropsArray = []
  for (let i = 0; i < propsArray.length; i++) {
    propsArray[i] = propsArray[i].trim()
    if (propsArray[i].startsWith('//') || propsArray[i] === '') {
      propsArray.splice(i, 1)
      i--
    } else {
      cleanCommasPropsArray.push(...propsArray[i].split(',').filter((item) => item.trim() !== ''))
    }
  }
  // 冒号分隔整理
  const returnProps: string[] = []
  cleanCommasPropsArray.forEach((item) => {
    if (item.indexOf(':') < 1) return

    const itemArray = item.trim().split(':')
    returnProps.push(itemArray[0].trim())
  })

  return returnProps
}

/**
 * 检查是否是js写法
 * @param props
 */
function checkJs (word: string): null | string[] {
  const reg = /\(\{.*\}\)/s
  const result = word.match(reg)
  if (result === null) return null
  let props = result[0].substring(result[0].indexOf('(') + 1, result[0].lastIndexOf(')')).trim()

  // 清理首尾{}
  if (props[0] === '{') {
    props = props.substring(1, props.length)
  }
  if (props[props.length - 1] === '}') {
    props = props.substring(0, props.length - 1)
  }
  // 清理内部{}
  let leftIndex = props.indexOf('{')
  let rightIndex = props.indexOf('}')
  while (leftIndex !== -1) {
    props = props.substring(0, leftIndex) + props.substring(rightIndex + 1, props.length)
    leftIndex = props.indexOf('{')
    rightIndex = props.indexOf('}')
  }

  // 提取字段
  const propsArray = props.split('\n')
  const returnProps: string[] = []
  propsArray.forEach((item) => {
    const itemStr = item.split(':')[0].trim()
    if (itemStr === '' || itemStr.startsWith('//')) return
    returnProps.push(item.split(':')[0].trim())
  })
  return returnProps
}

/**
 * 构建注释
 * @param nowNote 当前注释
 * @param props 收集到的props参数
 */
function buildNote (nowNote: string, props: null | string[]): string {
  let note = ''
  // 如果当前没有注释 则生成注释
  if (nowNote === '') {
    note = '<!--\n'
    note += `====={${dayjs().format('YYYY-MM-DD HH:mm:ss')}}=====\n`
    if (props !== null) {
      note += 'props参数:\n'
      props.forEach((item) => {
        note += `  ${item}:\n`
      })
    }
    note += '-->\n'
    return note
  }
  // 如果只有单行注释 则在现有注释前面添加注释
  // ================  注释反写逻辑
  return note
}
