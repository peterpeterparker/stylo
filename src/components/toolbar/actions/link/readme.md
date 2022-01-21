# stylo-toolbar-link

<!-- Auto Generated Below -->

## Properties

| Property         | Attribute         | Description | Type                                                                                                                                                                                                                | Default     |
| ---------------- | ----------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `anchorLink`     | --                |             | `ToolbarAnchorLink`                                                                                                                                                                                                 | `undefined` |
| `containerRef`   | --                |             | `HTMLElement`                                                                                                                                                                                                       | `undefined` |
| `linkCreated`    | --                |             | `EventEmitter<HTMLElement>`                                                                                                                                                                                         | `undefined` |
| `toolbarActions` | `toolbar-actions` |             | `ToolbarActions.ALIGNMENT \| ToolbarActions.BACKGROUND_COLOR \| ToolbarActions.COLOR \| ToolbarActions.FONT_SIZE \| ToolbarActions.IMAGE \| ToolbarActions.LINK \| ToolbarActions.LIST \| ToolbarActions.SELECTION` | `undefined` |

## Events

| Event          | Description | Type                   |
| -------------- | ----------- | ---------------------- |
| `linkModified` |             | `CustomEvent<boolean>` |

## Dependencies

### Used by

- [stylo-toolbar](../../toolbar)

### Graph

```mermaid
graph TD;
  stylo-toolbar --> stylo-toolbar-link
  style stylo-toolbar-link fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
