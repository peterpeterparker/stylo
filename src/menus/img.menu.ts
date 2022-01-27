import {StyloMenu} from '../types/menu';

const imageSvg = ({width, height}: {width: number; height: number}): string => `<svg
    width="${width}"
    height="${height}"
    viewBox="0 0 312 243"
    style={{
      fillRule: 'evenodd',
      clipRule: 'evenodd',
      strokeLinejoin: 'round',
      strokeMiterlimit: '1.41421',
      ...(style && {...style})
    }}>
    <path
      d="M48.45,198.225l143.025,0c3.375,0 5.325,-3.825 3.375,-6.6l-71.55,-115.05c-1.65,-2.4 -5.175,-2.4 -6.825,0l-71.475,115.05c-1.95,2.775 0.075,6.6 3.45,6.6Zm145.575,-43.5l26.25,41.775c0.75,1.125 2.025,1.8 3.375,1.8l39.9,0c3.375,0 5.325,-3.825 3.375,-6.6l-46.2,-65.775c-1.65,-2.4 -5.175,-2.4 -6.825,0l-19.95,24.075c-0.9,1.35 -0.9,3.225 0.075,4.725Zm33.3,-64.8c9.825,-0.975 17.775,-8.925 18.75,-18.75c1.35,-13.275 -9.75,-24.375 -23.025,-23.025c-9.825,0.975 -17.775,8.925 -18.75,18.75c-1.275,13.275 9.75,24.375 23.025,23.025Z"
      style={{fillRule: 'nonzero', fill: 'currentColor'}}
    />
    <path
      d="M288,0l-264,0c-13.275,0 -24,10.725 -24,24l0,192.75c0,13.275 10.725,25.275 24,25.275l264,0c13.275,0 24,-12 24,-25.275l0,-192.75c0,-13.275 -10.725,-24 -24,-24Zm-2.025,210c0,3.3 -2.7,6 -6,6l-247.95,0c-3.3,0 -6,-2.7 -6,-6l0,-177.975c0,-3.3 2.7,-6 6,-6l248.025,0c3.3,0 6,2.7 6,6l0,177.975l-0.075,0Z"
      style={{fillRule: 'nonzero', fill: 'currentColor'}}
    />
  </svg>`;

const setImageWith = ({
  size,
  paragraph
}: {
  size: '25%' | '50%' | '75%' | '100%';
  paragraph: HTMLElement;
}) => {
  const anchorImg: HTMLImageElement = paragraph.firstElementChild as HTMLImageElement;
  anchorImg.style.setProperty('width', size);
};

export const imgMenu: StyloMenu = {
  match: ({paragraph}: {paragraph: HTMLElement}) =>
    paragraph.firstElementChild?.nodeName.toLowerCase() === 'img',
  actions: [
    {
      text: 'img_width_original',
      icon: imageSvg({width: 20, height: 20}),
      action: async ({paragraph}: {paragraph: HTMLElement}) =>
        setImageWith({paragraph, size: '100%'})
    },
    {
      text: 'img_width_large',
      icon: imageSvg({width: 18, height: 18}),
      action: async ({paragraph}: {paragraph: HTMLElement}) =>
        setImageWith({paragraph, size: '75%'})
    },
    {
      text: 'img_width_medium',
      icon: imageSvg({width: 14, height: 14}),
      action: async ({paragraph}: {paragraph: HTMLElement}) =>
        setImageWith({paragraph, size: '50%'})
    },
    {
      text: 'img_width_small',
      icon: imageSvg({width: 10, height: 10}),
      action: async ({paragraph}: {paragraph: HTMLElement}) =>
        setImageWith({paragraph, size: '25%'})
    },
    {
      text: 'img_delete',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width='20' height='20'>
        <path
          d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="32"
        />
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-miterlimit="10"
          stroke-width="32"
          d="M80 112h352"
        />
        <path
          d="M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="32"
        />
      </svg>`,
      action: async ({paragraph}: {paragraph: HTMLElement}) => {
        paragraph.parentElement.removeChild(paragraph);
      }
    }
  ]
};
