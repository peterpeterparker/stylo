import {createStore} from '@stencil/store';
import {UndoRedoChanges} from '../types/undo-redo';

interface UndoRedoStore {
  undo: UndoRedoChanges[] | undefined;
  redo: UndoRedoChanges[] | undefined;

  observe: boolean;
}

const {state, onChange, reset} = createStore<UndoRedoStore>({
  undo: undefined,
  redo: undefined,
  observe: true
});

export default {state, onChange, reset};
