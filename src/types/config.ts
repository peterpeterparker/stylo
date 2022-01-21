import {StyloEvents} from './events';
import {StyloPlugin} from './plugin';
import {StyloToolbar} from './toolbar';

export interface StyloConfig {
  lang?: Languages;
  plugins?: StyloPlugin[];
  toolbar?: Partial<StyloToolbar>;
  /**
   * A custom list of events to watch for to throw data events
   */
  events?: StyloEvents;
  /**
   * In which type of nodes the placeholder "Press "/" for plugins" should be displayed
   */
  placeholders?: string[];
}
