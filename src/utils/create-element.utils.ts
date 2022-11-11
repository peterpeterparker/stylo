export const createEmptyElement = ({
  nodeName
}: {
  nodeName: 'h1' | 'h2' | 'h3' | 'div' | 'code' | 'blockquote';
}): HTMLElement => {
  const element: HTMLElement = document.createElement(nodeName);
  element.innerHTML = '\u200B';

  return element;
};
