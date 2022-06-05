// keyCode 229 = input is processing - Japanese entry
// https://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
export const isKeyboardEnter = ({code, keyCode}: KeyboardEvent): boolean =>
  ['Enter'].includes(code) && keyCode !== 229;
