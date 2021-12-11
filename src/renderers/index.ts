import { INode } from "../typings/GrammaticalAnalyzer.type"

export class Renderer {
    private _tree: Array<INode> = []
    constructor(tree: Array<INode>) {
        this._tree = tree
    }

    render = () => {}
}
