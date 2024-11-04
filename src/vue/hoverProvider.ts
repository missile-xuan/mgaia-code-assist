/**
 * 组件上鼠标悬浮 显示组件注释信息
 */
import * as vscode from 'vscode'
export default async function hoverProvider (document: vscode.TextDocument, position: vscode.Position): Promise<vscode.MarkdownString | undefined> {
  // 获取位置 获取当前分词
  const word = document.getText(document.getWordRangeAtPosition(position))
  console.log('word', word)
  const regex = new RegExp('<' + word + '(\\b|\\s|\\/)', 's')
  const expand = document.getWordRangeAtPosition(position, regex)
  if (expand === undefined) {
    // 不是组件 直接返还
    return undefined
  }
  // 判断当前分词是否为组件
  // 判断规则 前一个字符为< 后一个字符为' ' 或 /
  // const previous = document.getText(document.getWordRangeAtPosition(position.with(position.line, position.character - 1), /./s))
  // const next = document.getText(document.getWordRangeAtPosition(position.with(position.line, position.character + word.length), /./s))

  // 通过正则匹配文件
  const regImport = new RegExp('import\\s' + word + '\\sfrom\\s[\'|"].*vue[\'|"]')
  const documentStr = document.getText()
  const importStrMatch = documentStr.match(regImport)
  if (importStrMatch === null) return undefined

  let importStr = importStrMatch[0].split("'")[1]
  let fileUri: vscode.Uri
  if (importStr[0] === '.') {
    fileUri = vscode.Uri.joinPath(document.uri, '../')
    fileUri = vscode.Uri.joinPath(fileUri, importStr)
    if (fileUri === undefined) return undefined
  } else {
    importStr = importStr.substring(importStr.indexOf('/'), importStr.length)
    const uris = await vscode.workspace.findFiles('**' + importStr, '**/node_modules/**', 1)
    console.log('uris', uris)
    if (uris.length === 0) return undefined
    fileUri = uris[0]
  }
  const fileText = (await vscode.workspace.openTextDocument(fileUri)).getText()
  const existingNote = fileText.match(/<!--[\s\S]*?-->/s)
  if (existingNote === null) return undefined
  const returnText = existingNote[0].substring(existingNote[0].indexOf('\n'), existingNote[0].lastIndexOf('\n')).trim()
  const markdownString = new vscode.MarkdownString()
  returnText.split('\n').forEach((item, index) => {
    if (item[0] !== ' ') {
      item = '#### ' + item
    } else {
      item = '* ' + item
    }
    markdownString.appendMarkdown(item + '  \n')
  })
  return markdownString
}
