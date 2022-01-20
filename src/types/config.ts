import {StyloEvents} from './events';
import {StyloPlugin} from './plugin';
import {StyloToolbar} from './toolbar';

export interface StyloConfig {
  lang?: Languages;
  plugins?: StyloPlugin[];
  toolbar?: Partial<StyloToolbar>;
  events?: StyloEvents;
}
