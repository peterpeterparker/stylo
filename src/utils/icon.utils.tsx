import {h, JSX} from '@stencil/core';
import {IconCode} from '../components/icons/code';
import {IconEllipsisHorizontal} from '../components/icons/ellipsis-horizontal';
import {IconImages} from '../components/icons/images';
import {IconList} from '../components/icons/list';
import {StyloIcon} from '../types/icon';

export const renderIcon = (icon: StyloIcon): JSX.IntrinsicElements | undefined => {
  switch (icon) {
    case 'code':
      return <IconCode></IconCode>;
    case 'ul':
      return <IconList></IconList>;
    case 'hr':
      return <IconEllipsisHorizontal></IconEllipsisHorizontal>;
    case 'img':
      return <IconImages></IconImages>;
    default:
      return undefined;
  }
};
