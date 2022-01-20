export interface UndoRedoInput {
  offset: number;
  oldValue: string;
  index: number;
  indexDepths: number[];
}

export interface UndoRedoAddRemoveParagraph {
  index: number;
  mutation: 'add' | 'remove';
  outerHTML: string;
}

export interface UndoRedoUpdateParagraph {
  outerHTML: string;
  index: number;
}

export interface UndoRedoChange {
  type: 'input' | 'paragraph' | 'update';
  target: Node;
  data: UndoRedoInput | UndoRedoAddRemoveParagraph[] | UndoRedoUpdateParagraph[];
}
