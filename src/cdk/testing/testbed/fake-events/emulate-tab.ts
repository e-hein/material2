/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ModifierKeys} from '@angular/cdk/testing';
import {dispatchKeyboardEvent} from './dispatch-events';
import {triggerBlur, triggerFocus} from './element-focus';

const possibleSizeAttributeKeys = new Array<keyof HTMLElement>(
  'offsetHeight', 'scrollHeight', 'clientHeight',
);

interface HTMLElementWithValidTabIndex extends HTMLElement {
  tabIndex: number;
}

export class EmulateTab {
  static backwards() {
    const source = getActiveElement();
    const target = getPreviousElement(getActiveElement());
    const modifiers = { shift: true };
    return emulateTabFromSourceToTarget(source, target, modifiers);
  }
  static forwards() {
    const source = getActiveElement();
    const target = getNextElement(getActiveElement());
    const modifiers = {};
    return emulateTabFromSourceToTarget(source, target, modifiers);
  }
  static readonly findSelectableElements = findAllElementsSelectableByTab;
}

export function emulateTab(modifiers: ModifierKeys = {}) {
  return modifiers.shift
    ? EmulateTab.backwards()
    : EmulateTab.forwards()
  ;
}

function emulateTabFromSourceToTarget(
  source: HTMLElement, target: HTMLElement, modifiers: { shift?: boolean} = {},
) {
  dispatchKeyboardEvent(source, 'keydown', 9, 'Tab', source, modifiers);
  triggerBlur(source);
  if (target instanceof HTMLInputElement) {
    target.selectionStart = 0;
  }
  triggerFocus(target);
  dispatchKeyboardEvent(target, 'keyup', 9, 'Tab', source, modifiers);
  return target;
}

function getActiveElement(): HTMLElement {
  const element = document.activeElement;
  return element instanceof HTMLElement ? element : document.body;
}

function getPreviousElement(lastElement: HTMLElement = document.body) {
  const selectableElements = findAllElementsSelectableByTab();
  if (selectableElements.length < 1) {
    throw new Error('no selectable elements found');
  }

  const currentIndex = selectableElements.indexOf(lastElement);
  const previousIndex = (currentIndex > 0 ? currentIndex : selectableElements.length) - 1;
  const previousElement = selectableElements[previousIndex];
  return previousElement;
}

function getNextElement(lastElement: HTMLElement = document.body) {
  const selectableElements = findAllElementsSelectableByTab();
  if (selectableElements.length < 1) {
    throw new Error('no selectable elements found');
  }

  const currentIndex = selectableElements.indexOf(lastElement);
  const nextIndex = currentIndex + 1 < selectableElements.length ? currentIndex + 1 : 0;
  const nextElement = selectableElements[nextIndex];
  return nextElement;
}

function findAllElementsSelectableByTab() {
  const allElements = Array.from(document.querySelectorAll('*')).filter(isHtmlElement);
  initIsVisibleOnce();
  const tabGroups = allElements
    .filter(testAll(
      hasValidTabIndex, isVisible, isNotDisabledInput, isNotSkippableAnchor, isNotCollapsed,
    ))
    .reduce((grouped, element) => {
      const tabIndex = element.tabIndex;
      const tabGroup = grouped['' + tabIndex] || { tabIndex, elements: [] };
      tabGroup.elements.push(element);
      grouped[tabIndex] = tabGroup;
      return grouped;
    }, {} as { [tabIndex: string]: { tabIndex: number, elements: HTMLElement[] } })
  ;
  const selectableElements = Object.keys(tabGroups).map((key) => tabGroups[key])
    .sort(byComparingTabIndex)
    .reduce((all, more) => all.concat(more.elements), new Array<HTMLElement>());
  return selectableElements;
}

const isHtmlElement = (element: any): element is HTMLElement => element instanceof HTMLElement;

let isVisible: (element: HTMLElement) => boolean;

let initIsVisibleOnce = () => {
  const sizeAttributeKey = findSizeAttributeKey();
  if (sizeAttributeKey) {
    // console.log('use isVisible by size attribute: ' + sizeAttributeKey);
    isVisible = isVisibleBySize(sizeAttributeKey);
  } else {
    // console.log('use isVisible by parents');
    isVisible = isVisibleByParents;
  }
  initIsVisibleOnce = () => {};
};

const isVisibleBySize = (sizeAttribute: keyof HTMLElement) => (element: HTMLElement) => {
  const size: any = element[sizeAttribute];
  return !!size && typeof size === 'number' && size > 0;
};

function findSizeAttributeKey(element: Element = document.body): keyof HTMLElement | undefined {
  const htmlElement = element as HTMLElement;
  const sizeAttributeKey = possibleSizeAttributeKeys
    .find((key) => {
      const value = htmlElement[key];
      return value && typeof value === 'number' && value > 0;
    })
  ;
  if (sizeAttributeKey) { return sizeAttributeKey; }

  const childNodes = element.children;

  for (const childNode of Array.from(childNodes)) {
    const childAttribute = findSizeAttributeKey(childNode);
    if (childAttribute) { return childAttribute; }
  }
  return undefined;
}

const isVisibleByParents = (element: Element): boolean => {
  if (!element.isConnected) { return false; }
  if (element.tagName === 'BODY') { return true; }

  const style = getComputedStyle(element);
  if (style.display === 'none') { return false; }
  if (style.visibility === 'collapse') { return false; }

  const parent = element.parentElement;
  if (!parent) { return false; }

  return isVisibleByParents(parent);
};

function testAll<T>(...elementFilter: ((element: T) => boolean)[]) {
  return (element: T) => !elementFilter.some((f) => !f(element));
}

function hasValidTabIndex(element: HTMLElement): element is HTMLElementWithValidTabIndex {
  return typeof element.tabIndex === 'number' && element.tabIndex >= 0;
}

const isNotDisabledInput = (element: HTMLElement) => !(element as HTMLInputElement).disabled;
function isNotSkippableAnchor(element: HTMLElement) {
  return !(element instanceof HTMLAnchorElement)
    || !!element.href
    || element.getAttribute('tabIndex') !== null
  ;
}

const isNotCollapsed = (element: HTMLElement) => {
  return getComputedStyle(element).visibility !== 'collapse';
};

function byComparingTabIndex(a: { tabIndex: number }, b: { tabIndex: number }) {
  if (a.tabIndex > 0 && b.tabIndex > 0) {
    return a.tabIndex - b.tabIndex;
  }

  if (a.tabIndex > 0) { return -a.tabIndex; }
  if (b.tabIndex > 0) { return b.tabIndex; }

  throw new Error('same tab index for two groups');
}
