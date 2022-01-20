export const isTextNode = (element: Node | undefined): boolean => {
  return element?.nodeType === Node.TEXT_NODE || element?.nodeType === Node.COMMENT_NODE;
};

export const toHTMLElement = (element: Node | undefined): HTMLElement | undefined | null => {
  return isTextNode(element) ? element.parentElement : (element as HTMLElement);
};

export const elementIndex = (element: HTMLElement): number => {
  return Array.from(element.parentNode?.children || []).indexOf(element);
};

export const nodeIndex = (node: Node): number => {
  return Array.from(node.parentNode?.childNodes || []).indexOf(node as ChildNode);
};
