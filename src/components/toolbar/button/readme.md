# stylo-toolbar-button

<!-- Auto Generated Below -->

## Properties

| Property        | Attribute        | Description | Type      | Default     |
| --------------- | ---------------- | ----------- | --------- | ----------- |
| `cssClass`      | `css-class`      |             | `string`  | `undefined` |
| `disableAction` | `disable-action` |             | `boolean` | `false`     |

## Events

| Event    | Description | Type                   |
| -------- | ----------- | ---------------------- |
| `action` |             | `CustomEvent<UIEvent>` |

## Dependencies

### Used by

- [stylo-menus](../../menu)
- [stylo-toolbar](../toolbar)
- [stylo-toolbar-align](../actions/align)
- [stylo-toolbar-font-size](../actions/font-size)
- [stylo-toolbar-image](../actions/image)
- [stylo-toolbar-list](../actions/list)
- [stylo-toolbar-text](../actions/text)

### Graph

```mermaid
graph TD;
  stylo-menus --> stylo-toolbar-button
  stylo-toolbar --> stylo-toolbar-button
  stylo-toolbar-align --> stylo-toolbar-button
  stylo-toolbar-font-size --> stylo-toolbar-button
  stylo-toolbar-image --> stylo-toolbar-button
  stylo-toolbar-list --> stylo-toolbar-button
  stylo-toolbar-text --> stylo-toolbar-button
  style stylo-toolbar-button fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
