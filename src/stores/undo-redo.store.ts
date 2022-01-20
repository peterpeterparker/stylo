import {createStore} from '@stencil/store';
import {UndoRedoChange} from '../types/undo-redo';

interface UndoRedoStore {
  undo: UndoRedoChange[] | undefined;
  redo: UndoRedoChange[] | undefined;

  observe: boolean;
}

const {state, onChange, reset} = createStore<UndoRedoStore>({
  undo: undefined,
  redo: undefined,
  observe: true
});

export default {state, onChange, reset};
