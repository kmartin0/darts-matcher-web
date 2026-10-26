import {Component, ElementRef, inject, input, output} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {isNonShortcutKeyDown} from '../../utils/keyboard.util';

export type KeypadButton = | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'delete' | 'enter';

@Component({
  selector: 'app-keypad',
  imports: [
    MatButton
  ],
  templateUrl: './keypad.html',
  styleUrl: './keypad.scss',
  host: {'(window:keydown)': 'onWindowKeyDown($event)'}
})
export class Keypad {
  readonly enterEnabled = input<boolean>(true);

  readonly keyPress = output<KeypadButton>();

  protected readonly keys: KeypadButton[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'delete', 0, 'enter'];

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Handles supported physical keyboard keys.
   *
   * Leaves excluded events and external interactive controls untouched.
   * Emits the matching keypad button unless Enter is disabled.
   *
   * @param event - Keyboard event to handle.
   */
  protected onWindowKeyDown(event: KeyboardEvent): void {
    if (isNonShortcutKeyDown(event) || this.isExternalControl(event.target)) {
      return;
    }

    const key = this.mapKey(event);
    if (key === null) return;

    if (key === 'enter' && !this.enterEnabled()) return;

    event.preventDefault();
    this.onKeyPress(key);
  }

  /**
   * Handles a keypad button press.
   *
   * @param key - Keypad button that was pressed.
   */
  protected onKeyPress(key: KeypadButton): void {
    this.keyPress.emit(key);
  }

  /**
   * Checks whether the keyboard event originated outside the keypad,
   * excluding the page body and document element.
   *
   * @param target - Target of the keyboard event.
   * @returns Whether focus is outside the keypad and its shortcuts should be ignored.
   */
  private isExternalControl(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;

    const document = target.ownerDocument;

    return target !== document.body &&
      target !== document.documentElement &&
      !this.elementRef.nativeElement.contains(target);
  }

  /**
   * Maps supported `KeyboardEvent.key` values to keypad button values.
   *
   * @param event - Keyboard event to map.
   * @returns Corresponding keypad button, or null if not handled.
   */
  private mapKey(event: KeyboardEvent): KeypadButton | null {
    switch (event.key) {
      case '0':
        return 0;
      case '1':
        return 1;
      case '2':
        return 2;
      case '3':
        return 3;
      case '4':
        return 4;
      case '5':
        return 5;
      case '6':
        return 6;
      case '7':
        return 7;
      case '8':
        return 8;
      case '9':
        return 9;
      case 'Enter':
        return 'enter';
      case 'Delete':
      case 'Backspace':
        return 'delete';
      default:
        return null;
    }
  }
}
