import {getSelection} from '@deckdeckgo/utils';

export const getSelectionIncludingShadowroot = (container: HTMLElement) => {
  const refRootNode = container.getRootNode();
  const isShadowRoot = refRootNode instanceof ShadowRoot;
  const hasShadowRootSelectionApi = isShadowRoot && (refRootNode as any).getSelection;

  let selection: Selection | null = getSelection();
  if (hasShadowRootSelectionApi) {
    selection = (refRootNode as any).getSelection();
  }
  return selection;
};

export const getRange = (): { range: Range | null, selection: Selection | null } => {
  const selection: Selection | null = getSelection();

  if (!selection || selection.rangeCount <= 0) {
    return {
      range: null,
      selection: null
    };
  }

  return {
    selection, range: selection.getRangeAt(0)
  };
}
