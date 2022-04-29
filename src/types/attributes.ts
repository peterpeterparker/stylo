export interface StyloConfigAttributes {
  /**
   * An identifier that is mostly use to detect deletion of paragraphs. It identifies which elements are paragraphs, which are not.
   */
  paragraphIdentifier: string;
  /**
   *  Exclude attributes that should not be observed for changes. ParagraphIdentifier will be added to the list.
   */
  exclude: string[];
}
