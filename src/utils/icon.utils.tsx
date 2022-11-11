import {h, JSX} from '@stencil/core';
import {IconBlockquote} from '../components/icons/blockquote';
import {IconCode} from '../components/icons/code';
import {IconEllipsisHorizontal} from '../components/icons/ellipsis-horizontal';
import {IconImages} from '../components/icons/images';
import {IconOl} from '../components/icons/ol';
import {IconUl} from '../components/icons/ul';
import {StyloIcon} from '../types/icon';

export const renderIcon = (icon: StyloIcon): JSX.IntrinsicElements | undefined => {
  switch (icon) {
    case 'code':
      return <IconCode></IconCode>;
    case 'ul':
      return <IconUl></IconUl>;
    case 'ol':
      return <IconOl></IconOl>;
    case 'hr':
      return <IconEllipsisHorizontal></IconEllipsisHorizontal>;
    case 'img':
      return <IconImages></IconImages>;
    case 'blockquote':
      return <IconBlockquote></IconBlockquote>;
    default:
      return undefined;
  }
};
