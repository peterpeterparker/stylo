import {StyloMenu} from './menu';
import {StyloPlugin} from './plugin';
import {StyloToolbar} from './toolbar';

export interface StyloConfigI18n {
  lang: Languages;
  custom?: Record<string, string>;
}

export interface StyloConfig {
  i18n?: StyloConfigI18n;
  plugins?: StyloPlugin[];
  toolbar?: Partial<StyloToolbar>;
  menus?: StyloMenu[];
  /**
   * In which type of nodes the placeholder "Press "/" for plugins" should be displayed
   */
  placeholders?: string[];
}
