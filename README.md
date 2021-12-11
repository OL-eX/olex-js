# Olex

The document is prowered by Vditor!

## Design

Olex is a pluggable TeX transformer, the architecture as followed:

```mindmap
- Olex
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
      - Semantic Analyzer
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
