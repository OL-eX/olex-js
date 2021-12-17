export type FactorType = "comment" | "command" | "math" | "environment" | null

export type NodeType = "Command" | "Environment" | "Math" | "Text" | "Newline"

export interface IArgument {
    Type: "Optional" | "Compulsory"
    Nodes: Array<INode>
}

export interface INode {
    Name: string
    Type: NodeType
    Content?: Array<INode> | null
    Arguments?: Array<IArgument> | null
}


// TODO 处理Content语序逻辑导致的递归爆内存的问题, 修改 INode 标准节点
// Experimental
// export interface INodeNext {
//     Type: NodeType
//     Value: string
//     Arguments?: Array<IArgument>
//     Depth: number
// }
