import {Component, Event, EventEmitter, h, Prop, State} from '@stencil/core';
import configStore from '../../../../stores/config.store';
import {ToolbarImageAlign, ToolbarImageSize} from '../../../../types/toolbar';
import {toHTMLElement} from '../../../../utils/node.utils';
import {findParagraph} from '../../../../utils/paragraph.utils';
import {isAnchorImage} from '../../../../utils/toolbar.utils';
import {IconAlignImageBlock} from '../../../icons/align-image-block';
import {IconAlignImageStart} from '../../../icons/align-image-start';
import {IconImage} from '../../../icons/image';
import {IconTrash} from '../../../icons/trash';

@Component({
  tag: 'stylo-toolbar-image',
  styleUrl: 'image.scss',
  shadow: true
})
export class Image {
  @Prop()
  anchorEvent: MouseEvent | TouchEvent;

  @Prop()
  imgDidChange: EventEmitter<HTMLElement>;

  @Prop()
  containerRef: HTMLElement | undefined;

  @State()
  private imageSize: ToolbarImageSize;

  @State()
  private imageAlign: ToolbarImageAlign;

  @Event()
  imgModified: EventEmitter<void>;

  componentWillLoad() {
    const target: HTMLImageElement = this.anchorEvent.target as HTMLImageElement;

    const {img} = configStore.state.toolbar.actions;

    if (target.style.getPropertyValue(img?.propertyWidth) === '25%') {
      this.imageSize = ToolbarImageSize.SMALL;
    } else if (target.style.getPropertyValue(img?.propertyWidth) === '50%') {
      this.imageSize = ToolbarImageSize.MEDIUM;
    } else if (target.style.getPropertyValue(img?.propertyWidth) === '75%') {
      this.imageSize = ToolbarImageSize.LARGE;
    } else {
      this.imageSize = ToolbarImageSize.ORIGINAL;
    }

    if (target.style.getPropertyValue(img?.propertyCssFloat) === 'left') {
      this.imageAlign = ToolbarImageAlign.START;
    } else {
      this.imageAlign = ToolbarImageAlign.STANDARD;
    }
  }

  private styleImage(
    e: UIEvent,
    applyFunction: Function,
    param: ToolbarImageSize | ToolbarImageAlign
  ) {
    const isAnchorImg: boolean = this.isAnchorImage();
    if (!isAnchorImg) {
      return;
    }

    e.stopPropagation();

    applyFunction(param);

    const anchorImg: HTMLImageElement = this.anchorEvent.target as HTMLImageElement;
    const container: Node | undefined = findParagraph({
      element: anchorImg,
      container: this.containerRef
    });

    if (!container) {
      return;
    }

    this.imgDidChange.emit(toHTMLElement(container));

    this.imgModified.emit();
  }

  private setImageWith = (size: ToolbarImageSize) => {
    const {img} = configStore.state.toolbar.actions;

    if (!img) {
      return;
    }

    const anchorImg: HTMLImageElement = this.anchorEvent.target as HTMLImageElement;
    anchorImg.style.setProperty(img.propertyWidth, size.toString());
  };

  private setImageAlignment = (align: ToolbarImageAlign) => {
    const {img} = configStore.state.toolbar.actions;

    if (!img) {
      return;
    }

    const anchorImg: HTMLImageElement = this.anchorEvent.target as HTMLImageElement;

    if (align === ToolbarImageAlign.START) {
      anchorImg.style.setProperty(img.propertyCssFloat, 'left');
    } else {
      anchorImg.style.removeProperty(img.propertyCssFloat);
    }
  };

  private deleteImage($event: UIEvent) {
    const isAnchorImg: boolean = this.isAnchorImage();
    if (!isAnchorImg) {
      return;
    }

    $event.stopPropagation();

    const anchorImg: HTMLImageElement = this.anchorEvent.target as HTMLImageElement;

    if (!anchorImg || !anchorImg.parentElement) {
      return;
    }

    const container: Node | undefined = findParagraph({
      element: anchorImg,
      container: this.containerRef
    });

    if (!container) {
      return;
    }

    anchorImg.parentElement.removeChild(anchorImg);

    this.imgDidChange.emit(toHTMLElement(container));

    this.imgModified.emit();
  }

  private isAnchorImage(): boolean {
    return isAnchorImage(this.anchorEvent, configStore.state.toolbar.actions.img?.anchor);
  }

  render() {
    return [
      <stylo-toolbar-button
        onAction={($event: CustomEvent<UIEvent>) =>
          this.styleImage($event.detail, this.setImageWith, ToolbarImageSize.ORIGINAL)
        }
        class={this.imageSize === ToolbarImageSize.ORIGINAL ? 'active' : undefined}
      >
        <IconImage></IconImage>
      </stylo-toolbar-button>,
      <stylo-toolbar-button
        onAction={($event: CustomEvent<UIEvent>) =>
          this.styleImage($event.detail, this.setImageWith, ToolbarImageSize.LARGE)
        }
        class={this.imageSize === ToolbarImageSize.LARGE ? 'active' : undefined}
      >
        <IconImage style={{width: '18px', height: '18px'}}></IconImage>
      </stylo-toolbar-button>,
      <stylo-toolbar-button
        onAction={($event: CustomEvent<UIEvent>) =>
          this.styleImage($event.detail, this.setImageWith, ToolbarImageSize.MEDIUM)
        }
        class={this.imageSize === ToolbarImageSize.MEDIUM ? 'active' : undefined}
      >
        <IconImage style={{width: '14px', height: '14px'}}></IconImage>
      </stylo-toolbar-button>,
      <stylo-toolbar-button
        onAction={($event: CustomEvent<UIEvent>) =>
          this.styleImage($event.detail, this.setImageWith, ToolbarImageSize.SMALL)
        }
        class={this.imageSize === ToolbarImageSize.SMALL ? 'active' : undefined}
      >
        <IconImage style={{width: '10px', height: '10px'}}></IconImage>
      </stylo-toolbar-button>,

      <stylo-toolbar-separator></stylo-toolbar-separator>,

      <stylo-toolbar-button
        onAction={($event: CustomEvent<UIEvent>) =>
          this.styleImage($event.detail, this.setImageAlignment, ToolbarImageAlign.STANDARD)
        }
        class={this.imageAlign === ToolbarImageAlign.STANDARD ? 'active' : undefined}
      >
        <IconAlignImageBlock></IconAlignImageBlock>
      </stylo-toolbar-button>,
      <stylo-toolbar-button
        onAction={($event: CustomEvent<UIEvent>) =>
          this.styleImage($event.detail, this.setImageAlignment, ToolbarImageAlign.START)
        }
        class={this.imageAlign === ToolbarImageAlign.START ? 'active' : undefined}
      >
        <IconAlignImageStart></IconAlignImageStart>
      </stylo-toolbar-button>,

      <stylo-toolbar-separator></stylo-toolbar-separator>,

      <stylo-toolbar-button
        onAction={($event: CustomEvent<UIEvent>) => this.deleteImage($event.detail)}
      >
        <IconTrash></IconTrash>
      </stylo-toolbar-button>
    ];
  }
}
