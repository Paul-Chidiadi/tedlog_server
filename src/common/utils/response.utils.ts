import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export const CreateSuccessResponse = (
  res: Response,
  data: any,
  message?: string,
) => {
  return res.json({
    status: HttpStatus.OK,
    message: message || 'Successfully created',
    data,
  });
};
export const SuccessResponse = (
  res: Response,
  data: any,
  message?: string,
  results?: number,
) => {
  return res.json({
    status: HttpStatus.OK,
    message: message || 'Successfully retrived',
    results,
    data,
  });
};
