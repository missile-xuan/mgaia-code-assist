/**
 * mgaia-code-assist.generateComments
 * vue文件生成注释功能
 * 抽取props 和 emit
 */
import * as vscode from 'vscode'
import dayjs from 'dayjs'
import analysisProps from './util/analysisProps'
import analysisEmits from './util/analysisEmits'
export default vscode.commands.registerCommand(
  'mgaia-code-assist.generateComments',
  () => {
    // Get the active text editor
    // 获取活动文本编辑器
    const editor = vscode.window.activeTextEditor
    if (editor === undefined) return

    const document = editor.document
    // 获取全部文本
    const word = document.getText()
    // ==============props==============
    // 解析出的props
    const props: null | string[] = analysisProps(word)

    // ==============emits==============
    const emits: null | string[] = analysisEmits(word)

    // 提取现有注释 如果存在 采用补充模式
    const existingNote = word.match(/^<!--[\s\S]*?-->/s)
    const nowNote = existingNote !== null ? existingNote[0] : ''
    const note = buildNote(nowNote, props, emits)

    void editor.edit((editBuilder) => {
      if (existingNote !== null) {
        editBuilder.replace(new vscode.Range(document.positionAt(word.indexOf('<!--')), document.positionAt(word.indexOf('-->') + 3)), note)
        const nextLine = document.lineAt(document.positionAt(word.indexOf('-->')).translate(1))
        if (nextLine.text.trim() === '') {
          const newRange = nextLine.range.with(nextLine.range.end.with(nextLine.range.end.line + 1))
          editBuilder.delete(newRange)
        }
      } else {
        editBuilder.insert(new vscode.Position(0, 0), note)
      }
      void vscode.window.showInformationMessage(
        'mgaia-code-assist.generateComments: 注释生成成功！'
      )
    })
  }
)

/**
 * 构建注释
 * @param nowNote 当前注释
 * @param props 收集到的props参数
 */
function buildNote (nowNote: string, props: null | string[], emits: null | string[]): string {
  let note = ''
  const nowNoteArray = nowNote.split('\n')
  const noteObj: { [key: string]: { [key: string]: string } } = {}
  let type = '--'
  // 判断是否是插件生成的注释
  // 如果当前没有注释 或者单行注释 则生成新注释加在最前方
  if (nowNoteArray.length > 1 && nowNoteArray[1].includes('====={')) {
    // 先将现有注释解析成json对象，方便后续处理
    for (let index = 2; index < nowNoteArray.length - 1; index++) {
      if (!nowNoteArray[index].startsWith('  ')) {
        // 非空格开头 则说明是分类节点
        type = nowNoteArray[index].trim()
        noteObj[type] = {}
      } else {
        nowNoteArray[index].substring(0, nowNoteArray[index].indexOf(':'))
        // 以冒号分隔
        noteObj[type][nowNoteArray[index].substring(0, nowNoteArray[index].indexOf(':')).trim()] = nowNoteArray[index].substring(nowNoteArray[index].indexOf(':') + 1, nowNoteArray[index].length).trim()
      }
    }
    nowNote = ''
  }

  // ================  注释反写逻辑

  // 新拉取的注释对象
  const newNoteObj: { [key: string]: { [key: string]: string } } = {}
  if (props !== null) {
    newNoteObj['props参数'] = {}
    props.forEach((item) => {
      if (noteObj['props参数']?.[item] !== undefined) {
        newNoteObj['props参数'][item] = noteObj['props参数'][item]
      } else {
        newNoteObj['props参数'][item] = ''
      }
    })
  }
  if (emits !== null) {
    newNoteObj['emits参数'] = {}
    emits.forEach((item) => {
      if (noteObj['emits参数']?.[item] !== undefined) {
        newNoteObj['emits参数'][item] = noteObj['emits参数'][item]
      } else {
        newNoteObj['emits参数'][item] = ''
      }
    })
  }
  note = '<!--\n'
  note += `====={${dayjs().format('YYYY-MM-DD HH:mm:ss')}}=====\n`
  for (const key in newNoteObj) {
    note += `${key}\n`
    for (const key2 in newNoteObj[key]) {
      note += `  ${key2}:${newNoteObj[key][key2]}\n`
    }
  }
  note += '-->'
  note += '\n'
  note += nowNote
  return note
}
