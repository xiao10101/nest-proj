import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate-limit';

export const RateLimit = (limit: number, windowSec: number) =>
  SetMetadata(RATE_LIMIT_KEY, { limit, windowSec });
