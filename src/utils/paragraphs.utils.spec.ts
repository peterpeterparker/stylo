import {
  findAddedNodesParagraphs,
  findAddedParagraphs,
  findRemovedNodesParagraphs,
  findRemovedParagraphs,
  findUpdatedParagraphs
} from './paragraphs.utils';

describe('paragraphs utils', () => {
  const createDiv = ({depth}: {depth: number}) => {
    const div = document.createElement('div');
    div.setAttribute('depth', `${depth}`);

    Object.defineProperty(div, 'isEqualNode', {
      value: jest.fn((node) => div?.getAttribute('depth') === node?.getAttribute('depth'))
    });

    return div;
  };

  const app = createDiv({depth: 0});
  const container = createDiv({depth: 1});

  const child1 = createDiv({depth: 2});
  child1.setAttribute('paragraph_id', '');

  const child2 = createDiv({depth: 2});
  child1.setAttribute('paragraph_id', '');

  const text = document.createTextNode('test');
  const leaf = createDiv({depth: 1});

  container.append(child1);
  container.append(child2);
  child2.append(text);
  app.append(container);
  app.append(leaf);

  it('should find added paragraphs', () => {
    const mutation = {
      addedNodes: [child1, text, child2, leaf]
    } as unknown as MutationRecord;

    const paragraphs = findAddedParagraphs({container, mutations: [mutation, mutation]});
    expect(paragraphs.length).toEqual(4);
  });

  it('should find removed paragraphs', () => {
    const mutation = {
      addedNodes: [child1, text, child2],
      target: container
    } as unknown as MutationRecord;

    const mutationRemoved = {
      removedNodes: [child1],
      target: container
    } as unknown as MutationRecord;

    const removedParagraphs = findRemovedParagraphs({
      mutations: [mutation, mutationRemoved, mutation],
      container,
      paragraphIdentifier: 'paragraph_id'
    });
    expect(removedParagraphs.length).toEqual(1);
  });

  it('should find updated paragraphs', () => {
    const mutation1 = {
      target: child1
    } as unknown as MutationRecord;

    const mutation2 = {
      target: child2
    } as unknown as MutationRecord;

    const elements = findUpdatedParagraphs({container, mutations: [mutation1, mutation2]});
    expect(elements.length).toEqual(2);
  });

  it('should find added nodes', () => {
    const mutation = {
      addedNodes: [child1, text, child2, leaf]
    } as unknown as MutationRecord;

    const mutationNode = {
      addedNodes: [text]
    } as unknown as MutationRecord;

    const mutations = findAddedNodesParagraphs({
      container,
      mutations: [mutation, mutationNode, mutation]
    });
    expect(mutations.length).toEqual(1);
  });

  it.only('should find removed nodes', () => {
    const mutationParagraphs = {
      removedNodes: [child1, text, child2],
      target: container
    } as unknown as MutationRecord;

    const mutationNode = {
      removedNodes: [text],
      target: child2
    } as unknown as MutationRecord;

    const mutationLeaf = {
      removedNodes: [leaf],
      target: createDiv({depth: 1})
    } as unknown as MutationRecord;

    const mutations = findRemovedNodesParagraphs({
      paragraphIdentifier: 'paragraph_id',
      mutations: [mutationParagraphs, mutationNode, mutationLeaf]
    });

    expect(mutations.length).toEqual(2);
  });
});
