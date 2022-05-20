# stylo-list

<!-- Auto Generated Below -->

## Events

| Event           | Description                                            | Type                       |
| --------------- | ------------------------------------------------------ | -------------------------- |
| `applyPlugin`   | Emit which plugin the user want to apply.              | `CustomEvent<StyloPlugin>` |
| `cancelPlugins` | Emit when user actually do not want to apply a plugin. | `CustomEvent<void>`        |

## Methods

### `focusFirstButton() => Promise<void>`

#### Returns

Type: `Promise<void>`

## CSS Custom Properties

| Name                             | Description                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| `--stylo-list-background-active` | Background on focus and hover in the list @default --light (see \_variables.scss)     |
| `--stylo-list-border-active`     | Border on focus and hover in the list @default 1px solid var(--background-active)     |
| `--stylo-list-color-active`      | Color on focus and hover in the list @default --light-contrast (see \_variables.scss) |

## Dependencies

### Used by

- [stylo-plugins](../plugins)

### Graph

```mermaid
graph TD;
  stylo-plugins --> stylo-list
  style stylo-list fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
