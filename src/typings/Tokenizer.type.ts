export type TokenType =
    | "AlphabetToken"
    | "NumberToken"
    | "SpaceToken"
    | "NewlineToken"
    | "BackslashToken"
    | "CommentToken"
    | "SpecialToken"
    | "UnicodeToken"

export type TokenizerResultType = [TokenType, string, number]

export type TokenizerResultsQueueType = Array<TokenizerResultType>
