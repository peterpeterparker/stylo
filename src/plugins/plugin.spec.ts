import {Blob} from 'blob-polyfill';
import {StyloPlugin} from '../types/plugin';
import {code} from './code.plugin';
import {h1} from './h1.plugin';
import {h2} from './h2.plugin';
import {h3} from './h3.plugin';
import {hr} from './hr.plugin';
import {img} from './img.plugin';
import {ol, ul} from './list.plugin';

describe('plugins', () => {
  let container, paragraph;

  beforeEach(() => {
    container = document.createElement('article');

    paragraph = document.createElement('div');
    paragraph.setAttribute('test', 'test');

    Object.defineProperty(paragraph, 'replaceWith', {
      value: jest.fn((node1, node2) => {
        container.append(node1);

        if (node2) {
          container.append(node2);
        }

        paragraph.parentElement.removeChild(paragraph);
      })
    });

    container.append(paragraph);
  });

  const expectTransform = ({
    plugin,
    firstNodeName,
    files
  }: {
    plugin: StyloPlugin;
    firstNodeName: string;
    files?: FileList;
  }) => {
    const {createParagraphs} = plugin;

    createParagraphs({
      container,
      paragraph,
      files
    });

    expect(container.firstChild.nodeName.toLowerCase()).toEqual(firstNodeName);
  };

  const expectEmpty = (node) => {
    expect(node.nodeName.toLowerCase()).toEqual('div');
    expect(node.innerHTML).toEqual('\u200B');
  };

  it('should transform to h1', () => expectTransform({plugin: h1, firstNodeName: 'h1'}));
  it('should transform to h2', () => expectTransform({plugin: h2, firstNodeName: 'h2'}));
  it('should transform to h3', () => expectTransform({plugin: h3, firstNodeName: 'h3'}));

  it('should transform to hr', () => {
    expectTransform({plugin: hr, firstNodeName: 'hr'});

    const {lastChild} = container;

    expectEmpty(lastChild);
  });

  it('should transform to ul', () => {
    expectTransform({plugin: ul, firstNodeName: 'ul'});

    const {firstChild, lastChild} = container;

    expect(firstChild.firstChild.nodeName.toLowerCase()).toEqual('li');

    expectEmpty(lastChild);
  });

  it('should transform to img', () => {
    const blob = new Blob([''], {type: 'text/plain'});
    blob['lastModifiedDate'] = '';
    blob['name'] = 'filename';
    const fileList: FileList = {
      0: blob as File,
      length: 1,
      item: (_index: number) => blob as File
    };

    expectTransform({
      plugin: img,
      firstNodeName: 'img',
      files: fileList
    });

    const {firstChild, lastChild} = container;

    expect(firstChild.hasAttribute('src')).toBeTruthy();
    expect(firstChild.getAttribute('loading')).toEqual('lazy');

    expectEmpty(lastChild);
  });

  it('should transform to code', () => {
    expectTransform({plugin: code, firstNodeName: 'code'});

    const {lastChild} = container;

    expectEmpty(lastChild);
  });

  it('should render properties h1', () => {
    expect(h1.text).toEqual('huge_title');
    expect(h1.icon).toEqual("<span class='placeholder'>H1</span>");
  });

  it('should render properties h2', () => {
    expect(h2.text).toEqual('large_title');
    expect(h2.icon).toEqual("<span class='placeholder'>H2</span>");
  });

  it('should render properties h3', () => {
    expect(h3.text).toEqual('small_title');
    expect(h3.icon).toEqual("<span class='placeholder'>H3</span>");
  });

  it('should render properties hr', () => {
    expect(hr.text).toEqual('separator');
    expect(hr.icon).toEqual('hr');
  });

  it('should render properties code', () => {
    expect(code.text).toEqual('code');
    expect(code.icon).toEqual('code');
  });

  it('should render properties img', () => {
    expect(img.text).toEqual('image');
    expect(img.icon).toEqual('img');
    expect(img.files.accept).toEqual('image/x-png,image/jpeg,image/gif,image/svg+xml,image/webp');
    expect(img.files.multiple).toBeFalsy();
  });

  it('should render properties ul', () => {
    expect(ul.text).toEqual('unordered_list');
    expect(ul.icon).toEqual('ul');
  });

  it('should render properties ol', () => {
    expect(ol.text).toEqual('ordered_list');
    expect(ol.icon).toEqual('ol');
  });
});
