import {ExecCommandAction} from '../types/execcommand';

export const actionBold: ExecCommandAction = {
  cmd: 'style',
  detail: {
    style: 'font-weight',
    value: 'bold',
    initial: (element: HTMLElement | null) => element && element.style['font-weight'] === 'bold'
  }
};

export const actionItalic: ExecCommandAction = {
  cmd: 'style',
  detail: {
    style: 'font-style',
    value: 'italic',
    initial: (element: HTMLElement | null) => element && element.style['font-style'] === 'italic'
  }
};

export const actionUnderline: ExecCommandAction = {
  cmd: 'style',
  detail: {
    style: 'text-decoration',
    value: 'underline',
    initial: (element: HTMLElement | null) =>
      element && element.style['text-decoration'] === 'underline'
  }
};

export const actionStrikeThrough: ExecCommandAction = {
  cmd: 'style',
  detail: {
    style: 'text-decoration',
    value: 'line-through',
    initial: (element: HTMLElement | null) =>
      element && element.style['text-decoration'] === 'line-through'
  }
};
