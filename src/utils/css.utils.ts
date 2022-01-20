export const injectHeadCSS = () => {
  let style: HTMLStyleElement | null = document.head.querySelector('style[stylo-editor]');

  if (style !== null) {
    return;
  }

  style = document.createElement('style');
  style.setAttribute('stylo-editor', '');
  style.innerHTML = `
    .stylo-container > * {
      position: relative;
      white-space: pre-wrap;
    }

    .stylo-container > *:after {
      content: attr(placeholder);
      position: absolute;
      top: 0;
      left: 0;
      color: #6e6d6f;
    }
  `;

  document.head.append(style);
};
