import { AsyncLocalStorage } from 'async_hooks';
import { RequestContextStore } from './request-context.types.js';

export const requestContextAls = new AsyncLocalStorage<RequestContextStore>();
