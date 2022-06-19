import {isAndroid, isIOS, isMobile as isMobileDevice} from '@deckdeckgo/utils';

/**
 * isMobileDevice detects device that has touch and no mouse pointer so for example a Samsung Note 20 would probably not match.
 * that's why we enhance the check with android and ios, considering these as mobile devices too.
 */
export const isMobile = (): boolean => isMobileDevice() || isAndroid() || isIOS();
