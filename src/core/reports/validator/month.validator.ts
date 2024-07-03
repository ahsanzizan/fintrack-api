import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsMonthConstraint implements ValidatorConstraintInterface {
  validate(month: any) {
    if (typeof month !== 'number') {
      return false;
    }
    return month >= 1 && month <= 12;
  }

  defaultMessage() {
    return 'Month ($value) must be an integer between 1 and 12';
  }
}

export function IsMonth(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsMonthConstraint,
    });
  };
}
