import { body, param } from 'express-validator';

export const loginValidation = [
  body('username').isString().notEmpty(),
  body('password').isLength({ min: 6 }),
];

export const uploadUrlValidation = [
  body('filename').isString().notEmpty(),
  body('contentType').isString().notEmpty(),
  body('package_code').isString().notEmpty(),
];

export const downloadUrlValidation = [
  param('key').isString().notEmpty(),
];
