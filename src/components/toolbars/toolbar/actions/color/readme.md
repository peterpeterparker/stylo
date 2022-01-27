# stylo-toolbar-color

<!-- Auto Generated Below -->

## Properties

| Property       | Attribute | Description | Type                            | Default     |
| -------------- | --------- | ----------- | ------------------------------- | ----------- |
| `action`       | `action`  |             | `"background-color" \| "color"` | `undefined` |
| `containerRef` | --        |             | `HTMLElement`                   | `undefined` |

## Events

| Event         | Description | Type                             |
| ------------- | ----------- | -------------------------------- |
| `execCommand` |             | `CustomEvent<ExecCommandAction>` |

## Dependencies

### Used by

- [stylo-toolbar](../../toolbar)

### Depends on

- [stylo-color](../../../../color/color)

### Graph

```mermaid
graph TD;
  stylo-toolbar-color --> stylo-color
  stylo-color --> stylo-color-input
  stylo-toolbar --> stylo-toolbar-color
  style stylo-toolbar-color fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
