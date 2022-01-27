import {StyloIcon} from './icon';

export interface StyloMenuAction {
  text: string;
  icon: StyloIcon;
  action: (params: {paragraph: HTMLElement}) => Promise<void>;
}

/**
 * A list of custom actions to display for a specific type of paragraph
 */
export interface StyloMenu {
  match: (params: {paragraph: HTMLElement}) => boolean;
  actions: [StyloMenuAction, ...StyloMenuAction[]];
}
