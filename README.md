# Stylo

Another kind of rich text editor.

- Interactive design 🎯
- Customizable 💪
- Future Proof 🚀
- Open Source ⭐️

A project from [DeckDeckGo](https://deckdeckgo.com), an editor for presentations, documents and blog posts.

[![GitHub release](https://img.shields.io/github/release/deckgo/stylo/all?logo=GitHub&color=lightgrey)](https://github.com/deckgo/stylo/releases/latest)
[![Tweet](https://img.shields.io/twitter/url?url=https%3A%2F%2Fstylojs.com)](https://twitter.com/intent/tweet?url=https%3A%2F%2Fstylojs.com&text=Another%20kind%20of%20rich%20text%20editor%20by%20%40deckdeckgo)

## Table of contents

- [Getting Started](#getting-started)
- [Concept](#concept)
- [Installation](#installation)
- [Usage](#usage)
- [Config](#config)
- [Plugins](#plugins)
- [Toolbar](#toolbar)
- [Menus](#menus)
- [Events](#events)
- [Listener](#listener)
- [Contributing](#contributing)
- [i18n](#i18n)
- [License](#license)

## Getting Started

Lightweight (32kb gzipped) and code agnostic, this project is a library of reusable components. It can be integrated with or without any framework and work across all modern browsers.

Even though at the moment few actions still relies on [execCommand](https://developer.mozilla.org/fr/docs/Web/API/Document/execCommand) to apply styles (e.g. bold, italic) - the core of Stylo does not. It controls what happens on every mutation and avoids the need to use this deprecated API and is therefore designed for the future.

Based on a set of plugins that can be fully customized, enabling additional functionality or disabling default features is made easy.

## Concept

Stylo is a web component that takes as bare minimum property a reference to an editable element (`contenteditable="true"`) of your application.

It needs only one single top container set as editable and will maintain a list of children, paragraphs, that are HTML elements.

```
<article contenteditable="true">
   <div>Lorem ipsum dolor sit amet.</div>
   <hr/>
   <ul>
      <li>Hello</li>
      <li>World</li>
   </ul>
   <div>In ac tortor suscipit.</div>
</article>
```

In order to keep track of the changes for a custom "undo redo" feature or forward the information to your application, the component mainly uses the [MutationObserver API](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).

It also uses some keyboard, mouse or touch events to present UI elements or apply styling changes.

## Installation

You can use Stylo via CDN or by installing it locally.

### CDN

Add the following code to your page to load the editor.

```
<script type="module" src="https://unpkg.com/@deckdeckgo/stylo@alpha/dist/stylo/stylo.esm.js"></script>
```

That's it, the component is imported and loaded.

### Local Installation

Install the editor in your project from [npm](https://www.npmjs.com/package/@deckdeckgo/stylo):

```bash
npm install @deckdeckgo/stylo@alpha
```

Afterwards you will need to load - i.e. import - the component in your application. Use one of the following methods, the one that fits the best your needs or framework.

#### Loader

Lazy load the components with the help of a loader.

```
import { defineCustomElements } from '@deckdeckgo/stylo/dist/loader';
defineCustomElements();
```

#### Import

Import the library.

```
import '@deckdeckgo/stylo';
```

#### Custom Elements

It is also possible to import only selected element, as for example the `<stylo-color />` component.

```
import { StyloColor } from '@deckdeckgo/stylo/dist/components/stylo-color';
customElements.define('stylo-color', StyloColor);
```

Note: it will recursively define all children components for a component when it is registered.

## Usage

To integrate the editor to your application, add the following tag next to your editable element:

```
<stylo-editor></stylo-editor>
```

The component needs to find place at the same level because its UI elements are `absolute` positioned.

Once added, provide a reference to your container.

```
// Your editable element
const article = document.querySelector('article[contenteditable="true"]');

// Stylo
const stylo = document.querySelector('stylo-editor');

// Set the `containerRef` property
stylo.containerRef = article;
```

## Config

The editor is provided with a default configuration. It can be customized by setting the property `config` of the `<stylo-editor/>` component.

For more information:

- [i18.d.ts](src/types/i18.d.ts) for the list of languages
- [config.store.ts](src/stores/config.store.ts) for the default plugins and toolbar configuration

## Plugins

A plugin is a transform function that adds a new paragraph to the editable container.

You can contribute by adding new plugins to this repo or create custom plugins for your application only.

The list of plugins available at runtime by the editor is fully customizable.

### Development

Stylo exposes interfaces and utilities to ease the development of new plugins. Basically, a plugin should provide:

- `text`: the text, a `string`, displayed to the user in the UI popover
- `icon`: an icon displayed to the user in the UI popover. it can be one of the built-in icons ([src/types/plugin.ts](src/types/plugin.ts)) or an inline SVG - i.e. an SVG provided as `string`
- `createParagraphs`: the function that effectively create the new paragraph(s), add these elements to the DOM and can optionally give focus to the newly created first or last element

For example, a plugin that generates a new paragraph that is itself a Web Component name `<hello-world/>` would look as following:

```
import {createEmptyElement, StyloPlugin, StyloPluginCreateParagraphsParams, transformParagraph} from '@deckdeckgo/stylo';

export const hr: StyloPlugin = {
  text: 'My Hello World',
  icon: `<svg width="32" height="32" viewBox="0 0 512 512">
        ...
    </svg>
  `,
  createParagraphs: async ({container, paragraph}: StyloPluginCreateParagraphsParams) => {
     // Create your Web Component or HTML Element
     const helloWorld = document.createElement('hello-world');

     // Set properties, attributes or styles
     helloWorld.setAttributes('yolo', 'true');

     transformParagraph({
      elements: [helloWorld, createEmptyElement({nodeName: 'div'})],
      paragraph,
      container,
      focus: 'first'
    })
  }
};
```

In addition, it is worth to note that `createParagraphs` is a promise. This gives you the ability to hi-jack the user flow to trigger some functions in your application before the DOM is actually modified. As for example opening a modal after a plugin as been selected by the user.

Things to pay attention to:

- when users are using your plugins, they should not end up trapped not being able to continue editing and create new paragraphs. That's why we advise to generate an empty `div` (in above example `createEmptyElement`) at the same time as your element(s)
- Stylo expect all the direct children - the paragraphs - of the editable container to be HTML elements i.e. no text or comment nodes

Find some custom plugins in DeckDeckGo [repo](https://github.com/deckgo/deckdeckgo/tree/main/studio/src/app/plugins).

## Toolbar

The inline editor that is uses to style texts (bold, italic, colors, etc.) is a web component named `<stylo-toolbar/>`.

It is provided per default with Stylo but can also be used as a standalone component.

## Menus

Optionally, menus can be defined for particular elements. They will be displayed with an absolute positioning on click events.

Custom menus can be configured following the ([src/types/menu.ts](src/types/menu.ts)) interface.

If for example you would like to display a custom menu for all `code` paragraphs, this can be done as following:

```
export const editorConfig: Partial<StyloConfig> = {
  menus: [
    {
      nodeName: 'code',
      actions: [
        {
          text: 'Edit code',
          icon: `<svg ...
          </svg>`,
          message: 'myCodeMessage'
        }
      ]
    }
  ]
};
```

Each time an action of your custom menus is selected by the user, a related `CustomEvent` will be emitted providing both the `message` of the particular event and the related HTML element - i.e. the paragraph.

## Events

If you are using a rich text editor, there is a chance that you are looking to persist users entries and changes.

For such purpose, the `<stylo-editor/>` component triggers following custom events:

- `addParagraphs`: triggered each time new paragraph(s) is added to the editable container
- `deleteParagraphs`: triggered each time paragraph(s) are removed
- `updateParagraphs`: triggered each time paragraph(s) are updated

Each paragraph is a direct child of the editable container.

Unlike `addParagraphs` and `deleteParagraphs` that are triggered only if elements are such level are added or removed, `updateParagraphs` is triggered if the paragraphs themselves or any of their children (HTML elements and text nodes) are modified.

Changes following keyboard inputs are debounced.

## Listener

If you are manipulating the `contenteditable` - i.e. the DOM - on your side, you might want to add these changes to the "undo-redo" history.

For such purpose, the editor is listening for the events `snapshotParagraph` of type `CustomEvent<void>` that can be triggered from the child of the editable element you are about to modify.

## Contributing

We welcome contributions in the form of issues, pull requests, documentation improvements or thoughtful discussions in the [GitHub issue tracker](https://github.com/deckgo/stylo/issues).

To provide code changes, make sure you have a recent version of [Node.js installed](https://nodejs.org/en/) (LTS recommended).

Fork and clone this repository. Head over to your terminal and run the following command:

```
git clone git@github.com:[YOUR_USERNAME]/stylo.git
cd stylo
npm ci
npm run start
```

Before submitting changes, make sure to have run at least once a build (`npm run build`) to generate the documentation.

Tests suite can be run with `npm run test`.

This project is developed with [Stencil](https://stenciljs.com/).

## i18n

English, German, Spanish and Dutch are currently supported. More translations are also welcomed!

- add a new translation file in [src/assets/i18n](src/assets/i18n)
- extends the list of supported `Languages` in [src/types/i18.d.ts](src/types/i18.d.ts)
- update README with the new language

## License

MIT © [David Dal Busco](mailto:david.dalbusco@outlook.com) and [Nicolas Mattia](mailto:nicolas@nmattia.com)
