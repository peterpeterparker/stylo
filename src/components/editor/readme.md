# stylo-editor

<!-- Auto Generated Below -->

## Properties

| Property       | Attribute | Description                                                                                                                                                           | Type          | Default     |
| -------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------- |
| `config`       | --        | Optional editor configuration. - Language - Plugin, if provided, replaces the default plugin config - Toolbar, if provided, is merged with the default toolbar config | `StyloConfig` | `undefined` |
| `containerRef` | --        | The container (e.g. an article, a div, etc.) that contains the content, the paragraphs. Must have the attribute `contenteditable` set to `true`.                      | `HTMLElement` | `undefined` |

## Dependencies

### Depends on

- [stylo-add](../plugins/add)
- [stylo-plugins](../plugins/plugins)
- [stylo-toolbar](../toolbar/toolbar)
- [stylo-menus](../menu)

### Graph

```mermaid
graph TD;
  stylo-editor --> stylo-add
  stylo-editor --> stylo-plugins
  stylo-editor --> stylo-toolbar
  stylo-editor --> stylo-menus
  stylo-plugins --> stylo-list
  stylo-toolbar --> stylo-toolbar-triangle
  stylo-toolbar --> stylo-toolbar-link
  stylo-toolbar --> stylo-toolbar-color
  stylo-toolbar --> stylo-toolbar-image
  stylo-toolbar --> stylo-toolbar-align
  stylo-toolbar --> stylo-toolbar-list
  stylo-toolbar --> stylo-toolbar-font-size
  stylo-toolbar --> stylo-toolbar-separator
  stylo-toolbar --> stylo-toolbar-button
  stylo-toolbar --> stylo-toolbar-text
  stylo-toolbar-color --> stylo-color
  stylo-color --> stylo-color-input
  stylo-toolbar-image --> stylo-toolbar-button
  stylo-toolbar-image --> stylo-toolbar-separator
  stylo-toolbar-align --> stylo-toolbar-button
  stylo-toolbar-list --> stylo-toolbar-button
  stylo-toolbar-font-size --> stylo-toolbar-button
  stylo-toolbar-text --> stylo-toolbar-button
  stylo-menus --> stylo-toolbar-triangle
  stylo-menus --> stylo-toolbar-button
  style stylo-editor fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
