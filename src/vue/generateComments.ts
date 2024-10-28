/**
 * mgaia-code-assist.generateComments
 * vue文件生成注释功能
 * 抽取props 和 emit
 */
import * as vscode from 'vscode'
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
    let props = null
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
    // js ts的注释方式
    // let annotate = '/**\n'
    // annotate += ` * 文件名: ${document.fileName}\n`
    // if (props !== null) {
    //   annotate += ' * props: \n'
    //   const propsArr = props.split('\n')
    //   propsArr.forEach((item) => {
    //     annotate += ` *   ${item}\n`
    //   })
    // }
    let annotate = '<!-- '
    annotate += `  文件名: ${document.fileName}\n`
    if (props !== null) {
      annotate += '  props: \n'
      const propsArr = props.split('\n')
      propsArr.forEach((item) => {
        if (item.trim() === '') return
        annotate += `  ${item}\n`
      })
    }
    annotate += '-->\n'

    void editor.edit((editBuilder) => {
      editBuilder.insert(new vscode.Position(0, 0), annotate)
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
function checkTs (word: string): null | string {
  const reg = /<.*>/s
  const result = word.match(reg)
  if (result === null) return null
  let props = result[0].substring(result[0].indexOf('{') + 1, result[0].length)
  props = props.substring(0, props.lastIndexOf('}'))
  props.trim()
  while (props[0] === '\n') {
    props = props.substring(1, props.length)
  }
  while (props[props.length - 1] === '\n') {
    props = props.substring(0, props.length - 1)
  }
  return props
}

/**
 * 检查是否是js写法
 * @param props
 */
function checkJs (word: string): null | string {
  const reg = /\(\{.*\}\)/s
  const result = word.match(reg)
  if (result === null) return null
  let props = result[0].substring(result[0].indexOf('(') + 1, result[0].lastIndexOf(')'))
  props.trim()
  while (props[0] === '\n') {
    props = props.substring(1, props.length)
  }
  while (props[props.length - 1] === '\n') {
    props = props.substring(0, props.length - 1)
  }
  return props
}
