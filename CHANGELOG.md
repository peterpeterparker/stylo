# 0.0.22-2 (2022-05-24)

### Fix

- update class `stylo-empty` also when there is no selected paragraph 

# 0.0.22-1 (2022-05-20)

### Fix

- attach container listener in components

# 0.0.22 (2022-05-20)

### Features

- detect first two paragraphs and set a class `stylo-empty` if empty
- display "+" when code blocks or images are clicked
- attach all keydown listener to container

# 0.0.21 (2022-05-15)

### Fix

- close colors and link overlays

# 0.0.20-1 (2022-05-06)

### Style

- set plugins scroll properties to `auto`

# 0.0.20 (2022-05-05)

### Features

- display button "+" when backspace or delete are used to remove the all content of a paragraph

### Fix

- display button "+" on click in margin too
- stack previous element (not node) for undo-redo update

# 0.0.19 (2022-04-29)

### Fix

- incorrect undo-redo history on transform paragraph

# 0.0.18 (2022-04-29)

**REVERTED**: Fix was invalid. Code was reverted and unpublished from npm.

### Fix

- `previousSibling` reference not correctly set on transform paragraph which leads to an incorrect undo-redo history

# 0.0.17 (2022-04-29)

### Features

- use and add an attribute `paragraph_id` (can be customized) to identify each paragraph
- more Grammarly attributes to ignore

### Fix

- `deleteParagraph` triggered sometimes even though no paragraph was deleted

Note:

I wish there was another solution but did not manage to properly identify which DOM elements are paragraphs or not when deletion happen.
The Mutation Observer API and Dom API do not provide yet enough information or customization about it.
That's why this new feature to detect deleted paragraphs more accurately.

# 0.0.16 (2022-04-24)

### Style

- placeholder default color `rgba(55, 53, 47, 0.5)`

### Fix

- placeholder color style variable typo `--stylo-placeholder-color` not `--style-placeholder-color`

# 0.0.15 (2022-04-24)

### Fix

- delete backward empty paragraph

# 0.0.14 (2022-04-21)

### Fix

- right click - context menu support

# 0.0.13-1 (2022-04-12)

### Fix

- focusout only for iOS

# 0.0.13 (2022-04-12)

### Features

- focusout for iOS devices

# 0.0.12 (2022-04-10)

### Features

- debounce display of placeholder "Press "/" for plugins"

### Style

- position of all paragraphs set to `relative` and placeholder set to `absolute`
- color picker height and alignment for Brave and Safari

# 0.0.11 (2022-04-03)

### Style

- button color on iOS

# 0.0.10 (2022-04-03)

### Fix

- transform very first paragraph
- delete content backward
- placeholder position if browser adds a `<br/>` at begin of new paragraph

### Style

- use no height if invisible
- placeholder and add colors

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
