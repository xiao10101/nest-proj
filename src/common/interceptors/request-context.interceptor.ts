import { RequestContextService } from '@/shared/context/request-context.service.js';
import type { RequestContextStore } from '@/shared/context/request-context.types.js';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly ctx: RequestContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    const raw = req.headers['x-request-id'];
    let requestId = '';
    if (typeof raw === 'string' && raw.length) {
      requestId = raw;
    } else if (Array.isArray(raw) && raw.length) {
      requestId = raw[0];
    } else {
      requestId = randomUUID();
    }

    const store: RequestContextStore = {
      requestId,
    };
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    this.ctx.set(store);
    return next.handle();
  }
}
