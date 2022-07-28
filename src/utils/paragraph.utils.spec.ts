import {
  createEmptyParagraph,
  findParagraph,
  isParagraph,
  isParagraphCode,
  isParagraphEmpty,
  isParagraphNotEditable,
  isStartNode
} from './paragraph.utils';

describe('paragraph utils', () => {
  const createDiv = ({depth}: {depth: number}) => {
    const div = document.createElement('div');
    div.setAttribute('depth', `${depth}`);

    Object.defineProperty(div, 'isEqualNode', {
      value: jest.fn((node) => div.getAttribute('depth') === node.getAttribute('depth'))
    });

    return div;
  };

  test('should find paragraph', () => {
    const app = createDiv({depth: 0});
    const container = createDiv({depth: 1});
    const paragraph = createDiv({depth: 2});

    container.append(paragraph);
    app.append(container);

    const expectedParagraph = findParagraph({container, element: paragraph});

    expect(expectedParagraph).not.toBeUndefined();
  });

  test('should find paragraph for child', () => {
    const app = createDiv({depth: 0});
    const container = createDiv({depth: 1});
    const paragraph = createDiv({depth: 2});
    const text = createDiv({depth: 3});

    paragraph.append(text);
    container.append(paragraph);
    app.append(container);

    const expectedParagraph = findParagraph({container, element: text});

    expect(expectedParagraph).not.toBeUndefined();
  });

  test('should find paragraph for sub child', () => {
    const app = createDiv({depth: 0});
    const container = createDiv({depth: 1});
    const paragraph = createDiv({depth: 2});
    const span = createDiv({depth: 3});
    const text = createDiv({depth: 4});

    span.append(text);
    paragraph.append(span);
    container.append(paragraph);
    app.append(container);

    const expectedParagraph = findParagraph({container, element: text});

    expect(expectedParagraph).not.toBeUndefined();
  });

  test('should be a start node', () => {
    const app = createDiv({depth: 0});
    const container = createDiv({depth: 1});
    const paragraph = createDiv({depth: 2});
    const text = createDiv({depth: 3});

    paragraph.append(text);
    container.append(paragraph);
    app.append(container);

    const expectedParagraph = isStartNode({container, element: text});

    expect(expectedParagraph).toBeTruthy();
  });

  test('should not be a start node', () => {
    const app = createDiv({depth: 0});
    const container = createDiv({depth: 1});
    const paragraph = createDiv({depth: 2});
    const text = createDiv({depth: 3});
    const span = createDiv({depth: 3});

    paragraph.append(text);
    paragraph.append(span);
    container.append(paragraph);
    app.append(container);

    const expectedParagraph = isStartNode({container, element: span});

    expect(expectedParagraph).toBeFalsy();
  });

  test('should be a paragraph', () => {
    const app = createDiv({depth: 0});
    const container = createDiv({depth: 1});
    const paragraph = createDiv({depth: 2});

    container.append(paragraph);
    app.append(container);

    expect(isParagraph({container, element: paragraph})).toBeTruthy();
  });

  test('should not be a paragraph', () => {
    const app = createDiv({depth: 0});
    const container = createDiv({depth: 1});
    const paragraph = createDiv({depth: 2});
    const span = createDiv({depth: 3});

    paragraph.append(span);
    container.append(paragraph);
    app.append(container);

    expect(isParagraph({container, element: span})).toBeFalsy();
  });

  test('should be an empty paragraph', () => {
    const paragraph = document.createElement('div');
    expect(isParagraphEmpty({paragraph})).toBeTruthy();

    const paragraph2 = document.createElement('div');
    paragraph2.innerHTML = '\u200B';
    expect(isParagraphEmpty({paragraph: paragraph2})).toBeTruthy();

    const paragraph3 = document.createElement('div');
    paragraph3.innerText = '';
    expect(isParagraphEmpty({paragraph: paragraph3})).toBeTruthy();
  });

  test('should not be an empty paragraph', () => {
    const paragraph = document.createElement('div');
    paragraph.innerHTML = 'test';
    expect(isParagraphEmpty({paragraph})).toBeFalsy();

    const paragraph2 = document.createElement('div');
    const br = document.createElement('br');
    paragraph2.append(br);
    expect(isParagraphEmpty({paragraph: paragraph2})).toBeTruthy();

    const paragraph3 = document.createElement('div');
    const span = document.createElement('span');
    span.innerHTML = 'test';
    paragraph3.append(span);
    expect(isParagraphEmpty({paragraph: paragraph3})).toBeFalsy();
  });

  test('should create a paragraph', () => {
    const app = createDiv({depth: 0});
    const container = createDiv({depth: 1});
    const paragraph = createDiv({depth: 2});

    container.append(paragraph);
    app.append(container);

    Object.defineProperty(paragraph, 'after', {
      value: jest.fn((node) => {
        container.append(node);
      })
    });

    createEmptyParagraph({paragraph, container});

    expect(paragraph.nextElementSibling).not.toBeUndefined();
  });

  test('should be an code paragraph', () => {
    const paragraph = document.createElement('div');
    expect(isParagraphCode({paragraph})).toBeFalsy();

    const code = document.createElement('code');
    expect(isParagraphCode({paragraph: code})).toBeTruthy();

    const pre = document.createElement('pre');
    expect(isParagraphCode({paragraph: pre})).toBeTruthy();

    const ddg = document.createElement('deckgo-highlight-code');
    expect(isParagraphCode({paragraph: ddg})).toBeTruthy();
  });

  test('should be an editable paragraph', () => {
    const paragraph = document.createElement('div');
    expect(isParagraphNotEditable({paragraph})).toBeFalsy();

    const paragraph2 = document.createElement('div');
    paragraph2.setAttribute('contenteditable', '');
    expect(isParagraphNotEditable({paragraph: paragraph2})).toBeFalsy();

    const paragraph3 = document.createElement('div');
    paragraph3.setAttribute('contenteditable', 'false');
    expect(isParagraphNotEditable({paragraph: paragraph3})).toBeTruthy();
  });
});
