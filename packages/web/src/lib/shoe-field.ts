/**
 * Signals for the auth page shoe background. Plain window events so the forms
 * can drive it without importing the 3D bundle.
 */
export const SHOES_DROP_EVENT = "gripkicks:shoes-drop";
export const SHOES_RISE_EVENT = "gripkicks:shoes-rise";

/** Let gravity take the shoes off the bottom of the screen. */
export function dropShoes() {
  window.dispatchEvent(new Event(SHOES_DROP_EVENT));
}

/** Float the shoes back to where they were, e.g. after a failed sign-in. */
export function riseShoes() {
  window.dispatchEvent(new Event(SHOES_RISE_EVENT));
}
