export interface ExecCommandStyle {
  style:
    | 'color'
    | 'background-color'
    | 'font-size'
    | 'font-weight'
    | 'font-style'
    | 'text-decoration';
  value: string;
  initial: (element: HTMLElement | null) => boolean;
}

export interface ExecCommandList {
  type: 'ol' | 'ul';
}

export interface ExecCommandAction {
  cmd: 'style' | 'list';
  detail: ExecCommandStyle | ExecCommandList;
}
