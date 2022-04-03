# 0.0.10 (2022-04-XX)

### Fix

- transform very first paragraph

### Style

- use no height if invisible

# 0.0.9 (2022-03-06)

### Fix

- focus list of plugins on display
- miscellaneous selection and order fixes for undo-redo
- preserve cursor position on undo-redo tab

# 0.0.8-2 (2022-02-19)

### Style

- inline `plugin` style to bypass `.hydrated` class

# 0.0.8-1 (2022-02-19)

### Features

- expose `i18n` types

# 0.0.8 (2022-02-19)

### Features

- integration of Stylo inside of other webcomponents

### Fix

- "enter" new paragraph if focus at begin of an existing paragraph
- range 0 is not a valid index (on window resize)

### Build

- bump Stencil

# 0.0.7-1 (2022-02-14)

### Fix

- custom `deleteContentBackward` in Firefox

# 0.0.7 (2022-02-13)

### Features

- reset undo stack on destroy

### Fix

- display placeholders "Press / for plugins"
- create preventive HTML element for text inputs only if targeted container does not accept text
- on `deleteContentBackward` reset range to cover the all target paragraphs (do not keep empty elements in dom)

# 0.0.6-1 (2022-02-12)

### Fix

- `deleteContentBackward` amend zeroWidthSpace and preventDefault

# 0.0.6 (2022-02-12)

### Features

- "undo-redo" array of inputs because `characterdata` changes can actually be triggered in multiple paragraphs at once

### Fix

- "DOMException: Failed to execute 'setStart' on 'Range': The offset 7 is larger than the node's length (1)."

# 0.0.5 (2022-02-12)

### Features

- preserve styles when removing links (except Firefox)
- prevent creation of text nodes - i.e. leaves - when user is typing (direct children of the content editable should all be HTML elements)
- `<img/>` and `<hr/>` do not need to be wrapped in a parent `contenteditable=false` anymore
- redo user selection after "undo-redo"

### Fix

- add link on Firefox
- Android v12 keyboard appearing and disappearing at the same time
- clone image on drag
- remove target paragraph on `deleteContentBackward` ("avoid text to get title style when deleting and replacing it")
- redo deleted paragraphs content

# 0.0.4-1 (2022-02-08)

### Fix

- on "shift + enter" if the context is extracted it should not clean the selection and then move the cursor to start

# 0.0.4 (2022-02-08)

### Features

- revert hijack "enter" - browser does not the job as expected
- improve new lines within paragraphs ("shift + enter")

### Fix

- extract content in case of new paragraphs initiated within a paragraphs ("not from end of line")

# 0.0.3 (2022-02-05)

### Features

- do not hijack "enter" i.e. let the browser do the job and create new paragraphs
- add multiple add, remove and update paragraphs at once in the "undo-redo" stack

# 0.0.2 (2022-02-04)

### Fix

- `StyloToolbar` renamed to `StyloConfigToolbar` to avoid naming collision

### Build

- bump stencil and jest v27

# 0.0.1 (2022-02-04)

Hello World 👋
