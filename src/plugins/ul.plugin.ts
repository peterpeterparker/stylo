import {StyloPlugin, StyloPluginCreateParagraphsParams} from '../types/plugin';
import {createEmptyElement} from '../utils/create-element.utils';
import {transformParagraph} from '../utils/transform-paragraph.utils';

const createListItem = (): HTMLLIElement => {
  const item: HTMLLIElement = document.createElement('li');
  item.innerHTML = '\u200B';
  return item;
};

export const ul: StyloPlugin = {
  text: 'list',
  icon: 'ul',
  createParagraphs: async ({container, paragraph}: StyloPluginCreateParagraphsParams) => {
    const ul: HTMLUListElement = document.createElement('ul');

    ul.append(createListItem());

    await transformParagraph({
      elements: [ul, createEmptyElement({nodeName: 'div'})],
      paragraph,
      container
    });
  }
};
