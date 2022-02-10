import {createEmptyElement} from './create-element.utils';

describe('create element', () => {
  it('should create empty element', () => {
    const empty = createEmptyElement({nodeName: 'div'});

    expect(empty.nodeName.toLowerCase()).toEqual('div');
    expect(empty.innerHTML).toEqual('\u200B');
  });
});
