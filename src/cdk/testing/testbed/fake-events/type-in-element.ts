/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ModifierKeys} from '@angular/cdk/testing';
import {dispatchKeyboardEvent} from './dispatch-events';
import {triggerFocus} from './element-focus';
import {isTextInput, simulateKeyInTextInput, clearTextInput} from './type-in-text-input';
import {emulateTab} from './emulate-tab';

/**
 * Focuses an input, sets its value and dispatches
 * the `input` event, simulating the user typing.
 * @param element Element onto which to set the value.
 * @param keys The keys to send to the element.
 * @docs-private
 */
export function typeInElement(
    element: HTMLElement, ...keys: (string | {keyCode?: number, key?: string})[]): void;

/**
 * Focuses an input, sets its value and dispatches
 * the `input` event, simulating the user typing.
 * @param element Element onto which to set the value.
 * @param modifiers Modifier keys that are held while typing.
 * @param keys The keys to send to the element.
 * @docs-private
 */
export function typeInElement(element: HTMLElement, modifiers: ModifierKeys,
                              ...keys: (string | {keyCode?: number, key?: string})[]): void;

export function typeInElement(element: HTMLElement, ...modifiersAndKeys: any) {
  const first = modifiersAndKeys[0];
  let modifiers: ModifierKeys;
  let rest: (string | {keyCode?: number, key?: string})[];
  if (typeof first !== 'string' && first.keyCode === undefined && first.key === undefined) {
    modifiers = first;
    rest = modifiersAndKeys.slice(1);
  } else {
    modifiers = {};
    rest = modifiersAndKeys;
  }
  const keys: {keyCode?: number, key?: string}[] = rest
      .map(k => typeof k === 'string' ?
          k.split('').map(c => ({keyCode: c.toUpperCase().charCodeAt(0), key: c})) : [k])
      .reduce((arr, k) => arr.concat(k), []);

  if (document.activeElement !== element) {
    triggerFocus(element);
  }
  for (const key of keys) {
    if (key.key === 'Tab') {
      console.log('tab key found');
      element = emulateTab(modifiers);
    } else {
      dispatchKeyboardEvent(element, 'keydown', key.keyCode, key.key, element, modifiers);
      dispatchKeyboardEvent(element, 'keypress', key.keyCode, key.key, element, modifiers);
      if (isTextInput(element) && key.key) {
        simulateKeyInTextInput(element, key.key, modifiers);
      }
      dispatchKeyboardEvent(element, 'keyup', key.keyCode, key.key, element, modifiers);
    }
  }
}

/**
 * Clears the text in an input or textarea element.
 * @docs-private
 * @deprecated use clearTextInput
 * @breaking-change 10.0.0-rc.2
 */
export function clearElement(element: HTMLInputElement | HTMLTextAreaElement) {
  clearTextInput(element);
}
