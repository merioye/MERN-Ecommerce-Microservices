import { SortDirection } from '@ecohatch/utils-shared';
import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Checks if the given object is a valid sort object.
 *
 * @param {any} obj - The object to check.
 * @returns {boolean} `true` if the object is a valid sort object, `false` otherwise.
 */
function isSortObject(obj: any): boolean {
  if (typeof obj !== 'object' || obj === null) return false;

  return Object.values(obj as object).every(
    (value) => value === SortDirection.ASC || value === SortDirection.DESC
  );
}

/**
 * Custom dto property decorator that validates that the value of a property is a valid sort object or not.
 *
 * @param {ValidationOptions} [validationOptions] - The options to use when validating the decorator.
 * @returns {Function} A decorator function that validates that the value of a property is a sort object.
 */
export function IsSortByObject(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isSortByObject',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return isSortObject(value);
        },
        defaultMessage() {
          return 'common.error.SortBy_must_be_an_object_and_its_properties_values_must_be_either_asc_or_desc';
        },
      },
    });
  };
}
