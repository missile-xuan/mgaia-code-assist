import * as assert from 'assert'

// You can import and use all API from the 'vscode' module
// 您可以从“vscode”模块导入并使用所有API

// as well as import your extension to test it
// 以及导入您的扩展进行测试
import * as vscode from 'vscode'
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
  void vscode.window.showInformationMessage('Start all tests.')
  test('Sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5))
    assert.strictEqual(-1, [1, 2, 3].indexOf(0))
  })
})
