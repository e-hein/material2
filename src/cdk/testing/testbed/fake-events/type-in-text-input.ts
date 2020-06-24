/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ModifierKeys} from '@angular/cdk/testing';
import {dispatchFakeEvent} from './dispatch-events';
import {triggerFocus} from './element-focus';

/**
 * Text inputs that need special threatment of several keys
 */
export type TextInputElement = HTMLInputElement | HTMLTextAreaElement;

/**
 * Checks whether the given Element is a text input element.
 * @docs-private
 */
export function isTextInput(element: Element): element is TextInputElement {
  const nodeName = element.nodeName.toLowerCase();
  return nodeName === 'input' || nodeName === 'textarea' ;
}

/**
 * Simulate special text input behavior.
 *
 * Modifies the value or adjusts the selection of the text input.
 * Will not trigger any keydown, keypress or keyup events.
 *
 * @param element TextInputElement that should recieve the key
 * @param key string with key identifier to handle
 * @param modifiers ModifierKeys to use when hanling the key
 *
 * @docs-private
 */
export function simulateKeyInTextInput(
  element: TextInputElement, key: string, modifiers: ModifierKeys = {},
) {
  if (key.length === 1) {
    simulateCharacterTyping(element, key);
  } else if (key === 'Backspace') {
    simulateBackspace(element);
  } else if (key === 'Enter') {
    simulateEnter(element);
  } else if (isArrowKey(key)) {
    simulateSelection(element, key, modifiers);
  }
}

/**
 * Clears the text in an input or textarea element.
 * @docs-private
 */
export function clearTextInput(element: HTMLInputElement | HTMLTextAreaElement) {
  triggerFocus(element as HTMLElement);
  element.value = '';
  dispatchFakeEvent(element, 'input');
}


function simulateCharacterTyping(element: TextInputElement, key: string) {
  typeCharacter(element, key);
}

function typeCharacter(element: TextInputElement, key: string) {
  const oldValueLength = element.value && element.value.length || 0;
  if (typeof element.selectionStart !== 'number' || element.selectionStart === oldValueLength) {
    element.value += key;
  } else {
    const keys = findUnselectedKeys(element);
    const keysBeforeCursor = keys.beforeSelection + key;
    element.value = keysBeforeCursor + keys.afterSelection;
    element.selectionStart = element.selectionEnd = keysBeforeCursor.length;
    element.selectionDirection = 'none';
  }
  dispatchFakeEvent(element, 'input');
}

function findUnselectedKeys(element: TextInputElement) {
  const value = element.value;
  if (typeof value !== 'string' || value.length < 1) {
    return { beforeSelection: '', afterSeletion: ''};
  }

  const selectionStart = element.selectionStart || 0;
  const selectionEnd = element.selectionEnd || value.length;
  const beforeSelection = value.substr(0, selectionStart);
  const afterSelection = value.substr(selectionEnd);
  return { beforeSelection, afterSelection };
}

function simulateBackspace(element: TextInputElement) {
  const value = element.value;
  if (value && value.length > 0) {
    if (element.selectionStart === element.selectionEnd) {
      const selectionStart = findSelectionStart(element);
      if (selectionStart < 1) {
        return; // nothing to delete, nothing to emit, nothing to do
      }
      element.selectionStart = selectionStart - 1;
      element.selectionEnd = selectionStart;
    }
    typeCharacter(element, '');
  }
}

function findSelectionStart(element: TextInputElement) {
  if (typeof element.selectionStart === 'number') {
    return element.selectionStart;
  }
  if (typeof element.selectionEnd === 'number') {
    return element.selectionEnd;
  }

  const value = element.value;
  return typeof value === 'string' ? value.length : 0;
}

function findSelectionEnd(element: TextInputElement, selectionStart: number | false = false) {
  if (typeof element.selectionEnd === 'number') {
    return element.selectionEnd;
  }
  return selectionStart || findSelectionStart(element);
}

function simulateEnter(element: TextInputElement) {
  if (!isMultilineInput(element)) {
    return;
  }

  typeCharacter(element, '\n');
}

function isMultilineInput(element: TextInputElement) {
  return element.tagName === 'TEXTAREA';
}

function simulateSelection(
  element: TextInputElement, key: ArrowKey, modifiers: ModifierKeys,
) {
  const valueLength = element.value && element.value.length || 0;
  let selectionStart = findSelectionStart(element);
  let selectionEnd = findSelectionEnd(element, selectionStart);
  const selectionDirection = element.selectionDirection || element.selectionDirection === 'none';
  const oldCursorPos = element.selectionDirection === 'backward'
    ? selectionStart
    : selectionEnd
  ;
  const newCursorPos = (() => {
    const cols = (element as HTMLTextAreaElement).cols || valueLength;
    switch (key) {
      case 'ArrowLeft': return Math.max(oldCursorPos - 1, 0);
      case 'ArrowRight': return Math.min(valueLength, oldCursorPos + 1);
      case 'ArrowUp':
        return selectionDirection === 'forward'
          ? Math.max(selectionEnd - cols, selectionStart)
          : Math.max(selectionStart - cols, 0)
        ;
      case 'ArrowDown':
        return selectionDirection === 'backward'
          ? Math.min(selectionStart + cols, selectionEnd)
          : Math.min(selectionEnd + cols, valueLength)
        ;
    }
  })();
  const moving = arrowKeyDirection[key];

  if (!modifiers.shift) {
    element.selectionStart = element.selectionEnd = newCursorPos;
    element.selectionDirection = 'none';
  } else {
    switch (selectionDirection) {
    case 'none':
      if (moving === 'forward') {
        element.selectionEnd = newCursorPos;
      } else if (moving === 'backward') {
        element.selectionStart = newCursorPos;
      }
      element.selectionDirection = moving;
      return;
    case 'forward':
      selectionEnd = newCursorPos;
      break;
    case 'backward':
      selectionStart = newCursorPos;
      break;
    }

    if (selectionStart < selectionEnd) {
      element.selectionStart = selectionStart;
      element.selectionEnd = selectionEnd;
    } else if (selectionEnd === selectionStart) {
      element.selectionEnd = element.selectionStart = selectionEnd;
      element.selectionDirection = 'none';
    } else if (selectionStart > selectionEnd) {
      element.selectionStart = selectionEnd;
      element.selectionEnd = selectionStart;
      element.selectionDirection = moving;
    }
  }
}

type ArrowKey = 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft';
const arrowKeyDirection: { [key in ArrowKey]: 'forward' | 'backward' } = {
  'ArrowUp': 'backward',
  'ArrowRight': 'forward',
  'ArrowDown': 'forward',
  'ArrowLeft': 'backward',
};

function isArrowKey(key: string): key is ArrowKey {
  return !!arrowKeyDirection[key as ArrowKey];
}
