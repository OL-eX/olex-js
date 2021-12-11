import { Tokenizer } from "./Tokenizer"
import { LexicalAnalyzer } from "./LexicalAnalyzer"
import { GrammaticalAnalyzer } from "./GrammaticalAnalyzer"

export class Analyzer {
    private _text: string = ""
    constructor(text: string) {
        this._text = text
    }

    analyze = () => {
        const tokens = new Tokenizer(this._text).analyze()
        const literals = new LexicalAnalyzer(tokens).analyze()
        const ast = new GrammaticalAnalyzer(literals).analyze()
        return ast
    }
}