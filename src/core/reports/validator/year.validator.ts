import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsYearConstraint implements ValidatorConstraintInterface {
  validate(year: any) {
    if (typeof year !== 'number') {
      return false;
    }
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear;
  }

  defaultMessage() {
    return 'Year ($value) must be an integer between 1900 and the current year';
  }
}

export function IsYear(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsYearConstraint,
    });
  };
}
