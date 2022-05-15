import {Component, ComponentInterface, Event, EventEmitter, h, Host, Prop} from '@stencil/core';
import {ToolbarActions, ToolbarAnchorLink} from '../../../../../types/toolbar';
import {createLink} from '../../../../../utils/link.utils';
import {toHTMLElement} from '../../../../../utils/node.utils';
import {findParagraph} from '../../../../../utils/paragraph.utils';

@Component({
  tag: 'stylo-toolbar-link',
  styleUrl: 'link.scss',
  shadow: true
})
export class Link implements ComponentInterface {
  private linkUrl: string;

  @Prop()
  containerRef: HTMLElement | undefined;

  @Prop()
  toolbarActions: ToolbarActions;

  @Prop()
  anchorLink: ToolbarAnchorLink;

  @Prop()
  linkCreated: EventEmitter<HTMLElement>;

  @Event()
  linkModified: EventEmitter<boolean>;

  private input: HTMLInputElement | undefined;

  componentDidLoad() {
    setTimeout(() => this.input?.focus(), 250);
  }

  private handleLinkInput($event: UIEvent) {
    this.linkUrl = ($event.target as InputTargetEvent).value;
  }

  private createLink() {
    if (!this.anchorLink) {
      return;
    }

    const {range} = this.anchorLink;

    if (!range) {
      return;
    }

    if (!this.linkUrl || this.linkUrl.length <= 0) {
      return;
    }

    createLink({range, linkUrl: this.linkUrl});

    const container: Node | undefined = findParagraph({
      element: range.commonAncestorContainer,
      container: this.containerRef
    });

    if (!container) {
      return;
    }

    this.linkCreated.emit(toHTMLElement(container));
  }

  private handleLinkEnter($event: KeyboardEvent) {
    if (!$event) {
      return;
    }

    if (
      this.toolbarActions === ToolbarActions.STYLE &&
      ($event.key.toLowerCase() === 'backspace' || $event.key.toLowerCase() === 'delete')
    ) {
      this.linkModified.emit(false);
    } else if (
      this.toolbarActions === ToolbarActions.LINK &&
      $event.key.toLowerCase() === 'enter'
    ) {
      this.createLink();
      this.linkModified.emit(true);
    }
  }

  render() {
    return (
      <Host>
        <input
          ref={(el) => (this.input = el as HTMLInputElement)}
          placeholder="Add a link..."
          onClick={($event) => $event.stopPropagation()}
          onInput={($event: UIEvent) => this.handleLinkInput($event)}
          onKeyUp={($event: KeyboardEvent) => this.handleLinkEnter($event)}></input>
      </Host>
    );
  }
}
