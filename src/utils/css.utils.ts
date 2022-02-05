export const injectHeadCSS = () => {
  let style: HTMLStyleElement | null = document.head.querySelector('style[stylo-editor]');

  if (style !== null) {
    return;
  }

  style = document.createElement('style');
  style.setAttribute('stylo-editor', '');
  style.innerHTML = `
    .stylo-container > * {
      white-space: pre-wrap;
    }

    .stylo-container > *:before {
      content: attr(placeholder);
      color: #6e6d6f;
      position: absolute;
    }
  `;

  document.head.append(style);
};
