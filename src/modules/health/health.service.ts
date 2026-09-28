import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
    check() {
        return {
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            // TODO: 阶段 2 实现
            checks: {
                db: null,
                redis: null
            }
        }
    }
}
