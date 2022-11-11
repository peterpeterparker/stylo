import {createStore} from '@stencil/store';
import {code} from '../plugins/code.plugin';
import {h1} from '../plugins/h1.plugin';
import {h2} from '../plugins/h2.plugin';
import {h3} from '../plugins/h3.plugin';
import {hr} from '../plugins/hr.plugin';
import {blockquote} from '../plugins/blockquote.plugin';
import {img} from '../plugins/img.plugin';
import {ol, ul} from '../plugins/list.plugin';
import {StyloConfigAttributes} from '../types/attributes';
import {StyloMenu} from '../types/menu';
import {DEFAULT_PALETTE} from '../types/palette';
import {StyloPlugin} from '../types/plugin';
import {StyloConfigToolbar} from '../types/toolbar';

interface ConfigStore {
  plugins: StyloPlugin[];
  toolbar: StyloConfigToolbar;
  menus: StyloMenu[] | undefined;
  placeholders: string[] | undefined;
  textParagraphs: string[] | undefined;
  attributes: StyloConfigAttributes;
}

export const DEFAULT_PLUGINS: StyloPlugin[] = [h1, h2, h3, ul, ol, blockquote, img, code, hr];

export const DEFAULT_TOOLBAR: StyloConfigToolbar = {
  palette: DEFAULT_PALETTE,
  command: 'native',
  style: {
    list: false,
    align: true,
    fontSize: true,
    backgroundColor: true
  }
};

export const DEFAULT_PLACEHOLDERS = ['div', 'p', 'span'];

export const DEFAULT_TEXT_PARAGRAPHS = ['h1', 'h2', 'h3', 'div', 'p', 'blockquote'];

export const DEFAULT_EXCLUDE_ATTRIBUTES = [
  'placeholder',
  'class',
  'spellcheck',
  'contenteditable',
  'data-gramm',
  'data-gramm_id',
  'data-gramm_editor',
  'data-gr-id',
  'autocomplete'
];

export const DEFAULT_PARAGRAPH_IDENTIFIER: string = 'paragraph_id';

const DEFAULT_ATTRIBUTES: StyloConfigAttributes = {
  paragraphIdentifier: DEFAULT_PARAGRAPH_IDENTIFIER,
  exclude: [...DEFAULT_EXCLUDE_ATTRIBUTES, DEFAULT_PARAGRAPH_IDENTIFIER]
};

const {state, onChange} = createStore<ConfigStore>({
  plugins: DEFAULT_PLUGINS,
  toolbar: DEFAULT_TOOLBAR,
  placeholders: DEFAULT_PLACEHOLDERS,
  textParagraphs: DEFAULT_TEXT_PARAGRAPHS,
  menus: undefined,
  attributes: DEFAULT_ATTRIBUTES
});

export default {state, onChange};
