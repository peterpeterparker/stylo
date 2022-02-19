import {getSelection as getDocumentSelection} from '@deckdeckgo/utils';

/**
 * The document selection or, if a container is provided
 */
export const getSelection = (container?: HTMLElement): Selection | null => {
  // https://stackoverflow.com/questions/62054839/shadowroot-getselection
  // https://twitter.com/bocoup/status/1459120675390689284?s=20
  // https://github.com/WICG/webcomponents/issues/79
  if (isShadowRoot(container) && hasShadowRootSelectionApi(container)) {
    return getShadowRootSelection(container);
  }

  return getDocumentSelection();
};

const isShadowRoot = (container?: HTMLElement): boolean =>
  container?.getRootNode() instanceof ShadowRoot;

const hasShadowRootSelectionApi = (container?: HTMLElement): boolean =>
  (container?.getRootNode() as any).getSelection;

const getShadowRootSelection = (container: HTMLElement): Selection | null =>
  (container.getRootNode() as any).getSelection();

export const getRange = (container?: HTMLElement): {range: Range | null; selection: Selection | null} => {
  const selection: Selection | null = getSelection(container);

  if (!selection || selection.rangeCount <= 0) {
    return {
      range: null,
      selection: null
    };
  }

  return {
    selection,
    range: selection.getRangeAt(0)
  };
};
