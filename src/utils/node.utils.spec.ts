import {elementIndex, isTextNode, nodeIndex, toHTMLElement} from './node.utils';

describe('node utils', () => {
  it('should be a text node', () => {
    const text = document.createTextNode('test');
    expect(isTextNode(text)).toBeTruthy();
  });

  it('should not be a text node', () => {
    const div = document.createElement('div');
    expect(isTextNode(div)).toBeFalsy();
  });

  it('should return parent html element', () => {
    const text = document.createTextNode('test');
    const div = document.createElement('div');

    div.append(text);

    expect(toHTMLElement(text).nodeName).toEqual(div.nodeName);
  });

  it('should return same html element', () => {
    const div = document.createElement('div');

    expect(toHTMLElement(div).nodeName).toEqual(div.nodeName);
  });

  it('should return an html element index', () => {
    const container = document.createElement('div');
    const child1 = document.createElement('div');
    const child2 = document.createTextNode('test');
    const child3 = document.createElement('div');

    container.append(child1, child2, child3);

    expect(elementIndex(child1)).toEqual(0);
    expect(elementIndex(child3)).toEqual(1);
  });

  it('should return a node index', () => {
    const container = document.createElement('div');
    const child1 = document.createElement('div');
    const child2 = document.createTextNode('test');
    const child3 = document.createElement('div');

    container.append(child1, child2, child3);

    expect(nodeIndex(child1)).toEqual(0);
    expect(nodeIndex(child2)).toEqual(1);
    expect(nodeIndex(child3)).toEqual(2);
  });
});
