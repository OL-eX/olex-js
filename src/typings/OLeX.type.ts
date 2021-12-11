import { INode } from "./GrammaticalAnalyzer.type"

export type OLeXContext = null

export type RendererFunction = (node: INode, ctx: OLeXContext) => string

export type RendererType = Map<string, RendererFunction>

export interface IPackage {
    name: string
    author: string
    version: string
    renderers: RendererType
}
