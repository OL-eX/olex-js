import { TokenizerResultsQueueType } from "../typings/Tokenizer.type"

/**
 * Tokenizer
 */
export class Tokenizer {
    private _text: string = ""
    constructor(text: string) {
        this._text = text
    }

    private static isAlphabet = (c: string) => /[a-zA-Z]/.test(c)

    private static isNumber = (c: string) => /[0-9]/.test(c)

    private static isNewline = (c: string) => c === "\n"

    private static isBackslash = (c: string) => c === "\\"

    private static isSpace = (c: string) => c === " "

    private static isComment = (c: string) => c === "%"

    private static isSpecial = (c: string) =>
        /[\!-\$&-\/\:-@\[-\]-`\{-\}-~]/.test(c)

    analyze = (): TokenizerResultsQueueType => {
        const _back: TokenizerResultsQueueType = []

        for (let pos = 0; pos < this._text.length; pos++) {
            const c = this._text[pos]
            if (Tokenizer.isAlphabet(c)) {
                _back.push(["AlphabetToken", c, pos])
                continue
            }

            if (Tokenizer.isNumber(c)) {
                _back.push(["NumberToken", c, pos])
                continue
            }

            if (Tokenizer.isSpace(c)) {
                _back.push(["SpaceToken", c, pos])
                continue
            }

            if (Tokenizer.isNewline(c)) {
                _back.push(["NewlineToken", c, pos])
                continue
            }

            if (Tokenizer.isBackslash(c)) {
                _back.push(["BackslashToken", c, pos])
                continue
            }

            if (Tokenizer.isComment(c)) {
                _back.push(["CommentToken", c, pos])
                continue
            }

            if (Tokenizer.isSpecial(c)) {
                _back.push(["SpecialToken", c, pos])
                continue
            }

            _back.push(["UnicodeToken", c, pos])
        }

        return _back
    }
}
