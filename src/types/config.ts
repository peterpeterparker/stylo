import {StyloMenu} from './menu';
import {StyloPlugin} from './plugin';
import {StyloConfigToolbar} from './toolbar';

export interface StyloConfigI18n {
  lang: Languages;
  custom?: Record<string, string>;
}

export interface StyloConfig {
  i18n?: StyloConfigI18n;
  plugins?: StyloPlugin[];
  toolbar?: Partial<StyloConfigToolbar>;
  menus?: StyloMenu[];
  /**
   * In which type of nodes the placeholder "Press "/" for plugins" should be displayed
   */
  placeholders?: string[];
  /**
   * The paragraphs that accept text. In case user / browser tries to enter text withing another type of paragraphs, Stylo will first preprend the text in a new div to avoid text nodes at the root of the contenteditable container.
   */
  textParagraphs?: string[];
  /**
   * Exclude attributes that should not be observed for changes
   */
  excludeAttributes?: string[];
  /**
   * Do not inject HeadCss (for example stylo is used inside of a webcomponent)
   */
  dontInjectHeadCss?: boolean
}
