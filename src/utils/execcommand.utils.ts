import {ExecCommandAction, ExecCommandList, ExecCommandStyle} from '../types/execcommand';
import {execCommandList} from './execcommand-list.utils';
import {execCommandStyle} from './execcommand-style.utils';

export function execCommand(
  selection: Selection,
  action: ExecCommandAction,
  container: HTMLElement
) {
  if (!document || !selection) {
    return;
  }

  if (action.cmd === 'style') {
    execCommandStyle(selection, action.detail as ExecCommandStyle, container);
  } else if (action.cmd === 'list') {
    execCommandList(selection, action.detail as ExecCommandList, container);
  }
}
