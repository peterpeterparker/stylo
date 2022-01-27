import {Fragment, FunctionalComponent, h} from '@stencil/core';
import configStore from '../../../../../stores/config.store';
import {ExecCommandAction} from '../../../../../types/execcommand';
import {ToolbarActions, ToolbarAlign, ToolbarList} from '../../../../../types/toolbar';
import {IconAlignCenter} from '../../../../icons/align-center';
import {IconAlignLeft} from '../../../../icons/align-left';
import {IconAlignRight} from '../../../../icons/align-right';
import {IconColor} from '../../../../icons/color';
import {IconLink} from '../../../../icons/link';
import {IconOl} from '../../../../icons/ol';
import {IconPalette} from '../../../../icons/palette';
import {IconUl} from '../../../../icons/ul';

interface StyleProps {
  align: ToolbarAlign;
  list: ToolbarList | undefined;
  disabledTitle: boolean;
  bold: 'bold' | 'initial' | undefined;
  italic: 'italic' | 'initial' | undefined;
  underline: 'underline' | 'initial' | undefined;
  strikethrough: 'strikethrough' | 'initial' | undefined;
  link: boolean;

  switchToolbarActions: (actions: ToolbarActions) => void;
  onExecCommand: ($event: CustomEvent<ExecCommandAction>) => void;
  toggleLink: () => void;
}

export const Style: FunctionalComponent<StyleProps> = ({
  align,
  list,
  switchToolbarActions,
  disabledTitle,
  bold,
  italic,
  strikethrough,
  underline,
  link,
  onExecCommand,
  toggleLink
}: StyleProps) => {
  const renderSeparator = () => <stylo-toolbar-separator></stylo-toolbar-separator>;

  const renderLinkSeparator = () => {
    if (!list && !align) {
      return undefined;
    }

    return renderSeparator();
  };

  const renderListAction = () => {
    if (!configStore.state.toolbar.style.list) {
      return undefined;
    }

    return (
      <stylo-toolbar-button onAction={() => switchToolbarActions(ToolbarActions.LIST)}>
        {list === ToolbarList.UNORDERED ? <IconUl></IconUl> : <IconOl></IconOl>}
      </stylo-toolbar-button>
    );
  };

  const renderAlignAction = () => {
    if (!configStore.state.toolbar.style.align) {
      return undefined;
    }

    return (
      <stylo-toolbar-button onAction={() => switchToolbarActions(ToolbarActions.ALIGNMENT)}>
        {align === ToolbarAlign.LEFT ? (
          <IconAlignLeft></IconAlignLeft>
        ) : align === ToolbarAlign.CENTER ? (
          <IconAlignCenter></IconAlignCenter>
        ) : (
          <IconAlignRight></IconAlignRight>
        )}
      </stylo-toolbar-button>
    );
  };

  const renderFontSizeAction = () => {
    if (!configStore.state.toolbar.style.fontSize) {
      return undefined;
    }

    return (
      <Fragment>
        <stylo-toolbar-button onAction={() => switchToolbarActions(ToolbarActions.FONT_SIZE)}>
          <span>
            A<small>A</small>
          </span>
        </stylo-toolbar-button>

        {renderSeparator()}
      </Fragment>
    );
  };

  const renderColorActions = () => {
    const result = [
      <stylo-toolbar-button onAction={() => switchToolbarActions(ToolbarActions.COLOR)}>
        <IconPalette></IconPalette>
      </stylo-toolbar-button>
    ];

    if (configStore.state.toolbar.style.backgroundColor) {
      result.push(
        <stylo-toolbar-button
          onAction={() => switchToolbarActions(ToolbarActions.BACKGROUND_COLOR)}>
          <IconColor></IconColor>
        </stylo-toolbar-button>
      );
    }

    return result;
  };

  return (
    <Fragment>
      <stylo-toolbar-text
        disabledTitle={disabledTitle}
        bold={bold === 'bold'}
        italic={italic === 'italic'}
        underline={underline === 'underline'}
        strikethrough={strikethrough === 'strikethrough'}
        onExecCommand={($event: CustomEvent<ExecCommandAction>) =>
          onExecCommand($event)
        }></stylo-toolbar-text>

      {renderSeparator()}

      {renderFontSizeAction()}

      {renderColorActions()}

      {renderSeparator()}

      {renderAlignAction()}

      {renderListAction()}

      {renderLinkSeparator()}

      <stylo-toolbar-button onAction={toggleLink} cssClass={link ? 'active' : undefined}>
        <IconLink></IconLink>
      </stylo-toolbar-button>
    </Fragment>
  );
};
