# NestJS 电商项目学习计划

> 用途：跨会话恢复上下文。新开会话时把这个文件贴给 AI 助手即可继续。

## 一、背景与目标

- 我是谁：高级前端工程师（熟悉 Next.js / TS），学过 NestJS 但没做过完整项目
- 目标 JD：高级 Node.js 开发工程师（NestJS / Next.js / Prisma / PostgreSQL / AWS ECS）
- 本项目只关注 **NestJS 及后端能力**（前端部分我已掌握）
- 学习方式：**代码我自己手敲**，AI 助手负责架构设计、知识点讲解、任务拆解、Code Review，绝不代写业务代码

## 二、协作规则（重要）

1. **一次只给一个小任务**，做完验收通过后再发下一个；一个阶段全部任务完成后才出阶段总结
2. 每个任务固定输出：目标 → 前端类比 → 知识点 → 任务步骤 → 验证方法 → 常见坑 → 交付物
3. 代码不合格按 Code Review 标准打回，只给最小修改建议
4. 教学时用前端概念类比后端概念

## 三、项目决策（已确认）

| 项     | 决策                                                                                      |
| ------ | ----------------------------------------------------------------------------------------- |
| 业务   | C 端 **电商交易**：商品/SKU、库存、购物车、订单、支付回调、超时取消                       |
| 架构   | 模块化单体起步，后期拆 Nest 微服务（通知/搜索）                                           |
| 环境   | Windows + PowerShell，本机已装 PostgreSQL / Redis（无需 Docker 起步）                     |
| 节奏   | 每周 10h+，每阶段 5-8 个任务，1-2 阶段/周                                                 |
| 技术栈 | Nest 12 + ESM（type:module）、pnpm、Prisma（阶段2）、Redis、vitest + oxlint（脚手架自带） |
| 工作区 | c:/Users/810636/Desktop/nestjs-proj                                                       |

## 四、阶段路线图（10 个阶段）

| #   | 阶段                                                                 | 覆盖 JD 要求          | 状态       |
| --- | -------------------------------------------------------------------- | --------------------- | ---------- |
| 0   | 工程骨架：Nest CLI/ESLint/tsconfig别名/ConfigModule+Joi/Health       | 工程素养              | **进行中** |
| 1   | 配置与结构化日志：pino + requestId 全链路 + 优雅停机                 | 架构设计              | 待开始     |
| 2   | 数据建模：Prisma schema/迁移/索引/关系/seed                          | Prisma 建模、索引优化 | 待开始     |
| 3   | 统一响应层：Interceptor + ExceptionFilter + Pipe(DTO 校验)           | 拦截器、管道机制      | 待开始     |
| 4   | 认证授权：JWT + Passport + Guard + RBAC + 自定义装饰器               | 依赖注入、守卫        | 待开始     |
| 5   | 核心业务模块：商品/SKU、购物车、订单、支付回调（游标分页、复杂查询） | 复杂查询              | 待开始     |
| 6   | 高并发读：Redis 缓存、Cache-Aside、穿透/击穿/雪崩                    | 高并发接口            | 待开始     |
| 7   | 高并发写：事务、乐观锁/悲观锁、幂等、限流、分布式锁                  | 高并发、分布式        | 待开始     |
| 8   | 异步化：BullMQ 队列、延迟任务（超时取消）、重试与幂等消费            | 架构设计              | 待开始     |
| 9   | 质量：单元测试 + e2e(supertest/vitest) + 测试库 + CI                 | 单元测试、CI/CD       | 待开始     |
| 10  | 容器化与微服务化：多阶段 Dockerfile + 拆分独立 Nest 微服务           | Docker、微服务        | 待开始     |

## 五、请求生命周期（面试高频）

```
Middleware → Guard → Interceptor(before) → Pipe → Handler → Interceptor(after) → Filter
```

## 六、进度日志

### 阶段 0（✅ 已完成 2026-09-28）

- [x] **0.1 环境自检 + 项目初始化**：Nest 12 CLI 脚手架 + pnpm，`start:dev` 可跑，Git 已初始化
- [x] **0.2 ConfigModule + Joi 启动校验**：完成（含清理 `@nestjs/observe` 遥测依赖）
- [x] **0.3 全局前缀 + Health 模块**：`/api/v1/health` 返回 `{status,timestamp,uptime,checks}`，db/redis 预留 TODO；逻辑分层到 HealthService
- [x] **0.4 代码规范**：oxlint + prettier + husky(pre-commit=lint-staged, commit-msg=commitlint) + Conventional Commits 生效（验证提交 db0dd98）

### 阶段 1（✅ 已完成 2026-09-28）

- [x] **1.1 结构化日志**：nestjs-pino + forRootAsync（ConfigService 注入，绕开装饰器求值时机坑）+ LOG_LEVEL 独立配置 + autoLogging 排除 health + redact 脱敏 Authorization
- [x] **1.2 请求上下文**：手写 AsyncLocalStorage + requestId Interceptor（透传上游 x-request-id / 生成 UUID / 响应头回写），APP_INTERCEPTOR 注册，RequestContextService 封装 set/get
- [x] **1.3 优雅停机**：enableShutdownHooks + OnApplicationShutdown（关停日志用 console 防 pino worker 丢日志）+ /health/slow 验证善后窗口
- [ ] **阶段 2 第一个任务待开始**：Prisma 接入 + 电商核心数据建模

### 阶段 1 关键实验记录

- ALS `run` vs `enterWith`：在 Nest 12 + Express + rxjs 实测中 `run` 跨异步边界（setImmediate）也能存活；最终选 `enterWith` 是因为语义自足（不依赖框架订阅时机实现细节）+ service 封装边界，非技术对错
- pino 丢日志实证：`onApplicationShutdown` 中 `logger.warn` 丢失、`console.log` 存活 → pino-pretty transport 在 worker 线程，进程退出时在途日志蒸发（同 Sentry unload 丢事件问题）；关停路径日志必须同步写

### 踩坑记录（个人错题本）

1. **CJS/ESM 互操作**：joi 是 CommonJS 包，项目是真 ESM（`type: module`），`import * as Joi from 'joi'` 拿到的是命名空间对象，整体导出挂在 `.default` 上 → `Joi.string is not a function`。修复：`import Joi from 'joi'` + tsconfig `esModuleInterop`。通用判断法：老包报 `is not a function` 先怀疑 CJS/ESM。
2. **配置禁止硬编码**：configuration 工厂必须从 `process.env` 读值，密码/端口写死在源码 = 提交即泄露、环境不可迁移。
3. **ESM import 路径必须带 `.js` 后缀**（本项目 type:module），漏了启动报错。
4. `ConfigModule.forRoot` 的 `load` 数组要传**工厂函数** `load: [configuration]`，不是 `configuration()`（延迟求值，等 dotenv 先初始化）。
5. Joi `validationOptions` 需 `allowUnknown: true`（否则系统环境变量报 not allowed）+ `abortEarly: false`（一次报出所有错误）。
6. **响应 JSON 里 key 整个消失**：十有八九是对象里塞了 function（少写 `()`）或 `undefined`，`JSON.stringify` 会丢弃它们；`null`/空串则会出现。
7. **key 拼写错误（reids→redis）编译器不报错**，只有消费方才炸——阶段 3 上 DTO 类型定义让它在编译期暴露。
8. **钩子"空文件"陷阱**：`.husky/commit-msg` 文件存在但内容为空 = 钩子永远放行。配置类任务的验收必须验证"拦截路径"真的触发。
9. tsconfig `paths` 规则：用捕获的 `*` 替换目标里的 `*`，`"@/*": ["./src/*"]` 才是对的。
10. lint-staged 里跑了不存在的 lint 工具配置（eslint 无 config）会静默失败——工具链改动后必须实测一次拦截路径。
11. **装饰器参数求值时机**：`@Module` 装饰器在 import 时求值，早于 ConfigModule 的 dotenv 加载——模块配置里裸读 `process.env` 拿不到 `.env` 值，必须用 `forRootAsync` + 注入 `ConfigService`（forRoot 静态求值 vs forRootAsync 容器求值）。
12. **`nest start --watch` 绑架 Ctrl+C**：watch 父进程硬杀子进程，生命周期/信号类验证必须 `pnpm build && node dist/main.js` 在生产模式下做。
13. **配置链路意识**：`.env` → dotenv → configuration 工厂 → ConfigService，工厂里没定义的嵌套键 `config.get` 拿不到；遇到 undefined 先查数据流向，不要绕过。

## 七、待用户补充的信息

- 阶段 2 需要：PostgreSQL 里建库信息（库名、账号是否可用 `DATABASE_URL` 连通）
