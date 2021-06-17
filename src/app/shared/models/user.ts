export interface User {
  id?: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  password?: string;
  confirmPassword?: string;
}

export function isUser(object: unknown): object is User {
  return object &&
    Object.prototype.hasOwnProperty.call(object, 'id') &&
    Object.prototype.hasOwnProperty.call(object, 'userName') &&
    Object.prototype.hasOwnProperty.call(object, 'firstName') &&
    Object.prototype.hasOwnProperty.call(object, 'lastName');
}
