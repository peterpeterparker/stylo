import {
  elementIndex,
  findNodeAtDepths, isNodeList,
  isTextNode,
  nodeDepths,
  nodeIndex,
  toHTMLElement
} from './node.utils';

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

  const buildDepths = () => {
    const container = document.createElement('div');
    container.setAttribute('name', 'container');

    const child1 = document.createElement('div');
    child1.setAttribute('name', 'child1');

    const child2a = document.createElement('div');
    child2a.setAttribute('name', 'child2a');

    const child2b = document.createElement('div');
    child2b.setAttribute('name', 'child2b');

    const child3 = document.createElement('div');
    child3.setAttribute('name', 'child3');

    child2b.appendChild(child3);
    child1.appendChild(child2a);
    child1.appendChild(child2b);
    container.appendChild(child1);

    return [container, child1, child2a, child2b, child3];
  };

  it('should find node depths', () => {
    const [container, child1, child2a, child2b, child3] = buildDepths();

    expect(nodeDepths({target: container, paragraph: container})).toEqual([-1]);
    expect(nodeDepths({target: child1, paragraph: container})).toEqual([0]);
    expect(nodeDepths({target: child2a, paragraph: container})).toEqual([0, 0]);
    expect(nodeDepths({target: child2b, paragraph: container})).toEqual([0, 1]);
    expect(nodeDepths({target: child3, paragraph: container})).toEqual([0, 1, 0]);
  });

  it('should find node at depths', () => {
    const [container, _rest] = buildDepths();

    expect(
      (findNodeAtDepths({parent: container, indexDepths: [0]}) as HTMLElement).getAttribute('name')
    ).toEqual('child1');

    expect(
      (findNodeAtDepths({parent: container, indexDepths: [0, 0]}) as HTMLElement).getAttribute(
        'name'
      )
    ).toEqual('child2a');
    expect(
      (findNodeAtDepths({parent: container, indexDepths: [0, 1]}) as HTMLElement).getAttribute(
        'name'
      )
    ).toEqual('child2b');

    expect(
      (findNodeAtDepths({parent: container, indexDepths: [0, 1, 0]}) as HTMLElement).getAttribute(
        'name'
      )
    ).toEqual('child3');
  });

  it('should be a list node', () => {
    const paragraph = document.createElement('div');
    expect(isNodeList({node: paragraph})).toBeFalsy();

    const ul = document.createElement('ul');
    expect(isNodeList({node: ul})).toBeTruthy();

    const ol = document.createElement('ol');
    expect(isNodeList({node: ol})).toBeTruthy();

    const dl = document.createElement('dl');
    expect(isNodeList({node: dl})).toBeTruthy();
  });
});
