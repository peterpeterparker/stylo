export const injectHeadCSS = (rootNode: Node) => {
  let style: HTMLStyleElement | null

  if (rootNode == document)
    style = document.head.querySelector('style[stylo-editor]');
  else
    style = (<ShadowRoot>rootNode).querySelector('style[stylo-editor]');

  if (style !== null) {
    return;
  }

  style = document.createElement('style');
  style.setAttribute('stylo-editor', '');
  style.innerHTML = `
    .stylo-container > * {
      white-space: pre-wrap;
    }

    .stylo-container > *:after {
      content: attr(placeholder);
      color: #6e6d6f;
    }
  `;

  if (rootNode == document)
    document.head.append(style);
  else
    style = (<ShadowRoot>rootNode).insertBefore(style, (<ShadowRoot>rootNode).firstElementChild);
};
