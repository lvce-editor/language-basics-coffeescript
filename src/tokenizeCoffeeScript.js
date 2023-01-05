/**
 * @enum number
 */
export const State = {
  TopLevelContent: 1,
  InsideDoubleQuoteString: 2,
  InsideSingleQuoteString: 3,
}

export const StateMap = {
  [State.TopLevelContent]: 'TopLevelContent',
}

/**
 * @enum number
 */
export const TokenType = {
  None: 0,
  Text: 1,
  Comment: 2,
  Whitespace: 3,
  VariableName: 4,
  Punctuation: 5,
  Numeric: 6,
  String: 7,
  LanguageConstant: 8,
  Keyword: 9,
  KeywordImport: 215,
  KeywordControl: 881,
  KeywordModifier: 882,
  KeywordReturn: 883,
  KeywordNew: 884,
  FunctionName: 885,
  KeywordThis: 886,
  KeywordOperator: 887,
  Regex: 888,
}

export const TokenMap = {
  [TokenType.Text]: 'Text',
  [TokenType.Comment]: 'Comment',
  [TokenType.Whitespace]: 'Whitespace',
  [TokenType.VariableName]: 'VariableName',
  [TokenType.Punctuation]: 'Punctuation',
  [TokenType.Numeric]: 'Numeric',
  [TokenType.String]: 'String',
  [TokenType.KeywordImport]: 'KeywordImport',
  [TokenType.KeywordControl]: 'KeywordControl',
  [TokenType.KeywordModifier]: 'KeywordModifier',
  [TokenType.KeywordReturn]: 'KeywordReturn',
  [TokenType.KeywordNew]: 'KeywordNew',
  [TokenType.FunctionName]: 'Function',
  [TokenType.KeywordThis]: 'KeywordThis',
  [TokenType.KeywordOperator]: 'KeywordOperator',
  [TokenType.LanguageConstant]: 'LanguageConstant',
  [TokenType.Keyword]: 'Keyword',
  [TokenType.Regex]: 'Regex',
}

const RE_LINE_COMMENT = /^\/\/[^\n]*/
const RE_WHITESPACE = /^\s+/
const RE_VARIABLE_NAME = /^[\@a-zA-Z\_\-\$][a-zA-Z\_\/\-\$#\d\-]*/
const RE_PUNCTUATION = /^[:,;\{\}\[\]\.=\(\)<>\!\|\+\&\>\)]/
const RE_NUMERIC =
  /^((0(x|X)[0-9a-fA-F]*)|(([0-9]+\.?[0-9]*)|(\.[0-9]+))((e|E)(\+|-)?[0-9]+)?)\b/
const RE_STRING_ESCAPE = /^\\./
const RE_BACKSLASH_AT_END = /^\\$/
const RE_ANYTHING = /^.+/s
const RE_QUOTE_DOUBLE = /^"/
const RE_QUOTE_SINGLE = /^'/
const RE_STRING_DOUBLE_QUOTE_CONTENT = /^[^"\\]+/
const RE_STRING_SINGLE_QUOTE_CONTENT = /^[^'\\]+/
const RE_KEYWORD =
  /^(?:and|arguments|async|await|break|by|case|catch|class|const|debugger|default|delete|do|else|enum|export|extends|false|finally|for|function|if|implements|import|in|Infinity|instanceof|interface|is|isnt|let|loop|NaN|native|new|no|not|null|of|off|on|or|package|private|protected|public|return|static|super|switch|then|this|throw|try|true|typeof|undefined|unless|var|void|when|while|with|yes)\b/
// copied from https://github.com/PrismJS/prism/blob/master/components/prism-javascript.js#L57
const RE_REGEX =
  /^((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/
const RE_SLASH = /^\//
const RE_ANYTHING_UNTIL_END = /^.+/s
const RE_FUNCTION_CALL_NAME = /^[\@\w]+(?=\s*('|\=\s*function|\=\s*\(|\?\(|\())/

export const initialLineState = {
  state: 1,
  tokens: [],
}

export const hasArrayReturn = true

/**
 * @param {string} line
 * @param {any} lineState
 */
export const tokenizeLine = (line, lineState) => {
  let next = null
  let index = 0
  let tokens = []
  let token = TokenType.None
  let state = lineState.state
  while (index < line.length) {
    const part = line.slice(index)
    switch (state) {
      case State.TopLevelContent:
        if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.TopLevelContent
        } else if ((next = part.match(RE_KEYWORD))) {
          switch (next[0]) {
            case 'true':
            case 'false':
            case 'null':
            case 'on':
            case 'off':
            case 'yes':
            case 'no':
            case 'undefined':
              token = TokenType.LanguageConstant
              break
            case 'import':
            case 'export':
            case 'from':
              token = TokenType.KeywordImport
              break
            case 'as':
            case 'switch':
            case 'default':
            case 'case':
            case 'else':
            case 'then':
            case 'if':
            case 'break':
            case 'throw':
            case 'for':
            case 'try':
            case 'catch':
            case 'finally':
            case 'while':
            case 'when':
            case 'unless':
              token = TokenType.KeywordControl
              break
            case 'async':
            case 'await':
              token = TokenType.KeywordModifier
              break
            case 'return':
              token = TokenType.KeywordReturn
              break
            case 'new':
              token = TokenType.KeywordNew
              break
            case 'this':
              token = TokenType.KeywordThis
              break
            case 'delete':
            case 'typeof':
            case 'in':
            case 'instanceof':
            case 'and':
            case 'is':
            case 'isnt':
              token = TokenType.KeywordOperator
              break
            default:
              token = TokenType.Keyword
              break
          }
          state = State.TopLevelContent
        } else if ((next = part.match(RE_PUNCTUATION))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else if ((next = part.match(RE_FUNCTION_CALL_NAME))) {
          token = TokenType.FunctionName
          state = State.TopLevelContent
        } else if ((next = part.match(RE_VARIABLE_NAME))) {
          token = TokenType.VariableName
          state = State.TopLevelContent
        } else if ((next = part.match(RE_NUMERIC))) {
          token = TokenType.Numeric
          state = State.TopLevelContent
        } else if ((next = part.match(RE_SLASH))) {
          if ((next = part.match(RE_REGEX))) {
            token = TokenType.Regex
            state = State.TopLevelContent
          } else {
            next = part.match(RE_SLASH)
            token = TokenType.Punctuation
            state = State.TopLevelContent
          }
        } else if ((next = part.match(RE_QUOTE_DOUBLE))) {
          token = TokenType.Punctuation
          state = State.InsideDoubleQuoteString
        } else if ((next = part.match(RE_QUOTE_SINGLE))) {
          token = TokenType.Punctuation
          state = State.InsideSingleQuoteString
        } else if ((next = part.match(RE_LINE_COMMENT))) {
          token = TokenType.Comment
          state = State.TopLevelContent
        } else if ((next = part.match(RE_NUMERIC))) {
          token = TokenType.Numeric
          state = State.TopLevelContent
        } else if ((next = part.match(RE_ANYTHING))) {
          token = TokenType.Text
          state = State.TopLevelContent
        } else {
          part //?
          throw new Error('no')
        }
        break
      case State.InsideDoubleQuoteString:
        if ((next = part.match(RE_QUOTE_DOUBLE))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else if ((next = part.match(RE_STRING_DOUBLE_QUOTE_CONTENT))) {
          token = TokenType.String
          state = State.InsideDoubleQuoteString
        } else if ((next = part.match(RE_STRING_ESCAPE))) {
          token = TokenType.String
          state = State.InsideDoubleQuoteString
        } else if ((next = part.match(RE_BACKSLASH_AT_END))) {
          token = TokenType.String
          state = State.InsideDoubleQuoteString
        } else {
          throw new Error('no')
        }
        break
      case State.InsideSingleQuoteString:
        if ((next = part.match(RE_QUOTE_SINGLE))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else if ((next = part.match(RE_STRING_SINGLE_QUOTE_CONTENT))) {
          token = TokenType.String
          state = State.InsideSingleQuoteString
        } else if ((next = part.match(RE_STRING_ESCAPE))) {
          token = TokenType.String
          state = State.InsideSingleQuoteString
        } else if ((next = part.match(RE_BACKSLASH_AT_END))) {
          token = TokenType.String
          state = State.InsideSingleQuoteString
        } else {
          throw new Error('no')
        }
        break
      default:
        throw new Error('no')
    }
    const tokenLength = next[0].length
    index += tokenLength
    tokens.push(token, tokenLength)
  }
  return {
    state,
    tokens,
  }
}
