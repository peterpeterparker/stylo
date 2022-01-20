import {createStore} from '@stencil/store';

interface ContainerStore {
  ref: HTMLElement | undefined;
  size: DOMRect | undefined;
}

const {state, onChange} = createStore<ContainerStore>({
  ref: undefined,
  size: undefined
});

export default {state, onChange};
