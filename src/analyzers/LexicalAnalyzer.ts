import {
    TokenizerResultsQueueType,
    TokenizerResultType,
    TokenType,
} from "../typings/Tokenizer.type"
import { LexicalAnalyzerResultsQueueType } from "../typings/LexicalAnalyzer.type"

/**
 * Lexical Analyzer
 */
export class LexicalAnalyzer {
    private _queue: TokenizerResultsQueueType = []
    private _pos: number = 0
    constructor(queue: TokenizerResultsQueueType) {
        this._queue = queue
    }

    private next = (): TokenizerResultType => {
        return this._queue[this._pos + 1]
    }

    // Generate TextLiteral
    private TextLiteralGenerator = (
        AllowNextTokenList: Array<TokenType>,
        except?: Array<string>
    ): string => {
        let _v = ""
        except = except || []
        while (
            !!this.next() &&
            (this.next()[1] === "*" ||
                (AllowNextTokenList.includes(this.next()[0]) &&
                    !except.includes(this.next()[1])))
        ) {
            _v += this.next()[1]
            this._pos++
        }
        return _v.trimEnd()
    }

    analyze = (): LexicalAnalyzerResultsQueueType => {
        const _back: LexicalAnalyzerResultsQueueType = []

        while (this._pos < this._queue.length) {
            const c = this._queue[this._pos]
            switch (c[0]) {
                // Handle `\`
                // TODO escape token
                case "BackslashToken": {
                    _back.push(["CommandLiteral", "\\"])
                    if (this.next()?.[0] === "AlphabetToken") {
                        const _v = this.TextLiteralGenerator([
                            "AlphabetToken",
                            "UnicodeToken",
                            "NumberToken",
                        ])

                        // Escape Token
                        switch (_v) {
                            case "newline": {
                                _back.push(["NewlineLiteral", _v])
                                break
                            }

                            case "textbackslash": {
                                _back.push(["TextLiteral", "\\"])
                                break
                            }

                            default: {
                                _back.push(["TextLiteral", _v])
                                break
                            }
                        }

                        this._pos++
                        break
                    }

                    if (this.next()?.[0] === "BackslashToken") {
                        _back.push(["NewlineLiteral", "\\\\"])
                        this._pos += 2
                        break
                    }

                    // Escape Special Token
                    if (this.next()?.[0] === "SpecialToken") {
                        const AllowEscapeToken: Array<string> = ["$"]
                        if (AllowEscapeToken.includes(this.next()?.[1])) {
                            _back.push(["TextLiteral", this.next()?.[1]])
                            this._pos++
                            break
                        }

                        this._pos++
                        break
                    }

                    this._pos++
                    break
                }

                // Handle Special Token
                case "SpecialToken": {
                    switch (c[1]) {
                        case "[": {
                            _back.push(["OpenBracketLiteral", "["])
                            if (this.next()?.[0] === "AlphabetToken") {
                                const _v = this.TextLiteralGenerator([
                                    "AlphabetToken",
                                    "UnicodeToken",
                                    "NumberToken",
                                    "SpaceToken",
                                ])
                                _back.push(["TextLiteral", _v])
                            } else {
                                this._pos++
                            }
                            break
                        }

                        case "]": {
                            _back.push(["CloseBracketLiteral", "]"])
                            this._pos++
                            break
                        }

                        // TODO refactor
                        case "{": {
                            _back.push(["OpenBraceLiteral", "{"])
                            if (this.next()?.[0] === "AlphabetToken") {
                                const _v = this.TextLiteralGenerator(
                                    [
                                        "AlphabetToken",
                                        "UnicodeToken",
                                        "NumberToken",
                                        "SpaceToken",
                                        "SpecialToken",
                                    ],
                                    ["{", "}"]
                                )
                                _back.push(["TextLiteral", _v])
                            } else {
                                this._pos++
                            }
                            break
                        }

                        case "}": {
                            _back.push(["CloseBraceLiteral", "}"])
                            this._pos++
                            break
                        }

                        // Handle `$` sign
                        // TODO 跳过默认的文本字面量生成, 减轻语法分析器负担
                        case "$": {
                            if (
                                this.next()?.[0] === "SpecialToken" &&
                                this.next()?.[1] === "$"
                            ) {
                                _back.push(["DollarLiteral", "$$"])
                                this._pos += 2
                                break
                            }

                            _back.push(["DollarLiteral", "$"])
                            this._pos++
                            break
                        }

                        default: {
                            if (this.next()?.[0] !== "NewlineToken") {
                                const AllowTextNext: Array<TokenType> = [
                                    "AlphabetToken",
                                    "NumberToken",
                                    "SpaceToken",
                                    "UnicodeToken",
                                    "SpecialToken",
                                ]
                                const _v = this.TextLiteralGenerator(
                                    AllowTextNext,
                                    ["[", "]", "{", "}", "$"]
                                )
                                _back.push(["TextLiteral", c[1] + _v])
                                this._pos++
                                break
                            }

                            _back.push(["SpecialLiteral", c[1]])
                            this._pos++
                            break
                        }
                    }
                    break
                }

                // Handle `%` sign
                case "CommentToken": {
                    _back.push(["CommentLiteral", "%"])

                    if (!!this.next() && this.next()[0] !== "NewlineToken") {
                        const _v = this.TextLiteralGenerator([
                            "AlphabetToken",
                            "BackslashToken",
                            "CommentToken",
                            "NumberToken",
                            "SpaceToken",
                            "SpecialToken",
                            "UnicodeToken",
                        ])
                        _back.push(["TextLiteral", _v.trim()])
                    } else {
                        this._pos++
                    }

                    break
                }

                // Handle `\n` sign
                case "NewlineToken": {
                    _back.push(["NewlineLiteral", "\n"])
                    this._pos++
                    break
                }

                // Handle raw text
                case "AlphabetToken":
                case "NumberToken":
                case "UnicodeToken":
                case "SpaceToken": {
                    const AllowTextNext: Array<TokenType> = [
                        "AlphabetToken",
                        "NumberToken",
                        "SpaceToken",
                        "UnicodeToken",
                    ]
                    if (AllowTextNext.includes(this.next()?.[0])) {
                        const _v = this.TextLiteralGenerator(AllowTextNext)
                        if (!!(c[1] + _v).trim()) {
                            _back.push(["TextLiteral", c[1] + _v])
                        }
                    }
                    this._pos++
                    break
                }

                // Default
                default: {
                    this._pos++
                    break
                }
            }
        }
        return _back
    }
}
