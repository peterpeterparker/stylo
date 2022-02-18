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
