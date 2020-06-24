import {isTextInput, simulateKeyInTextInput, TextInputElement} from './type-in-text-input';

describe('type in text input', () => {
  describe('in general', () => {
    let input: TextInputElement;

    beforeEach(() => input = document.createElement('input'));

    it('should be a TextInput', () => {
      expect(isTextInput(input)).toBe(true);
    });

    it('should change value on character input', () => {
      simulateKeyInTextInput(input, 'a');
      simulateKeyInTextInput(input, 'b');
      simulateKeyInTextInput(input, 'c');

      expect(input.value).toBe('abc');
    });

    describe('simulate selection', () => {
      it('should select last character on Shift + ArrowLeft', () => {
        input.value = 'abc';

        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });

        expect(input.selectionStart).toBe(2, 'start');
        expect(input.selectionEnd).toBe(3, 'end');
        expect(input.selectionDirection).toBe('backward', 'direction');
      });

      it('should extend selection backward', () => {
        input.value = 'abc';

        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });
        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });

        expect(input.selectionStart).toBe(1, 'start');
        expect(input.selectionEnd).toBe(3, 'end');
        expect(input.selectionDirection).toBe('backward', 'direction');
      });

      it('should stop extending selection backward at the beginning of the input', () => {
        input.value = 'abc';

        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });
        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });
        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });
        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });

        expect(input.selectionStart).toBe(0, 'start');
        expect(input.selectionEnd).toBe(3, 'end');
        expect(input.selectionDirection).toBe('backward', 'direction');
      });

      it('should reduce selection backward', () => {
        input.value = 'abc';

        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });
        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });
        simulateKeyInTextInput(input, 'ArrowRight', { shift: true });

        expect(input.selectionStart).toBe(2, 'start');
        expect(input.selectionEnd).toBe(3, 'end');
        expect(input.selectionDirection).toBe('backward', 'direction');
      });

      it('should move cursor without shift', () => {
        input.value = 'abc';

        simulateKeyInTextInput(input, 'ArrowLeft');

        expect(input.selectionStart).toBe(2, 'start');
        expect(input.selectionEnd).toBe(2, 'end');
        expect(input.selectionDirection).toBe('none', 'direction');
      });

      it('should start selection from cursor position', () => {
        input.value = 'abc';

        simulateKeyInTextInput(input, 'ArrowLeft');
        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });

        expect(input.selectionStart).toBe(1, 'start');
        expect(input.selectionEnd).toBe(2, 'end');
        expect(input.selectionDirection).toBe('backward', 'direction');
      });

      it('should type at cursor position', () => {
        simulateKeyInTextInput(input, 'a');
        simulateKeyInTextInput(input, 'b');
        simulateKeyInTextInput(input, 'ArrowLeft');
        simulateKeyInTextInput(input, 'c');

        expect(input.value).toBe('acb');
        expect(input.selectionStart).toBe(2, 'start');
        expect(input.selectionEnd).toBe(2, 'end');
        expect(input.selectionDirection).toBe('none', 'direction');
      });

      it('should change selection direction from backwards to none', () => {
        input.value = 'abcd';
        simulateKeyInTextInput(input, 'ArrowLeft');
        simulateKeyInTextInput(input, 'ArrowLeft');
        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });
        simulateKeyInTextInput(input, 'ArrowRight', { shift: true });

        expect(input.selectionStart).toBe(2, 'start');
        expect(input.selectionEnd).toBe(2, 'end');
        expect(input.selectionDirection).toBe('none', 'direction');
      });

      it('should change selection direction from backwards to forwards', () => {
        input.value = 'abcd';
        simulateKeyInTextInput(input, 'ArrowLeft');
        simulateKeyInTextInput(input, 'ArrowLeft');
        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });
        simulateKeyInTextInput(input, 'ArrowRight', { shift: true });
        simulateKeyInTextInput(input, 'ArrowRight', { shift: true });

        expect(input.selectionStart).toBe(2, 'start');
        expect(input.selectionEnd).toBe(3, 'end');
        expect(input.selectionDirection).toBe('forward', 'direction');
      });

      it('should extend selection forward', () => {
        input.value = 'abc';
        input.selectionStart = input.selectionEnd = 0;

        simulateKeyInTextInput(input, 'ArrowRight', { shift: true });
        simulateKeyInTextInput(input, 'ArrowRight', { shift: true });

        expect(input.selectionStart).toBe(0, 'start');
        expect(input.selectionEnd).toBe(2, 'end');
        expect(input.selectionDirection).toBe('forward', 'direction');
      });

      it('should stop extending selection forward at the end of the input', () => {
        input.value = 'abc';
        input.selectionStart = input.selectionEnd = 0;

        simulateKeyInTextInput(input, 'ArrowRight', { shift: true });
        simulateKeyInTextInput(input, 'ArrowRight', { shift: true });
        simulateKeyInTextInput(input, 'ArrowRight', { shift: true });
        simulateKeyInTextInput(input, 'ArrowRight', { shift: true });

        expect(input.selectionStart).toBe(0, 'start');
        expect(input.selectionEnd).toBe(3, 'end');
        expect(input.selectionDirection).toBe('forward', 'direction');
      });

      it('should reduce selection forward', () => {
        input.value = 'abc';
        input.selectionStart = input.selectionEnd = 0;

        simulateKeyInTextInput(input, 'ArrowRight', { shift: true });
        simulateKeyInTextInput(input, 'ArrowRight', { shift: true });
        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });

        expect(input.selectionStart).toBe(0, 'start');
        expect(input.selectionEnd).toBe(1, 'end');
        expect(input.selectionDirection).toBe('forward', 'direction');
      });

      it('should change selection direction from forward to none', () => {
        input.value = 'abcd';
        input.selectionStart = input.selectionEnd = 0;

        simulateKeyInTextInput(input, 'ArrowRight');
        simulateKeyInTextInput(input, 'ArrowRight');
        simulateKeyInTextInput(input, 'ArrowRight', { shift: true });
        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });

        expect(input.selectionStart).toBe(2, 'start');
        expect(input.selectionEnd).toBe(2, 'end');
        expect(input.selectionDirection).toBe('none', 'direction');
      });

      it('should change selection direction from forward to backward', () => {
        input.value = 'abcd';
        input.selectionStart = input.selectionEnd = 0;

        simulateKeyInTextInput(input, 'ArrowRight');
        simulateKeyInTextInput(input, 'ArrowRight');
        simulateKeyInTextInput(input, 'ArrowRight', { shift: true });
        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });
        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });

        expect(input.selectionStart).toBe(1, 'start');
        expect(input.selectionEnd).toBe(2, 'end');
        expect(input.selectionDirection).toBe('backward', 'direction');
      });
    });

    describe('simulate backspace', () => {
      it('should delete last character', () => {
        input.value = 'abcd';

        simulateKeyInTextInput(input, 'Backspace');

        expect(input.value).toBe('abc', 'value');
        expect(input.selectionStart).toBe(3, 'start');
        expect(input.selectionEnd).toBe(3, 'end');
        expect(input.selectionDirection).toBe('none', 'direction');
      });

      it('should delete all characters', () => {
        input.value = 'abcd';

        simulateKeyInTextInput(input, 'Backspace');
        simulateKeyInTextInput(input, 'Backspace');
        simulateKeyInTextInput(input, 'Backspace');
        simulateKeyInTextInput(input, 'Backspace');

        expect(input.value).toBe('', 'value');
        expect(input.selectionStart).toBe(0, 'start');
        expect(input.selectionEnd).toBe(0, 'end');
        expect(input.selectionDirection).toBe('none', 'direction');
      });

      it('should not trigger events after deleting all characters', () => {
        input.value = 'abcd';
        const eventSpy = spyOn(input, 'dispatchEvent');

        simulateKeyInTextInput(input, 'Backspace');
        simulateKeyInTextInput(input, 'Backspace');
        simulateKeyInTextInput(input, 'Backspace');
        simulateKeyInTextInput(input, 'Backspace');
        simulateKeyInTextInput(input, 'Backspace');
        simulateKeyInTextInput(input, 'Backspace');

        expect(eventSpy).toHaveBeenCalledTimes(4);
        expect(input.value).toBe('', 'value');
        expect(input.selectionStart).toBe(0, 'start');
        expect(input.selectionEnd).toBe(0, 'end');
        expect(input.selectionDirection).toBe('none', 'direction');
      });

      it('should delete at cursor position', () => {
        input.value = 'abc';
        simulateKeyInTextInput(input, 'ArrowLeft');
        simulateKeyInTextInput(input, 'Backspace');
        simulateKeyInTextInput(input, 'd');

        expect(input.value).toBe('adc');
        expect(input.selectionStart).toBe(2, 'start');
        expect(input.selectionEnd).toBe(2, 'end');
        expect(input.selectionDirection).toBe('none', 'direction');
      });

      it('should delete all selected characters', () => {
        input.value = 'abcd';
        simulateKeyInTextInput(input, 'ArrowLeft');
        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });
        simulateKeyInTextInput(input, 'ArrowLeft', { shift: true });
        simulateKeyInTextInput(input, 'Backspace');

        expect(input.value).toBe('ad', 'value');
        expect(input.selectionStart).toBe(1, 'start');
        expect(input.selectionEnd).toBe(1, 'end');
        expect(input.selectionDirection).toBe('none', 'direction');
      });
    });
  });

  describe('HTMLInputElement', () => {
    let input: HTMLInputElement;

    beforeEach(() => input = document.createElement('input'));

    it('should be a TextInput', () => {
      expect(isTextInput(input)).toBe(true);
    });

    it('should not append new line on "Enter"', () => {
      simulateKeyInTextInput(input, 'a');
      simulateKeyInTextInput(input, 'Enter');
      simulateKeyInTextInput(input, 'c');

      expect(input.value).toBe('ac');
    });

    it('on arrow up key should select value until it\'s start', () => {
      input.value = 'abcd';

      simulateKeyInTextInput(input, 'ArrowLeft');
      simulateKeyInTextInput(input, 'ArrowUp', { shift: true });

      expect(input.selectionStart).toBe(0, 'start');
      expect(input.selectionEnd).toBe(3, 'end');
      expect(input.selectionDirection).toBe('backward', 'direction');
    });

    it('on arrow down key should select value until it\'s start', () => {
      input.value = 'abcd';
      input.selectionStart = input.selectionEnd = 1;

      simulateKeyInTextInput(input, 'ArrowDown', { shift: true });

      expect(input.selectionStart).toBe(1, 'start');
      expect(input.selectionEnd).toBe(4, 'end');
      expect(input.selectionDirection).toBe('forward', 'direction');
    });

    it('on arrow up then down key should remove selection', () => {
      console.log('start', 'up -> down key should remove selection');
      input.value = 'abcd';
      input.selectionStart = input.selectionEnd = 2;

      simulateKeyInTextInput(input, 'ArrowUp', { shift: true });
      simulateKeyInTextInput(input, 'ArrowDown', { shift: true });

      expect(input.selectionStart).toBe(2, 'start');
      expect(input.selectionEnd).toBe(2, 'end');
      expect(input.selectionDirection).toBe('none', 'direction');
    });

    it('on arrow up then twice down key should select from cursor to end', () => {
      console.log('start', 'up -> 2xdown key should remove selection');
      input.value = 'abcd';
      input.selectionStart = input.selectionEnd = 2;

      simulateKeyInTextInput(input, 'ArrowUp', { shift: true });
      simulateKeyInTextInput(input, 'ArrowDown', { shift: true });
      simulateKeyInTextInput(input, 'ArrowDown', { shift: true });

      expect(input.selectionStart).toBe(2, 'start');
      expect(input.selectionEnd).toBe(4, 'end');
      expect(input.selectionDirection).toBe('forward', 'direction');
    });

    it('on arrow down then up key should remove selection', () => {
      console.log('start', 'down -> up key should remove selection');
      input.value = 'abcd';
      input.selectionStart = input.selectionEnd = 2;

      simulateKeyInTextInput(input, 'ArrowDown', { shift: true });
      simulateKeyInTextInput(input, 'ArrowUp', { shift: true });

      expect(input.selectionStart).toBe(2, 'start');
      expect(input.selectionEnd).toBe(2, 'end');
      expect(input.selectionDirection).toBe('none', 'direction');
    });

    it('on arrow down then twice up key should select from start to cursor', () => {
      console.log('start', 'down -> 2xup key should remove selection');
      input.value = 'abcd';
      input.selectionStart = input.selectionEnd = 2;

      simulateKeyInTextInput(input, 'ArrowDown', { shift: true });
      simulateKeyInTextInput(input, 'ArrowUp', { shift: true });
      simulateKeyInTextInput(input, 'ArrowUp', { shift: true });

      expect(input.selectionStart).toBe(0, 'start');
      expect(input.selectionEnd).toBe(2, 'end');
      expect(input.selectionDirection).toBe('backward', 'direction');
    });
  });

  describe('HTMLTextAreaElement', () => {
    let textarea: HTMLTextAreaElement;

    beforeEach(() => textarea = document.createElement('textarea'));

    it('should be a TextInput', () => {
      expect(isTextInput(textarea)).toBe(true);
    });

    it('should append new line on "Enter"', () => {
      simulateKeyInTextInput(textarea, 'a');
      simulateKeyInTextInput(textarea, 'Enter');
      simulateKeyInTextInput(textarea, 'c');

      expect(textarea.value).toBe('a\nc');
    });
  });

  describe('HTMLButtonElement', () => {
    it('should not be a TextInput', () => {
      expect(isTextInput(document.createElement('button'))).toBe(false);
    });
  });
});
