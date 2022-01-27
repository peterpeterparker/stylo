# stylo-toolbar-font-size

<!-- Auto Generated Below -->

## Properties

| Property   | Attribute   | Description | Type                                                                                                                                                                                      | Default     |
| ---------- | ----------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `fontSize` | `font-size` |             | `ToolbarFontSize.LARGE \| ToolbarFontSize.MEDIUM \| ToolbarFontSize.SMALL \| ToolbarFontSize.XXX_LARGE \| ToolbarFontSize.XX_LARGE \| ToolbarFontSize.X_LARGE \| ToolbarFontSize.X_SMALL` | `undefined` |

## Events

| Event         | Description | Type                             |
| ------------- | ----------- | -------------------------------- |
| `execCommand` |             | `CustomEvent<ExecCommandAction>` |

## Dependencies

### Used by

- [stylo-toolbar](../../toolbar)

### Depends on

- [stylo-toolbar-button](../../../button)

### Graph

```mermaid
graph TD;
  stylo-toolbar-font-size --> stylo-toolbar-button
  stylo-toolbar --> stylo-toolbar-font-size
  style stylo-toolbar-font-size fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
