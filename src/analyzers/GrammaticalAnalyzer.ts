import {
    FactorType,
    INode,
    NodeType,
} from "../typings/GrammaticalAnalyzer.type"
import {
    LexicalAnalyzerResultsQueueType,
    LexicalAnalyzerResultType,
    LiteralType,
} from "../typings/LexicalAnalyzer.type"

/**
 * 采用字符串拼接实现状态机的嵌套
 */
export class GrammaticalAnalyzer {
    private _queue: LexicalAnalyzerResultsQueueType = []
    private _pos: number = 0
    private _res: string = ""
    private _factors: Array<FactorType> = []
    private _bracketCloseCount = 0
    private _braceCloseCount = 0
    constructor(queue: LexicalAnalyzerResultsQueueType) {
        this._queue = queue
    }

    private next = () => this._queue[this._pos + 1]

    private removeFactorsValue = (val: FactorType) => {
        if (this._factors.includes(val)) {
            for (let i = 0; i < this._factors.length; i++) {
                if (this._factors[i] === val) {
                    this._factors.splice(i, 1)
                    break
                }
            }
        }
    }

    private EnvironmentTextNodeGenerator = (
        AllowLiteralList: Array<LiteralType>,
        except?: Array<string>
    ) => {
        let _v = ""
        while (
            !!this.next() &&
            AllowLiteralList.includes(this.next()[0]) &&
            !except.includes(this.next()[1])
        ) {
            if (this.next()[0] === "NewlineLiteral") {
                this._pos++
                continue
            }
            _v += this.next()[1]
            this._pos++
        }
        return _v
    }

    private static addBracketOpen = () => "["

    private static addBracketClose = () => "], "

    private static addBraceClose = () => "}, "

    private static addNodeOpen = () => `{"Name":`

    private static addNodeArgumentsOpen = () => `, "Arguments": [`

    private static addNodeArguments = (type: "Optional" | "Compulsory") =>
        `{"Type": "${type}", "Nodes": [`

    private static addNodeType = (type: NodeType) => `, "Type": "${type}"`

    private static addSimpleNode = (name: string, type: NodeType) =>
        `{"Name": "${name}", "Type": "${type}"}, `

    private static deepClone = (raw: any) => JSON.parse(JSON.stringify(raw))

    private removeWrongComma = () => {
        if (this._res.charAt(this._res.length - 2) === ",") {
            this._res = this._res.slice(0, this._res.length - 2)
        }
    }

    private polish = (): Array<INode> => {
        const raw_tree: Array<INode> = JSON.parse(this._res) as Array<INode>
        const envs_stack: Array<INode> = []
        let depth: number = -1
        const _back = []
        for (let i = 0; i < raw_tree.length; i++) {
            const item = raw_tree[i]
            if (item.Type === "Environment") {
                if (item.Name === "begin") {
                    envs_stack.push(item)
                    depth++
                    continue
                }

                if (item.Name === "end") {
                    if (depth > 0) {
                        depth--
                        const self = envs_stack.pop()
                        if (!!envs_stack[depth].Content) {
                            envs_stack[depth].Content.push(
                                GrammaticalAnalyzer.deepClone(self)
                            )
                        } else {
                            envs_stack[depth].Content = [
                                GrammaticalAnalyzer.deepClone(self),
                            ]
                        }
                    } else {
                        _back.push(
                            GrammaticalAnalyzer.deepClone(envs_stack.pop())
                        )
                        depth--
                    }
                    continue
                }
            }

            if (depth !== -1) {
                if (!!envs_stack[depth].Content) {
                    envs_stack[depth].Content.push(
                        GrammaticalAnalyzer.deepClone(item)
                    )
                } else {
                    envs_stack[depth].Content = [
                        GrammaticalAnalyzer.deepClone(item),
                    ]
                }
            } else {
                _back.push(item)
            }
        }
        return _back
    }

    private handleLiterals = (c: LexicalAnalyzerResultType) => {
        switch (c[0]) {
            case "CommandLiteral": {
                this._res += GrammaticalAnalyzer.addNodeOpen()
                this._factors = ["command"]
                this._braceCloseCount++
                break
            }

            case "OpenBracketLiteral": {
                this._res += GrammaticalAnalyzer.addNodeArguments("Optional")
                this._bracketCloseCount++
                break
            }

            case "OpenBraceLiteral": {
                this._res += GrammaticalAnalyzer.addNodeArguments("Compulsory")
                this._braceCloseCount++
                break
            }

            case "CloseBracketLiteral": {
                this.removeWrongComma()
                if (!!this._bracketCloseCount) {
                    this._res +=
                        GrammaticalAnalyzer.addBracketClose().slice(0, 1) +
                        GrammaticalAnalyzer.addBraceClose()
                }

                const AllowArgumentsNext: Array<LiteralType> = [
                    "OpenBraceLiteral",
                    "OpenBracketLiteral",
                ]

                if (!AllowArgumentsNext.includes(this.next()[0])) {
                    this.removeWrongComma()
                    this._res += "]}, "
                }

                this._bracketCloseCount--
                break
            }

            case "CloseBraceLiteral": {
                this.removeWrongComma()
                if (!!this._braceCloseCount) {
                    this._res +=
                        GrammaticalAnalyzer.addBracketClose().slice(0, 1) +
                        GrammaticalAnalyzer.addBraceClose()
                }

                const AllowArgumentsNext: Array<LiteralType> = [
                    "OpenBraceLiteral",
                    "OpenBracketLiteral",
                ]

                if (!AllowArgumentsNext.includes(this.next()[0])) {
                    this.removeWrongComma()
                    this._res += "]}, "
                }
                this._braceCloseCount--
                break
            }

            case "CommentLiteral": {
                this._factors = ["comment"]
                break
            }

            case "DollarLiteral": {
                // TODO
                // this._factors.includes("math")
                //     ? this.removeFactorsValue("math")
                //     : this._factors.push("math")
                // const _v = this.EnvironmentTextNodeGenerator(
                //     ["CommentLiteral", "SpecialLiteral", "TextLiteral"],
                //     []
                // )
                // if (!!_v) {
                //     this._res += GrammaticalAnalyzer.addSimpleNode(
                //         "",
                //         "Math",
                //         _v
                //     )
                // }

                break
            }

            case "TextLiteral": {
                // TODO 处理文本字面量合并操作
                if (this._factors.includes("comment")) {
                    this.removeFactorsValue("comment")
                    break
                }

                if (this._factors.includes("command")) {
                    this.removeFactorsValue("command")
                    this._res += `"${c[1]}"`

                    if (["begin", "end"].includes(c[1])) {
                        if (c[1] === "begin") {
                            this._factors.push("environment")
                        } else {
                            this.removeFactorsValue("environment")
                        }

                        this._res +=
                            GrammaticalAnalyzer.addNodeType("Environment") +
                            GrammaticalAnalyzer.addNodeArgumentsOpen()
                        break
                    }

                    this._res +=
                        GrammaticalAnalyzer.addNodeType("Command") +
                        GrammaticalAnalyzer.addNodeArgumentsOpen()

                    // Handle next literal !== `{`
                    const AllowLiteralNext: Array<LiteralType> = [
                        "OpenBraceLiteral",
                        "OpenBracketLiteral",
                    ]
                    if (!AllowLiteralNext.includes(this.next()[0])) {
                        this._res += "]}, "
                    }
                    break
                }

                if (this._factors.includes("environment")) {
                    // TODO 主导环境内文本字面量合并操作
                    const _text = this.EnvironmentTextNodeGenerator(
                        ["SpecialLiteral", "TextLiteral", "NewlineLiteral"],
                        ["\\", "{", "}", "[", "}", "$"]
                    )
                    if (!!_text) {
                        this._res += GrammaticalAnalyzer.addSimpleNode(
                            _text,
                            "Text"
                        )
                    } else {
                        this._res += GrammaticalAnalyzer.addSimpleNode(
                            c[1],
                            "Text"
                        )
                    }
                    break
                }

                this._res += GrammaticalAnalyzer.addSimpleNode(c[1], "Text")
                break
            }

            case "SpecialLiteral": {
                const _text = this.EnvironmentTextNodeGenerator(
                    ["SpecialLiteral", "TextLiteral", "NewlineLiteral"],
                    ["\\", "{", "}", "[", "}", "$"]
                )

                console.log(_text)

                this._res += GrammaticalAnalyzer.addSimpleNode(
                    c[1] + _text,
                    "Text"
                )
            }
        }
    }

    analyze = () => {
        this._res += GrammaticalAnalyzer.addBracketOpen()
        while (this._pos < this._queue.length) {
            const c = this._queue[this._pos]
            this.handleLiterals(c)
            this._pos++
        }

        this._res = this._res.slice(0, this._res.length - 2)
        this._res += "]"
        const _back = this.polish()
        return _back
    }
}
