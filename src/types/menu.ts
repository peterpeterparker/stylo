import {StyloIcon} from './icon';

export interface StyloMenuActionEvent {
  paragraph: HTMLElement;
  message: string;
}

export interface StyloMenuAction {
  text: string;
  icon: StyloIcon;
  message: string;
}

/**
 * A list of custom actions to display for a specific type of paragraph
 */
export interface StyloMenu {
  nodeName: string;
  actions: [StyloMenuAction, ...StyloMenuAction[]];
}
