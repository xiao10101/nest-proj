import { Injectable } from '@nestjs/common';
import { RequestContextStore } from './request-context.types.js';
import { requestContextAls } from './request-context.als.js';

@Injectable()
export class RequestContextService {
  set(store: RequestContextStore): void {
    requestContextAls.enterWith(store);
  }
  get(): RequestContextStore | undefined {
    return requestContextAls.getStore();
  }
}
