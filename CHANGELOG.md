# 0.0.37 (2022-08-06)

## Features

- japanese translation

# 0.0.36 (2022-07-29)

## Features

- keyboard shortcuts: control or command-{B, I, U, K} for bold, italic, underline, insert hyperlink

# 0.0.35-1 (2022-07-29)

### Fix

- tab support for `ol` and `dl` list as well (not just `ul`)

# 0.0.35 (2022-07-28)

### Features

- sublist with "Tab" and "Shift+Tab"

# 0.0.34 (2022-07-14)

### Features

- filter plugins with keyboards

e.g.

1. Large title
2. Small title
3. Paragraph

Type "title" to only display the two first plugins. If one plugin only is filter, it gets the focus automatically.

# 0.0.33-1 (2022-07-09)

### Fix

- backtick after various tests on various keyboards types

# 0.0.33 (2022-07-09)

### Features

- backtick support for us keyboards

# 0.0.32 (2022-07-08)

### Features

- ordered list plugin

# 0.0.31 (2022-07-08)

### Features

- filter updated paragraphs that have just been added for events `updateParagraphs`
- workaround delay for empty placeholder

# 0.0.30 (2022-07-03)

### Features

- clean meta and support phrasing content in past hijacker

### Fix

- undo redo input text if `target` is the container

### Build

- bump dependencies

# 0.0.29-1 (2022-06-23)

### Fix

- set range to start to preserve leaf if target is editable

# 0.0.29 (2022-06-19)

### Features

- add iOS and Android to `isMobile()` detection to consider such devices as Samsung Note as mobile devices too

# 0.0.28-1 (2022-06-14)

### Fix

- miscellaneous fix for tab hijacker

# 0.0.28 (2022-06-09)

### Features

- merge default list of excluded attributes with custom configuration
- add `autocomplete` to the list of excluded attributes
- support replace text selection on `enter`
- support replace text selection on `paste`

# 0.0.27 (2022-06-05)

### Features

- improve paste hijacker to handle texts and elements differently

### Fix

- japanese support (or at least try to fix it)

# 0.0.26 (2022-05-29)

### Features

- hi-jack `parse` to clean html (remove `class` or `style`) before being added to the content and prevent leaves (no text leaf has direct child of the content editable)

# 0.0.25 (2022-05-28)

### Features

- clean `outerhtml` for undo-redo update too

### Fix

- prevent "out of range" cursor move on undo-redo
- re-evaluate node depths when moving element from undo to redo queue

# 0.0.24 (2022-05-26)

### Fix

- color and link overlay close and glitchy toolbar display

# 0.0.23-1 (2022-05-26)

### Features

- detect empty paragraph only for text paragraphs type

# 0.0.23 (2022-05-26)

### Features

- detect empty paragraph only for placeholders type
- rename `stylo-empty` into `style-placeholder-empty`
- add class for second element in content editable only if there are no other paragraphs

# 0.0.22-4 (2022-05-25)

### Fix

- Create link was broken because the new listener was resetting the toolbar when in fact it was effectively active

# 0.0.22-3 (2022-05-24)

### Fix

- clean class `stylo-empty` in case it would be automatically copied by the browser

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
