import {ToolbarFontSize, ToolbarList} from '../types/toolbar';
import {
  findStyleNode,
  getBold,
  getFontSize,
  getItalic,
  getList,
  getStrikeThrough,
  getUnderline
} from './toolbar.utils';

describe('toolbar utils', () => {
  const createElement = ({nodeName, depth}: {nodeName: string; depth: number}) => {
    const element = document.createElement(nodeName);
    element.setAttribute('depth', `${depth}`);

    Object.defineProperty(element, 'isEqualNode', {
      value: jest.fn((node) => element?.getAttribute('depth') === node?.getAttribute('depth'))
    });

    return element;
  };

  it('should find style in node', () => {
    const app = createElement({nodeName: 'div', depth: 0});

    const div = createElement({nodeName: 'div', depth: 1});
    div.style.backgroundColor = '#ff0000';

    const span = createElement({nodeName: 'span', depth: 2});
    span.style.backgroundColor = '#ff0033';

    div.append(span);
    app.append(div);

    const node: Node | null = findStyleNode(span, 'background-color', app);

    expect(node).not.toBeNull();
    expect((node as HTMLElement).style.backgroundColor).toEqual('#ff0033');
  });

  it('should get bold info', () => {
    expect(getBold(document.createElement('b'))).toEqual('bold');
    expect(getBold(document.createElement('strong'))).toEqual('bold');

    const bold = document.createElement('span');
    bold.style.fontWeight = 'bold';
    expect(getBold(bold)).toEqual('bold');

    const notBold = document.createElement('span');
    expect(getBold(notBold)).toBeUndefined();

    const initial = document.createElement('span');
    initial.style.fontWeight = 'initial';
    expect(getBold(initial)).toEqual('initial');
  });

  it('should get font size', () => {
    const span = document.createElement('span');
    span.setAttribute('size', '2');
    expect(getFontSize(span)).toEqual(ToolbarFontSize.SMALL);
  });

  it('should get ul', () => {
    const li = document.createElement('li');
    const ul = document.createElement('ul');
    ul.append(li);
    expect(getList(li)).toEqual(ToolbarList.UNORDERED);
  });

  it('should get ol', () => {
    const li = document.createElement('li');
    const ul = document.createElement('ol');
    ul.append(li);
    expect(getList(li)).toEqual(ToolbarList.ORDERED);
  });

  it('should get strike', () => {
    expect(getStrikeThrough(document.createElement('strike'))).toEqual('strikethrough');

    const span = document.createElement('span');
    span.style.textDecoration = 'line-through';
    expect(getStrikeThrough(span)).toEqual('strikethrough');

    const initial = document.createElement('span');
    initial.style.textDecoration = 'initial';
    expect(getStrikeThrough(initial)).toEqual('initial');
  });

  it('should get underline', () => {
    expect(getUnderline(document.createElement('u'))).toEqual('underline');

    const span = document.createElement('span');
    span.style.textDecoration = 'underline';
    expect(getUnderline(span)).toEqual('underline');

    const initial = document.createElement('span');
    initial.style.textDecoration = 'initial';
    expect(getUnderline(initial)).toEqual('initial');
  });

  it('should get italic', () => {
    expect(getItalic(document.createElement('i'))).toEqual('italic');
    expect(getItalic(document.createElement('em'))).toEqual('italic');

    const span = document.createElement('span');
    span.style.fontStyle = 'italic';
    expect(getItalic(span)).toEqual('italic');

    const initial = document.createElement('span');
    initial.style.fontStyle = 'initial';
    expect(getItalic(initial)).toEqual('initial');
  });
});
