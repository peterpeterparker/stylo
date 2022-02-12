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
