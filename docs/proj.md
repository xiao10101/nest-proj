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

| 项 | 决策 |
|---|---|
| 业务 | C 端 **电商交易**：商品/SKU、库存、购物车、订单、支付回调、超时取消 |
| 架构 | 模块化单体起步，后期拆 Nest 微服务（通知/搜索） |
| 环境 | Windows + PowerShell，本机已装 PostgreSQL / Redis（无需 Docker 起步） |
| 节奏 | 每周 10h+，每阶段 5-8 个任务，1-2 阶段/周 |
| 技术栈 | Nest 12 + ESM（type:module）、pnpm、Prisma（阶段2）、Redis、vitest + oxlint（脚手架自带） |
| 工作区 | c:/Users/810636/Desktop/nestjs-proj |

## 四、阶段路线图（10 个阶段）

| # | 阶段 | 覆盖 JD 要求 | 状态 |
|---|---|---|---|
| 0 | 工程骨架：Nest CLI/ESLint/tsconfig别名/ConfigModule+Joi/Health | 工程素养 | **进行中** |
| 1 | 配置与结构化日志：pino + requestId 全链路 + 优雅停机 | 架构设计 | 待开始 |
| 2 | 数据建模：Prisma schema/迁移/索引/关系/seed | Prisma 建模、索引优化 | 待开始 |
| 3 | 统一响应层：Interceptor + ExceptionFilter + Pipe(DTO 校验) | 拦截器、管道机制 | 待开始 |
| 4 | 认证授权：JWT + Passport + Guard + RBAC + 自定义装饰器 | 依赖注入、守卫 | 待开始 |
| 5 | 核心业务模块：商品/SKU、购物车、订单、支付回调（游标分页、复杂查询） | 复杂查询 | 待开始 |
| 6 | 高并发读：Redis 缓存、Cache-Aside、穿透/击穿/雪崩 | 高并发接口 | 待开始 |
| 7 | 高并发写：事务、乐观锁/悲观锁、幂等、限流、分布式锁 | 高并发、分布式 | 待开始 |
| 8 | 异步化：BullMQ 队列、延迟任务（超时取消）、重试与幂等消费 | 架构设计 | 待开始 |
| 9 | 质量：单元测试 + e2e(supertest/vitest) + 测试库 + CI | 单元测试、CI/CD | 待开始 |
| 10 | 容器化与微服务化：多阶段 Dockerfile + 拆分独立 Nest 微服务 | Docker、微服务 | 待开始 |

## 五、请求生命周期（面试高频）

```
Middleware → Guard → Interceptor(before) → Pipe → Handler → Interceptor(after) → Filter
```

## 六、进度日志

### 阶段 0（进行中）

- [x] **0.1 环境自检 + 项目初始化**：Nest 12 CLI 脚手架 + pnpm，`start:dev` 可跑，Git 已初始化
- [x] **0.2 ConfigModule + Joi 启动校验**：完成（含清理脚手架自带的 `@nestjs/observe` 遥测模块）
- [ ] **0.3 全局前缀 + Health 模块**（`/api/v1/health`，db/redis 探活预留 TODO）← **下一步**
- [ ] **0.4 代码规范**：ESLint/Prettier、tsconfig 路径别名、husky + lint-staged + commitlint
- [ ] **0.5 阶段总结与验收清单**

### 踩坑记录（个人错题本）

1. **CJS/ESM 互操作**：joi 是 CommonJS 包，项目是真 ESM（`type: module`），`import * as Joi from 'joi'` 拿到的是命名空间对象，整体导出挂在 `.default` 上 → `Joi.string is not a function`。修复：`import Joi from 'joi'` + tsconfig `esModuleInterop`。通用判断法：老包报 `is not a function` 先怀疑 CJS/ESM。
2. **配置禁止硬编码**：configuration 工厂必须从 `process.env` 读值，密码/端口写死在源码 = 提交即泄露、环境不可迁移。
3. **ESM import 路径必须带 `.js` 后缀**（本项目 type:module），漏了启动报错。
4. `ConfigModule.forRoot` 的 `load` 数组要传**工厂函数** `load: [configuration]`，不是 `configuration()`（延迟求值，等 dotenv 先初始化）。
5. Joi `validationOptions` 需 `allowUnknown: true`（否则系统环境变量报 not allowed）+ `abortEarly: false`（一次报出所有错误）。

## 七、待用户补充的信息

- 阶段 2 需要：PostgreSQL 里建库信息（库名、账号是否可用 `DATABASE_URL` 连通）
