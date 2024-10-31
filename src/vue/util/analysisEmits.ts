/**
 * 传入文本解析emits
 * @param word
 */
export default function analysisEmits (word: string): string[] | null {
  // 通过正则 拆出props 先贪婪捕获
  const emitsReg = /defineEmits.*\)/s
  const emitsCodeBlock = word.match(emitsReg)
  if (emitsCodeBlock === null) {
    return null
  } else {
    // 为了兼容default() 默认值写法  前面采用了贪婪匹配
    // 所以这里需要再次匹配处理
    let count = 1
    let index = emitsCodeBlock[0].indexOf('(')
    while (count !== 0) {
      index++
      if (emitsCodeBlock[0][index] === '(') {
        count++
      } else if (emitsCodeBlock[0][index] === ')') {
        count--
      }
    }
    emitsCodeBlock[0] = emitsCodeBlock[0].substring(0, index + 1)
    // 判断ts写法
    let emits = checkTs(emitsCodeBlock[0])
    // 判断js写法
    if (emits === null) {
      emits = checkJs(emitsCodeBlock[0])
    }
    return emits
  }
}

/**
 * 检查是否是ts写法
 * @param emits
 */
function checkTs (word: string): null | string[] {
  const reg = /<.*>/s
  const result = word.match(reg)
  if (result === null) return null
  const emits = result[0].substring(result[0].indexOf('{') + 1, result[0].lastIndexOf('}'))
  // 清理单行注释 以及空行
  const emitsArray = emits.split('\n')
  const cleanCommasEmitsArray = []
  for (let i = 0; i < emitsArray.length; i++) {
    emitsArray[i] = emitsArray[i].trim()
    if (emitsArray[i].startsWith('//') || emitsArray[i] === '') {
      emitsArray.splice(i, 1)
      i--
    } else {
      cleanCommasEmitsArray.push(emitsArray[i])
    }
  }
  // 冒号分隔整理
  const returnEmits: string[] = []
  cleanCommasEmitsArray.forEach((item) => {
    if (item.indexOf(':') < 1) return

    const itemArray = item.split(':')
    returnEmits.push(itemArray[0].trim())
  })

  return returnEmits
}

/**
 * 检查是否是js写法
 * @param emits
 */
function checkJs (word: string): null | string[] {
  const reg = /\(.*\)/s
  const result = word.match(reg)
  if (result === null) return null
  // 处理完成后存在两种模式
  // ['change', 'update']
  /**
{
  change: (id: number) => {
    // 返回 `true` 或 `false`
    // 表明验证通过或失败
  },
  update: (value: string) => {
    // 返回 `true` 或 `false`
    // 表明验证通过或失败
  }
}
   */

  let emits = result[0].trim().substring(1, result[0].length - 1)
  const returnEmits: string[] = []
  // 判断第一个字符是否是 '['
  if (emits[0] === '[') {
    emits.split(',').forEach((item) => {
      returnEmits.push(item.substring(item.indexOf("'") + 1, item.lastIndexOf("'")))
    })
    return returnEmits
  }

  if (emits[0] === '{') {
    emits = emits.substring(1, emits.length - 1).trim()
    emits.split('\n').forEach((item) => {
      returnEmits.push(item.split(':')[0].trim())
    })
    return returnEmits
  }

  return null
}
