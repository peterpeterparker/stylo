# 0.0.5

### Features

- preserve styles when removing links (except Firefox)
- prevent text nodes - i.e. leaves - as direct children of the content editable when user is typing

### Fix

- add link on Firefox
- Android v12 keyboard appearing and disappearing at the same time

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
