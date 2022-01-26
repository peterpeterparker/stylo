# stylo-toolbar-style

<!-- Auto Generated Below -->

## Properties

| Property        | Attribute        | Description | Type      | Default     |
| --------------- | ---------------- | ----------- | --------- | ----------- |
| `bold`          | `bold`           |             | `boolean` | `undefined` |
| `disabledTitle` | `disabled-title` |             | `boolean` | `false`     |
| `italic`        | `italic`         |             | `boolean` | `undefined` |
| `strikethrough` | `strikethrough`  |             | `boolean` | `undefined` |
| `underline`     | `underline`      |             | `boolean` | `undefined` |

## Events

| Event         | Description | Type                             |
| ------------- | ----------- | -------------------------------- |
| `execCommand` |             | `CustomEvent<ExecCommandAction>` |

## Dependencies

### Used by

- [stylo-toolbar](../../toolbar)

### Depends on

- [stylo-toolbar-button](../../button)

### Graph

```mermaid
graph TD;
  stylo-toolbar-text --> stylo-toolbar-button
  stylo-toolbar --> stylo-toolbar-text
  style stylo-toolbar-text fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
