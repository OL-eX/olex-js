# OLeX

<img src="./docs/OLeX.svg" width="100" />

The document is prowered by Vditor!

## Design

<img src="./docs/OLeX.png" width="80" /> is a pluggable TeX transformer, the architecture as followed:

```mindmap
- OLeX
  - Before Analysis
    - Preprocessor
      - CRLF Handler
      - Pre Formatter
      - Mounter
  - Analyzing
    - Analyzer
      - Tokenizer
      - Lexical Analyzer
      - Grammatical Analyzer
      - Semantic Analyzer (desperated)
      - Return Abstract Syntax Tree
  - Rendering
    - Renderer
      - Walk through AST
      - Match mounted renderer unit
      - Return HTML
  - After Rendering
    - Callback Promise
  - Shortcuts
```

## State Machine

```graphviz
digraph Command {
  CommandLiteral -> TextLiteral;
  TextLiteral -> OpenBracketLiteral;
  TextLiteral -> OpenBraceLiteral;
  OpenBracketLiteral -> CommandLiteral -> CloseBracketLiteral -> OpenBraceLiteral;
  OpenBraceLiteral -> CommandLiteral -> CloseBraceLiteral -> OpenBracketLiteral;
}
```
