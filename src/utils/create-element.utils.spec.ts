import {createEmptyElement, createUneditableDiv} from './create-element.utils';

describe('create element', () => {
  it('should create empty element', () => {
    const empty = createEmptyElement({nodeName: 'div'});

    expect(empty.nodeName.toLowerCase()).toEqual('div');
    expect(empty.innerHTML).toEqual('\u200B');
  });

  it('should create a not editable element', () => {
    const empty = createUneditableDiv();

    expect(empty.nodeName.toLowerCase()).toEqual('div');
    expect(empty.getAttribute('contenteditable')).toEqual('false');
  });
});
