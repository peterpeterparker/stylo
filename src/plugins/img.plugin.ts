import {StyloPlugin, StyloPluginCreateParagraphsParams} from '../types/plugin';
import {createEmptyElement, createUneditableDiv} from '../utils/create-element.utils';
import {transformParagraph} from '../utils/paragraph.utils';

export const img: StyloPlugin = {
  text: 'image',
  icon: 'img',
  files: {
    accept: 'image/x-png,image/jpeg,image/gif,image/svg+xml,image/webp',
    multiple: false
  },
  createParagraphs: async ({container, paragraph, files}: StyloPluginCreateParagraphsParams) => {
    const URL = window.URL || window.webkitURL;
    const imgUrl: string = URL.createObjectURL(files[0]);

    const img: HTMLImageElement = document.createElement('img');
    img.src = imgUrl;
    img.setAttribute('loading', 'lazy');

    const element: HTMLDivElement = createUneditableDiv();
    element.append(img);

    const emptyDiv: HTMLElement = createEmptyElement({nodeName: 'div'});

    transformParagraph({
      elements: [element, emptyDiv],
      paragraph,
      container,
      focus: 'last'
    });
  }
};
