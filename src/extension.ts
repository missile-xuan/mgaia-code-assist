// The module 'vscode' contains the VS Code extensibility API
// 模块“vscode”包含VS Code可扩展性API

// Import the module and reference it with the alias vscode in your code below
// 导入模块，并在下面的代码中使用别名vscode引用它
import * as vscode from 'vscode'
import generateComments from './vue/generateComments'

// This method is called when your extension is activated
// //当您的扩展被激活时，会调用此方法
// Your extension is activated the very first time the command is executed
// 第一次执行命令时激活您的扩展
export function activate (context: vscode.ExtensionContext): void {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // 使用控制台输出诊断信息（console.log）和错误（console.error）
  // This line of code will only be executed once when your extension is activated
  // 当您的扩展被激活时，此行代码将仅执行一次
  console.log(
    'Congratulations, your extension "mgaia-code-assist" is now active!'
  )

  // The command has been defined in the package.json file
  // 现在在package.json文件中已经定义了命令
  // Now provide the implementation of the command with registerCommand
  // 现在使用registerCommand提供命令的实现
  // The commandId parameter must match the command field in package.json
  // commandId参数必须与package.json中的command字段匹配
  const disposable = vscode.commands.registerCommand(
    'mgaia-code-assist.helloWorld',
    () => {
      // The code you place here will be executed every time your command is executed
      // 您在此处放置的代码将在每次执行命令时执行
      // Display a message box to the user
      // 向用户显示消息框
      return vscode.window.showInformationMessage(
        'Hello World from mgaia-code-assist!'
      )
    }
  )
  context.subscriptions.push(disposable)
  context.subscriptions.push(generateComments)
}

// This method is called when your extension is deactivated
// 当您的扩展被停用时，会调用此方法
export function deactivate (): void {}
