# stylo-toolbar-align

<!-- Auto Generated Below -->


## Properties

| Property       | Attribute | Description | Type                                                             | Default     |
| -------------- | --------- | ----------- | ---------------------------------------------------------------- | ----------- |
| `align`        | `align`   |             | `ToolbarAlign.CENTER \| ToolbarAlign.LEFT \| ToolbarAlign.RIGHT` | `undefined` |
| `anchorEvent`  | --        |             | `MouseEvent \| TouchEvent`                                       | `undefined` |
| `containerRef` | --        |             | `HTMLElement`                                                    | `undefined` |


## Events

| Event           | Description | Type               |
| --------------- | ----------- | ------------------ |
| `alignModified` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [stylo-toolbar](../../toolbar)

### Depends on

- [stylo-toolbar-button](../../button)

### Graph
```mermaid
graph TD;
  stylo-toolbar-align --> stylo-toolbar-button
  stylo-toolbar --> stylo-toolbar-align
  style stylo-toolbar-align fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
