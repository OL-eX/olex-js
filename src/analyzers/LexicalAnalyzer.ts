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
        AllowNextTokenList: Array<TokenType>
    ): string => {
        let _v = ""
        while (
            !!this.next() &&
            (this.next()[1] === "*" ||
                AllowNextTokenList.includes(this.next()[0]))
        ) {
            _v += this.next()[1]
            this._pos++
        }
        return _v
    }

    analyze = (): LexicalAnalyzerResultsQueueType => {
        const _back: LexicalAnalyzerResultsQueueType = []

        while (this._pos < this._queue.length) {
            const c = this._queue[this._pos]
            switch (c[0]) {
                // Handle `\`
                case "BackslashToken": {
                    _back.push(["CommandLiteral", "\\"])
                    if (!!this.next() && this.next()[0] === "AlphabetToken") {
                        const _v = this.TextLiteralGenerator([
                            "AlphabetToken",
                            "UnicodeToken",
                            "NumberToken",
                        ])
                        _back.push(["TextLiteral", _v])
                    }
                    break
                }

                // Handle Special Token
                case "SpecialToken": {
                    switch (c[1]) {
                        case "[": {
                            _back.push(["OpenBracketLiteral", "["])
                            if (
                                !!this.next() &&
                                this.next()[0] === "AlphabetToken"
                            ) {
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

                        case "{": {
                            _back.push(["OpenBraceLiteral", "{"])
                            if (
                                !!this.next() &&
                                this.next()[0] === "AlphabetToken"
                            ) {
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

                        case "}": {
                            _back.push(["CloseBraceLiteral", "}"])
                            this._pos++
                            break
                        }

                        // Handle `$` sign
                        case "$": {
                            _back.push(["DollarLiteral", "$"])
                            this._pos++
                            break
                        }

                        default: {
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
                    const allowTextNext: Array<TokenType> = [
                        "AlphabetToken",
                        "NumberToken",
                        "SpaceToken",
                        "UnicodeToken",
                    ]
                    if (
                        !!this.next() &&
                        allowTextNext.includes(this.next()[0])
                    ) {
                        const _v = this.TextLiteralGenerator(allowTextNext)
                        _back.push(["TextLiteral", c[1] + _v])
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
