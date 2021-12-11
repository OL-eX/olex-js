export type FactorType =
    | "comment"
    | "command"
    | "math"
    | "environment"
    | null

export type NodeType = "Command" | "Environment" | "Math" | "Text"

export interface INode {
    Name: string
    Type: NodeType
    Content?: Array<INode | string> | null
    OptionalArguments?: Array<INode> | null
    CompulsoryArguments?: Array<INode> | null
}
