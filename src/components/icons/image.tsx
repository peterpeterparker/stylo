import {FunctionalComponent, h} from '@stencil/core';

export interface IconImageProps {
  style?: Record<string, string>;
}

export const IconImage: FunctionalComponent<IconImageProps> = ({style}: IconImageProps) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 312 243"
    style={{
      fillRule: 'evenodd',
      clipRule: 'evenodd',
      strokeLinejoin: 'round',
      strokeMiterlimit: '1.41421',
      ...(style && {...style})
    }}
  >
    <path
      d="M48.45,198.225l143.025,0c3.375,0 5.325,-3.825 3.375,-6.6l-71.55,-115.05c-1.65,-2.4 -5.175,-2.4 -6.825,0l-71.475,115.05c-1.95,2.775 0.075,6.6 3.45,6.6Zm145.575,-43.5l26.25,41.775c0.75,1.125 2.025,1.8 3.375,1.8l39.9,0c3.375,0 5.325,-3.825 3.375,-6.6l-46.2,-65.775c-1.65,-2.4 -5.175,-2.4 -6.825,0l-19.95,24.075c-0.9,1.35 -0.9,3.225 0.075,4.725Zm33.3,-64.8c9.825,-0.975 17.775,-8.925 18.75,-18.75c1.35,-13.275 -9.75,-24.375 -23.025,-23.025c-9.825,0.975 -17.775,8.925 -18.75,18.75c-1.275,13.275 9.75,24.375 23.025,23.025Z"
      style={{fillRule: 'nonzero', fill: 'currentColor'}}
    />
    <path
      d="M288,0l-264,0c-13.275,0 -24,10.725 -24,24l0,192.75c0,13.275 10.725,25.275 24,25.275l264,0c13.275,0 24,-12 24,-25.275l0,-192.75c0,-13.275 -10.725,-24 -24,-24Zm-2.025,210c0,3.3 -2.7,6 -6,6l-247.95,0c-3.3,0 -6,-2.7 -6,-6l0,-177.975c0,-3.3 2.7,-6 6,-6l248.025,0c3.3,0 6,2.7 6,6l0,177.975l-0.075,0Z"
      style={{fillRule: 'nonzero', fill: 'currentColor'}}
    />
  </svg>
);
