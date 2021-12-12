export type FactorType = "comment" | "command" | "math" | "environment" | null

export type NodeType = "Command" | "Environment" | "Math" | "Text"

export interface IArgument {
    Type: "Optional" | "Compulsory"
    Nodes: Array<INode>
}

export interface INode {
    Name: string
    Type: NodeType
    Content?: Array<INode | string> | null
    Arguments?: Array<IArgument> | null
}
