import { ValidationError } from '@nestjs/common';

export function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): string[] {
  return errors.flatMap((err) => {
    const path = parentPath ? `${parentPath}.${err.property}` : err.property;
    const own = Object.values(err.constraints ?? {}).map(
      (m) => `${path}: ${m}`,
    );
    return [...own, ...flattenValidationErrors(err.children ?? [], path)];
  });
}
