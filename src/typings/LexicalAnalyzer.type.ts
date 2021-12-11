export type LiteralType =
    | "TextLiteral"
    | "CommandLiteral"
    | "OpenBracketLiteral"
    | "CloseBracketLiteral"
    | "OpenBraceLiteral"
    | "CloseBraceLiteral"
    | "CommentLiteral"
    | "NewlineLiteral"
    | "DollarLiteral"
    | "SpecialLiteral"

export type LexicalAnalyzerResultType = [LiteralType, string]

export type LexicalAnalyzerResultsQueueType = Array<LexicalAnalyzerResultType>
