import { RequestContextService } from '@/shared/context/request-context.service.js';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BusinessException } from './business.exception.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly ctx: RequestContextService) {}

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
      const response = exception.getResponse();
      message =
        typeof response !== 'string' ? JSON.stringify(response) : response;
    } else {
      console.log(exception);
    }
    res.status(status).json({
      code,
      message,
      data: null,
      requestId: req.requestId,
    });
  }
}
