import {getSelection} from '@deckdeckgo/utils';

export const getRange = (): {range: Range | null, selection: Selection | null} => {
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
