import {StyloPlugin, StyloPluginCreateParagraphsParams} from '../types/plugin';
import {createEmptyElement} from '../utils/create-element.utils';
import {transformParagraph} from '../utils/paragraph.utils';

export const h1: StyloPlugin = {
  text: 'huge_title',
  icon: `<span class='placeholder'>H1</span>`,
  createParagraphs: async ({container, paragraph}: StyloPluginCreateParagraphsParams) =>
    transformParagraph({
      elements: [createEmptyElement({nodeName: 'h1'})],
      paragraph,
      container
    })
};
