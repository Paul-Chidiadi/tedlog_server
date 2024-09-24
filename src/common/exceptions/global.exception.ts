import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  ValidationError,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs/promises';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(WsException, HttpException)
export class GlobalExceptionFilter
  extends BaseWsExceptionFilter
  implements ExceptionFilter
{
  private readonly logger = new Logger('ErrorHandler');

  catch(exception: HttpException | WsException, host: ArgumentsHost) {
    if (host.getType() == 'ws' && exception instanceof WsException) {
      const ctx = host.switchToWs().getClient() as WebSocket;
      this.logger.log(JSON.stringify(exception));
      ctx.send(JSON.stringify({ event: 'error', data: exception.message }));
    }
    if (host.getType() === 'http' && exception instanceof HttpException) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      const status = exception.getStatus();
      const message = exception.message;

      if (request.files?.length) {
        const files = request.files as unknown as Express.Multer.File[];

        files.map(async (document) => {
          await fs.unlink(document.path);
        });
      }
      this.logger.log(JSON.stringify(exception));

      response.status(status).json({
        statusCode: status,
        message,
        exception:
          process.env.NODE_ENV === 'staging' ? JSON.stringify(exception) : '',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const ValidatorErrorHandler = {
  exceptionFactory: (errors: ValidationError[]) => {
    const result = errors.map((error) => {
      let message;
      if (error?.children?.[0]?.children?.length) {
        message = Object.values(
          error?.children?.[0]?.children?.[0]?.constraints || {},
        )[0];
      } else {
        message = Object.values(error.constraints || {})[0];
      }

      return { property: error.property, message };
    });

    return new UnprocessableEntityException(result[0].message);
  },

  whitelist: true,
  stopAtFirstError: true,
};
