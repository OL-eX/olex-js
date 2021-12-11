import fs from "fs"
import path from "path"

import { LexicalAnalyzer } from "./LexicalAnalyzer"
import { Tokenizer } from "./Tokenizer"
import { GrammaticalAnalyzer } from "./GrammaticalAnalyzer"

test("should ", () => {
    const target = path.join(__dirname, "../../test.json")
    const content = fs
        .readFileSync(path.join(__dirname, "../../test.tex"))
        .toString()
    const tokenQueue = new Tokenizer(content).analyze()
    // console.log(tokenQueue)
    const literals = new LexicalAnalyzer(tokenQueue).analyze()
    // console.log(literals)
    const ast = new GrammaticalAnalyzer(literals).analyze()

    // fs.writeFileSync(target, JSON.stringify(ast))
    console.log("语法分析AST:\t", JSON.stringify(ast))
})
