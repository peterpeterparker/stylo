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

export const nodeDepths = ({target, paragraph}: {target: Node; paragraph: Node | undefined}) => {
  const depths: number[] = [nodeIndex(target)];

  if (!paragraph) {
    return depths;
  }

  let parentElement: HTMLElement = target.parentElement;

  while (parentElement && !parentElement.isSameNode(paragraph)) {
    depths.push(nodeIndex(parentElement));
    parentElement = parentElement.parentElement;
  }

  return depths.reverse();
};

export const findNodeAtDepths = ({
  parent,
  indexDepths
}: {
  parent: Node | undefined;
  indexDepths: number[];
}): Node | undefined => {
  const childNode: ChildNode | undefined = (
    parent?.childNodes ? Array.from(parent?.childNodes) : []
  )[indexDepths[0]];

  if (!childNode) {
    return undefined;
  }

  const [, ...rest] = indexDepths;

  if (rest?.length <= 0) {
    return childNode;
  }

  return findNodeAtDepths({parent: childNode, indexDepths: rest});
};

// https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories
export const isPhrasingContent = (node: Node): boolean =>
  isTextNode(node) ||
  [
    'abbr',
    'audio',
    'b',
    'bdo',
    'br',
    'button',
    'canvas',
    'cite',
    'code',
    'data',
    'datalist',
    'dfn',
    'em',
    'embed',
    'i',
    'iframe',
    'img',
    'input',
    'kbd',
    'label',
    'mark',
    'math',
    'meter',
    'noscript',
    'object',
    'output',
    'picture',
    'progress',
    'q',
    'ruby',
    'samp',
    'script',
    'select',
    'small',
    'span',
    'strong',
    'sub',
    'sup',
    'svg',
    'textarea',
    'time',
    'u',
    'var',
    'video',
    'wbr'
  ].includes(node.nodeName.toLowerCase()) ||
  ['a', 'area', 'del', 'ins', 'map'].includes(node.nodeName.toLowerCase());

export const isMetaContent = ({nodeName}: Node): boolean =>
  ['base', 'link', 'meta', 'noscript', 'script', 'style', 'title'].includes(nodeName.toLowerCase());

export const isNodeList = ({node: {nodeName}}: {node: Node}): boolean =>
  ['ul', 'ol', 'dl'].includes(nodeName.toLowerCase());
