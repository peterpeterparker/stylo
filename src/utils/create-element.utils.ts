export const createEmptyElement = ({
  nodeName
}: {
  nodeName: 'h1' | 'h2' | 'h3' | 'div' | 'code';
}): HTMLElement => {
  const element: HTMLElement = document.createElement(nodeName);
  element.innerHTML = '\u200B';

  return element;
};

// We do not want TextNode as direct child of the container.
// If user types next to some HTML elements, such as hr and img, the resulting text is a TextNode with the container as parent.
// <container>
//   <img>
// -> after use type
// <container>
//   text
//   <img>
export const createUneditableDiv = (): HTMLDivElement => {
  const div: HTMLDivElement = document.createElement('div');
  div.setAttribute('contenteditable', 'false');
  return div;
};
