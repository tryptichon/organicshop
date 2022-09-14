/**
 * Helper class to obtain values from form data.
 */
export class ValueValidator {
  /**
   * Get the value from the form field or throw an error when it is null or undefined.
   *
   * @param key Name of the form field.
   * @param value Value of the form field.
   * @returns The value of the field which is neither null nor undefined.
   * @throws Error when the value is null or undefined.
   */
  static getValid<T>(key: string, value?: T | null): T {
    return value ?? (() => { throw Error('Key ' + key + ' must not be null or undefined'); })();
  }
}

