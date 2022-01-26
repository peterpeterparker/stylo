import {isRTL} from '@deckdeckgo/utils';
import {ToolbarAlign, ToolbarFontSize, ToolbarList} from '../types/toolbar';
import {toHTMLElement} from './node.utils';
import {isParagraph} from './paragraph.utils';

export const findStyleNode = (node: Node, style: string, container: HTMLElement): Node | null => {
  // Just in case
  if (node.nodeName.toUpperCase() === 'HTML' || node.nodeName.toUpperCase() === 'BODY') {
    return null;
  }

  if (!node.parentNode) {
    return null;
  }

  if (isParagraph({element: node, container})) {
    return null;
  }

  const {style: elementStyle}: HTMLElement = toHTMLElement(node);

  const hasStyle: boolean =
    elementStyle[style] !== null && elementStyle[style] !== undefined && elementStyle[style] !== '';

  if (hasStyle) {
    return node;
  }

  return findStyleNode(node.parentNode, style, container);
};

export const getBold = (element: HTMLElement): 'bold' | 'initial' | undefined => {
  if (isTag(element, 'b')) {
    return 'bold';
  }

  if (isTag(element, 'strong')) {
    return 'bold';
  }

  return element.style.fontWeight === 'bold'
    ? 'bold'
    : element.style.fontWeight === 'initial'
    ? 'initial'
    : undefined;
};

export const getFontSize = (element: HTMLElement | undefined): ToolbarFontSize | undefined => {
  if (!element) {
    return undefined;
  }

  if (element.hasAttribute('size')) {
    return element.getAttribute('size') as ToolbarFontSize;
  }

  return element.style.fontSize !== ''
    ? ToolbarFontSize[element.style.fontSize.replace('-', '_').toUpperCase()]
    : undefined;
};

export const getContentAlignment = (element: HTMLElement): ToolbarAlign => {
  const style: CSSStyleDeclaration = window.getComputedStyle(element);

  if (style.textAlign === 'center') {
    return ToolbarAlign.CENTER;
  } else if (style.textAlign === 'right') {
    return ToolbarAlign.RIGHT;
  } else if (style.textAlign === 'left') {
    return ToolbarAlign.LEFT;
  }

  return isRTL() ? ToolbarAlign.RIGHT : ToolbarAlign.LEFT;
};

export const getList = (element: HTMLElement): ToolbarList | undefined => {
  if (!element) {
    return undefined;
  }

  if (
    element.nodeName &&
    element.nodeName.toLowerCase() === 'li' &&
    element.parentElement &&
    element.parentElement.nodeName
  ) {
    return element.parentElement.nodeName.toLowerCase() === 'ol'
      ? ToolbarList.ORDERED
      : element.parentElement.nodeName.toLowerCase() === 'ul'
      ? ToolbarList.UNORDERED
      : undefined;
  }

  return undefined;
};

export const getStrikeThrough = (element: HTMLElement): 'strikethrough' | 'initial' | undefined => {
  if (isTag(element, 'strike')) {
    return 'strikethrough';
  }

  if (
    element.style.textDecoration?.indexOf('line-through') > -1 ||
    element.style.textDecorationLine?.indexOf('line-through') > -1
  ) {
    return 'strikethrough';
  }

  if (
    element.style.textDecoration?.indexOf('initial') > -1 ||
    element.style.textDecorationLine?.indexOf('initial') > -1
  ) {
    return 'initial';
  }

  if (!element.hasChildNodes()) {
    return undefined;
  }

  const children: HTMLCollection = element.children;
  if (children && children.length > 0) {
    const selectedChild: HTMLElement = Array.from(children).find((child: HTMLElement) => {
      return (
        child.style.textDecoration?.indexOf('line-through') > -1 ||
        child.style.textDecorationLine?.indexOf('line-through') > -1 ||
        child.style.textDecorationLine?.indexOf('initial') > -1
      );
    }) as HTMLElement;

    if (selectedChild) {
      return selectedChild.style.fontStyle?.indexOf('line-through') > -1
        ? 'strikethrough'
        : 'initial';
    }
  }

  return undefined;
};

export const getUnderline = (element: HTMLElement): 'underline' | 'initial' | undefined => {
  if (isTag(element, 'u')) {
    return 'underline';
  }

  if (
    element.style.textDecoration?.indexOf('underline') > -1 ||
    element.style.textDecorationLine?.indexOf('underline') > -1
  ) {
    return 'underline';
  }

  if (
    element.style.textDecoration?.indexOf('initial') > -1 ||
    element.style.textDecorationLine?.indexOf('initial') > -1
  ) {
    return 'initial';
  }

  if (!element.hasChildNodes()) {
    return undefined;
  }

  const children: HTMLCollection = element.children;
  if (children && children.length > 0) {
    const selectedChild: HTMLElement = Array.from(children).find((child: HTMLElement) => {
      return (
        child.style.textDecoration?.indexOf('underline') > -1 ||
        child.style.textDecorationLine?.indexOf('underline') > -1 ||
        child.style.textDecorationLine?.indexOf('initial') > -1
      );
    }) as HTMLElement;

    if (selectedChild) {
      return selectedChild.style.fontStyle?.indexOf('underline') > -1 ? 'underline' : 'initial';
    }
  }

  return undefined;
};

export const getItalic = (element: HTMLElement): 'italic' | 'initial' | undefined => {
  if (isTag(element, 'i')) {
    return 'italic';
  }

  if (isTag(element, 'em')) {
    return 'italic';
  }

  if (element.style.fontStyle === 'italic') {
    return 'italic';
  }

  if (element.style.fontStyle === 'initial') {
    return 'initial';
  }

  if (!element.hasChildNodes()) {
    return undefined;
  }

  const children: HTMLCollection = element.children;
  if (children && children.length > 0) {
    const selectedChild: HTMLElement = Array.from(children).find((child: HTMLElement) => {
      return child.style.fontStyle === 'italic' || child.style.fontStyle === 'initial';
    }) as HTMLElement;

    if (selectedChild) {
      return selectedChild.style.fontStyle === 'italic' ? 'italic' : 'initial';
    }
  }

  return undefined;
};

export const isAnchorImage = (
  anchorEvent: MouseEvent | TouchEvent,
  imgAnchor: string | undefined
): boolean => {
  if (!anchorEvent || !imgAnchor) {
    return false;
  }

  if (!anchorEvent.target || !(anchorEvent.target instanceof HTMLElement)) {
    return false;
  }

  const target: HTMLElement = anchorEvent.target;

  return target.nodeName && target.nodeName.toLowerCase() === imgAnchor;
};

const isTag = (element: HTMLElement, tagName: string): boolean => {
  if (!element) {
    return false;
  }

  if (element.nodeName.toLowerCase() === tagName) {
    return true;
  }

  if (element.hasChildNodes()) {
    const children: HTMLCollection = element.getElementsByTagName(tagName);
    return children && children.length > 0;
  }

  return false;
};
