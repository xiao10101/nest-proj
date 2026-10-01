// import { RequestContextService } from '@/shared/context/request-context.service.js';
import { Logger } from 'nestjs-pino';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BusinessException } from './business.exception.js';

type ExceptionBody = string | { message?: string | string[] };

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}
  catch(exception: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    const req = host.switchToHttp().getRequest();
    let code = 50000;
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    if (exception instanceof BusinessException) {
      code = exception.code;
      message = exception.message;
      status = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = exception.getStatus();
      const response = exception.getResponse() as ExceptionBody;
      let msg = '';
      if (typeof response === 'object' && response.message) {
        msg = Array.isArray(response.message)
          ? response.message.join('; ')
          : response.message;
      } else if (typeof response === 'object' && !response.message) {
        msg = JSON.stringify(response);
      }
      message = typeof response === 'string' ? response : msg;
    } else {
      this.logger.error({
        requestId: req.requestId,
        message: exception.message,
        stack: exception.stack,
      });
    }
    res.status(status).json({
      code,
      message,
      data: null,
      requestId: req.requestId,
    });
  }
}
