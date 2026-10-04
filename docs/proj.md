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

| #   | 阶段                                                                 | 覆盖 JD 要求          | 状态                              |
| --- | -------------------------------------------------------------------- | --------------------- | --------------------------------- |
| 0   | 工程骨架：Nest CLI/ESLint/tsconfig别名/ConfigModule+Joi/Health       | 工程素养              | ✅ 完成                           |
| 1   | 配置与结构化日志：pino + requestId 全链路 + 优雅停机                 | 架构设计              | ✅ 完成                           |
| 2   | 数据建模：Prisma schema/迁移/索引/关系/seed                          | Prisma 建模、索引优化 | ✅ 完成                           |
| 3   | 统一响应层：Interceptor + ExceptionFilter + Pipe(DTO 校验)           | 拦截器、管道机制      | ✅ 完成                           |
| 4   | 认证授权：JWT + Passport + Guard + RBAC + 自定义装饰器               | 依赖注入、守卫        | ✅ 完成（RBAC 决策不做，见 4.4）  |
| 5   | 核心业务模块：商品/SKU、购物车、订单、支付回调（游标分页、复杂查询） | 复杂查询              | ✅ 完成                           |
| 6   | 高并发读：Redis 缓存、Cache-Aside、穿透/击穿/雪崩                    | 高并发接口            | ✅ 完成                           |
| 7   | 高并发写：事务、乐观锁/悲观锁、幂等、限流、分布式锁                  | 高并发、分布式        | ✅ 完成（7.5 分布式锁留 backlog） |
| 8   | 异步化：BullMQ 队列、延迟任务（超时取消）、重试与幂等消费            | 架构设计              | 待开始                            |
| 9   | 质量：单元测试 + e2e(supertest/vitest) + 测试库 + CI                 | 单元测试、CI/CD       | 待开始                            |
| 10  | 容器化与微服务化：多阶段 Dockerfile + 拆分独立 Nest 微服务           | Docker、微服务        | 待开始                            |

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
- [x] **2.1 Prisma 接入**：最终采用 **Prisma 7**（降 6 后实测切回，理由：宁可踩新坑不背过时 API）。driver adapter（@prisma/adapter-pg）+ 自定义 output（src/generated/prisma）+ PrismaService(@Global) + health db 探活 up/down 契约。踩坑：pnpm10 approve-builds、7/6 混装残留 prisma.config.ts、generate 必须每次 schema 变更后跑
- [x] **2.2 ER 建模评审**：9→8 实体（砍 Cart 独立表，CartItem 挂 userId）、Inventory 挂 Sku（1—1）、金额整数分、OrderItem 快照、Payment 1—N（对账三件套：amount/channelTradeNo/status）
- [x] **2.3 schema.prisma + 第一次迁移**：8 model + 3 enum，FK 8 条 / UNIQUE 6 条 全部验证通过。踩坑：外键"多"方持有、PSL 关系双向声明、裸外键字段不生成 FK、BigInt 序列化炸弹、SOLD_OUT 与上下架语义混淆
- [x] **2.4 seed**：tsx 执行（ESM）+ Prisma 7 config 文件配 seed（非 6 的 package.json 约定）+ deleteMany 幂等清库（下游先删）+ migrate reset 一条龙验证。踩坑：ts-node 与 ESM 不兼容、config 文件名必须 prisma.config.ts、postinstall 自动 generate 免疫生成物过期
- [x] **2.5 索引评审**（docs/index-review.md）：查询倒推索引；删 2 个与 @unique 冗余的索引；补 PG 外键不自动建索引的缺口（Payment/OrderItem.orderId）；复合索引等值在前排序在后；@unique=约束+索引、@@index=纯优化
- [x] **阶段 2 ✅ 完成（2026-09-29）**
- [x] **3.1 统一响应：TransformInterceptor + HttpExceptionFilter + BusinessException**（提交 b4bd434，2026-09-30）：统一四段结构 `{code,message,data,requestId}`；BusinessException 继承 HttpException 携带业务码；未知异常 console.log 兜底；APP_INTERCEPTOR/APP_FILTER 全局注册
- [x] **3.2 全局 ValidationPipe + DTO 校验**（2026-10-01）：APP_PIPE（useValue）注册；`transform + whitelist`（决策：静默剥离，不因客户端多传无害字段而拒绝）；exceptionFactory 递归拍平校验错误（抽为纯函数 `common/pipes/flatten-validation-errors.ts`）；嵌套 DTO 三件套 `@IsOptional + @ValidateNested + @Type`；filter 用 `as ExceptionBody` 收窄 `getResponse()` 并提取 message（数组 join）；未知异常改注入 nestjs-pino Logger.error（显式取 message/stack/requestId）。运行时验证：5 条 curl + 500 响应脱敏全部通过（AI 实测）。demo/echo 为临时演示接口，阶段 5 开发业务前可删
- [x] **阶段 3 ✅ 完成（2026-10-01）**
- [x] **4.1 Auth 模块 + 验证码登录链路**（2026-10-02）：设计修正——本项目为手机号+验证码登录（无密码，读 docs/ER.md 确认），放弃此前误加的 password/role 方案。ioredis 直连（独立 provider + ConfigService 注入 + @Global RedisModule），RedisService 封装 set/get/delete；OTP 流程：codeKey 300s TTL、验证码有效期内禁止重发（有意取舍，未做 60s lock）、登录 upsert 自动建号、验证码一次性消费。验收：发码/重发限流/错码拒绝/对码登录/码消费/落库 全部通过（AI 实测）
- [x] **4.2 JWT 签发**（2026-10-02）：@nestjs/jwt + JwtModule.registerAsync（ConfigService 注入 jwt.secret/jwt.expiresIn）；payload 最小化 `{sub: user.id}`（exp/iat 由 signOptions 自动写入，2h）；JWT_SECRET/JWT_EXPIRES_IN 进 Joi 必填校验（缺配置启动即失败）。验收：三段式 token、payload 无敏感信息、篡改 token 签名拦截、Joi 防呆 全部通过（AI 实测）。本任务关键坑：JwtService 手动进 providers 会遮蔽 JwtModule 配置好的实例（secretOrPrivateKey must have a value）；@Global() 只能贴 @Module 类；@Global 模块必须被 import 一次才生效（PrismaModule 曾从未被导入，靠各模块本地 provider 掩盖 = 多实例双连接池）
- [x] **4.3 Passport + Guard + @CurrentUser**（2026-10-02）：passport-jwt strategy（validate 收到的是已验签解码的 payload 而非 token；无状态返回 `{userId: payload.sub}`，secret 与签发侧同源 config.get）；`secretOrKey` 用 `!` 断言（Joi 启动必填兜底）；`@CurrentUser()` createParamDecorator 读 req.user；profile 演示接口 `@UseGuards(AuthGuard('jwt'))`（具名 JwtAuthGuard 抽取放到 4.4）。验收：无 token/篡改 401、真 token 200 返回 userId（AI 实测）。**实测纠错**：Guard 拒绝的请求也没有 requestId——Interceptor 在 Guard 之后执行（Middleware→Guard→Interceptor→Pipe），与 404 同机制
- [x] **4.4 收官：全局守卫 + @Public 白名单 + 大扫除**（2026-10-02）：具名 JwtAuthGuard（common/guards）+ APP_GUARD 全局注册；@Public()（SetMetadata+Reflector.getAllAndOverride，handler 优先于 class）；HealthController 类级豁免、auth code/login 方法级豁免；删除 demo/echo（AppController/AppController.spec 整份）、testVerifyToken、verifyToken；getProfile 类型修正 `{userId: number}`。回归：health/code/login 放行、profile 无 token 401 带 token 200 全过（AI 实测）。RBAC 决策：不加 role 字段，留到后台管理系统
- [x] **阶段 4 ✅ 完成（2026-10-02）**
- [x] **5.1 商品列表：游标分页**（2026-10-03）：keyset pagination（`createdAt DESC + id DESC` tiebreaker，防漂移防丢重）；Prisma 无行值比较 → `OR` 两分支等价翻译；`take: limit+1` 判 hasMore；cursor 编码 `${ts}_${id}` + 正则格式防御（`Number('')===0` 暗雷：空串变合法 1970，静默错页）；query DTO `@Type(()=>Number)`——HTTP 入参皆 string 的正面实践；`@IsEnum(ProductStatus)` 以 Prisma 枚举为唯一事实源（复犯阶段 2"SOLD_OUT 与上下架混淆"，被自己接口的 400 报错抓出）。回归：无过滤/组合过滤翻页零重叠、参数与 cursor 防御、末页边界全过（AI 实测）
- [x] **5.2 商品详情**（2026-10-03）：`ParseIntPipe` 路由参数转型（vs query 的 `@Type`：路由参数惯用内置 pipe）；嵌套 select 出参裁剪（include 做加法 / select 白名单，逐层独立）；`NotFoundException` 404 语义（"查无资源"是 HTTP 语义错误，区别于业务码错误）；requestId 三场景对照：路由 404 无 / Guard-401 无 / handler 异常有（Interceptor 在 Guard 之后、路由匹配才执行）。遗留思考：详情 select 裁掉了 status，"已下架"展示需求出现时再加回
- [x] **5.3 购物车 CRUD**（2026-10-04）：登录态第一个真实消费方（@CurrentUser 用法 A/B 与 data 参数）；`upsert + increment` 原子合并（判据：撞唯一键时期望报错用 create、期望合并用 upsert；@@unique(userId,skuId) 首次业务兑现）；addItem SKU 存在性校验（FK 异常 → 业务码 40004，业务码分段启动）；改/删按主键定位 + 归属权校验（横向越权 IDOR 防护 403）；UpdateCartItemDto 恢复管道校验（内联类型会绕过 ValidationPipe）；list 三层 select 联查（CartItem→Sku→Product/Inventory）。回归 10 项含双用户越权全过（AI 实测）
- [x] **5.4 创建订单：事务 + 库存扣减**（2026-10-04）：`$transaction` 交互式事务（校验/扣库存/建单/快照全部用 tx，throw 即整体回滚）；库存两字段搬运语义（available→locked，真出库留给支付/超时）；OrderItem 快照（skuName=商品名+spec、price/subtotal 取下单时值）；orderNo 生成器（日期+毫秒+4位 crypto 随机，21 位定长，10 万次无重复）；业务码分段 40004/40010/40011/40020。坑：重构丢 @Injectable（错题 22 三犯）、$transaction 返回值=回调返回值（不 return 客户端拿不到 orderNo）。验收：库存搬运 49|34→47|36、快照落库、库存不足回滚零痕迹（AI 实测）。路由已定名 /orders（复数，与 /products、/cart 一致）；购物车结算入口未做（可选）
- [x] **5.5 支付回调：幂等与对账**（2026-10-04）：渠道回调无 JWT → @Public + 签名校验（mock 固定 key，PAY_SIGN_KEY 走完整配置链路）；幂等 = channelTradeNo 唯一约束 + 预检（重复回调返回成功是渠道契约）；乱序防御（非 PENDING → 40009）；金额对账（amount ≠ totalAmount → 40030，事务内比对）；出库语义 locked -= qty（第三次库存搬运）。验收：正常回调/重复幂等/乱序 40009/不存在 40404/金额不符拒绝零污染 全过（AI 实测）。并发窗口（两回调同至 → catch P2002 转幂等）留阶段 7
- [x] **阶段 5 ✅ 完成（2026-10-04）**
- [x] **6.1 详情缓存 Cache-Aside 读路径**（2026-10-04）：三段式（查缓存→查库→回填 TTL 300s）；key 规范 `product:detail:{id}`（延续 auth:code:{phone} 命名习惯）；命中/未命中日志可观测；NotFoundException 分支不缓存（6.4 穿透伏笔）。坑：RedisService 手动进子模块 providers（@Global 模块的导出再注册 = 本地孤儿，REDIS_CLIENT 解析失败——全局 provider 主题第三变体）；Logger 双胞胎（@nestjs/common 与 nestjs-pino 同名类，import 来源决定日志体系）
- [x] **6.2 下架接口 + 缓存失效联动**（2026-10-04）：PATCH /products/:id/status（第一个登录态业务写接口，默认受全局守卫保护）；失效策略定为"先更新 DB 再删缓存"（对照反模式：更新缓存的并发乱序覆盖、先删后更的回填旧值窗口）；核心观念：缓存是可重建的投影，写路径只负责删、重建交给读路径；detailKey 收敛单一来源（错题 7+24 实战：`detial` 拼写雷若未收敛，会在失效联动处静默炸掉）。验收：下架后 detail 立即反映新状态、EXISTS 0→回填 1（AI 实测）
- [x] **6.3 列表缓存 + 版本号失效**（2026-10-04）：设计决策"只缓存首页（无 cursor），深页直查"——低命中 key 是负资产；key 归一化（用默认值处理后的参数拼 key，`query.limit` undefined 混入 key 的 bug）；**版本号失效模式 = 缓存版 cache busting**（INCR 世代号 O(1) 失效，旧世代 TTL 自然死亡，对比枚举删除的成本爆炸）；ver key 无 TTL（世代号必须永生）；RedisService 按需生长（+incr）。业务断言实测：在售商品下架后立即从在售列表消失（ver 6→7）。测试教训：ALL 列表含 OFF_SALE 是正确行为，断言要选对查询（ON_SALE 过滤）
- [x] **6.4 缓存三防**（2026-10-04）：穿透 → 空值哨兵 `'NULL'` 短 TTL 60s（NULL 检查必须在通用命中检查前；哨兵与合法数据类型可区分；布隆过滤器留概念）；雪崩 → TTL 抖动 `300+randomInt(0,61)`（幅度 10-20%；randomInt 开区间上界）；击穿 → SET NX 重建互斥（抢到锁重建 + finally 放锁；未抢到轮询吃缓存 5×100ms；超时兜底直查，正确性优先）。坑：无轮询的 fallback 让互斥形同虚设（49 个请求照样查库）；updateStatus 缺 await → DEL 先于 DB 更新完成（偶发回填旧值）。验收：5 并发全 200 + 锁释放 + 穿透空值标记（AI 实测）
- [x] **阶段 6 ✅ 完成（2026-10-04）**
- [x] **7.1 超卖事故复现与修复**（2026-10-04）：autocannon 复现 check-then-act 竞态（临时 50ms sleep 拉宽窗口 → 10 请求全过校验、available=-9、成交 10 单）；修复 = 原子条件更新（`updateMany where available>=qty`，count===0 → 40020，检查压进行锁、READ COMMITTED 重检查对最新行求值）；回归：同流量恰好 1 单成交、available=0。前置教训：压测前先冒烟单发（sku18 商品处于 OFF_SALE，5058 请求全被 40010 拦，误判竞态未复现）；竞态复现是概率性的 → 人为拉宽窗口（sleep 模拟慢操作/GC 停顿）
- [x] **7.2 乐观锁对照实现**（2026-10-04）：Inventory 加 version 字段（迁移后漏 generate——schema/DB/client 三层排错模型再次实战）；CAS 循环（读快照→where version 匹配→count 0 重试，上限 3 次防活锁）；"真没货"（直接 40020）与"版本冲突"（重试）两种失败严格区分。回归：恰好 1 单成交、version 0→1（AI 实测）
- [x] **7.2-checkpoint3 三方案对比与 YAGNI 收口**（2026-10-04）：选型=条件更新（单字段不变量恰好可表达、高冲突快速失败无重试风暴、无额外字段）；CAS 价值在泛化（多字段/整行不变量时唯一出路），实测教训：冲突率是漂移状态非静态事实，选型按最坏情况；version 字段按 YAGNI 迁移删除，CAS 实现留 git 历史。**坑：schema 三层时序——migrate(改库)→generate(改 client)→重启(换内存)缺一即 500**（删列迁移后旧 client SELECT 已删列；且 prisma 7 的 migrate dev 不自动 generate）
- [x] **7.3 回调并发窗口补课**（2026-10-04）：并发双发同流水号 → 预检双双落空 → 撞唯一约束。**重大发现：Prisma 7 + driver adapter(@prisma/adapter-pg) 下唯一冲突不映射为 P2002**，而是 DriverAdapterError 包装 Postgres 原生 23505（meta.driverAdapterError.cause.{kind:'UniqueConstraintViolation', constraint.index}）——教科书的 instanceof/code=P2002 检测全失效。修复=双路径检测（P2002+meta.target 或 adapter 23505+constraint.index 含 channelTradeNo）→ 转幂等成功。取证技巧：临时诊断重抛把错误类名/code/meta JSON 带进响应（读不到服务日志时的利器）。验收：两轮并发双发每轮恰好 1 行 Payment、输家 idempotent:true、零 500（AI 实测）
- [x] **7.4 限流**（2026-10-04）：手写 Redis 固定窗口（`SET key 0 EX windowSec NX` 建窗 + `INCR` 计数——窗口创建原子化，规避 INCR/EXPIRE 两步竞态导致计数器永生）；`@RateLimit(limit, windowSec)` 装饰器 + 全局 RateLimitInterceptor（Reflector 读元数据，未标注接口透传）；auth/code 挂 5次/60s。验收：6 连发 201→400×4→429——两层防御同框实证（2-5 的 400 是 4.1 业务规则、第 6 次 429 是限流层；限流计数发生在业务规则之前，被业务拒绝的请求同样计数）。局限注记：IP 粒度 NAT 误伤；req.ip 反代后需 trust proxy；与 @nestjs/throttler 的对照留 backlog
- [x] **阶段 7 ✅ 完成（2026-10-04）**（7.5 分布式锁 token+Lua 留 backlog）
- [ ] **6.5（补做，升级为正式任务）压测与性能基线**：缓存命中 vs 未命中的 QPS/P99 量化对比——简历性能数字的出处

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
14. **`@ValidateNested()` 只属于"值为对象/数组"的字段**：贴在标量上必报 `nested property must be either object or array`，且是**合法请求也 400**。嵌套校验三件套缺一不可：`@IsOptional`（可选语义）+ `@ValidateNested`（递归）+ `@Type(() => Dto)`（实例化，否则装饰器元数据拿不到）。
15. **`{ ...err }` 对 Error 对象无效**：`message`/`stack` 是不可枚举属性，spread 出来是空对象。日志要显式取字段，不能指望展开运算符。同理验证：`console.log({...new Error('x')})` → `{}`。
16. **provider 里 `useValue` 会静默覆盖 `useClass`**：两者同时写时只有 useValue 生效且不报错——意图是"用现成实例"就只写 useValue。
17. **exceptionFactory 只在校验失败时被调用**：拿合法请求测它永远"没进函数"，不是 bug。调管道行为要用必失败的请求。
18. **`getResponse()` 返回 `string | object`**：访问属性必须先收窄（声明异常体形状 + `as` 或 `in` 收窄）。运行时是谁（`@Type` 指向谁 / pipe 实例化成谁），静态类型就写谁，别写 `object`。
19. **BusinessException 必须且只能 `throw`**：`return` 它会变成 `code:0` 的成功响应；裸 `new` 不接不抛是 no-op，流程照常往下走。三种错法都要防。
20. **pino 日志插值：对象在前、消息在后**：`logger.debug({ phone, code }, 'msg')`；`logger.debug('msg', { obj })` 里的对象会被当无占位符的插值参数忽略，数据根本不出现在日志里。
21. **`Number(undefined)` 是 `NaN`，`??` 不兜底**（NaN 非 nullish）：环境变量转数字用 `Number(x) || 默认值`。同理配置链路要走到头——configuration 工厂定义了键但 provider 直读 `process.env`，等于只修了上半截。
22. **class 缺 `@Injectable()`**：`emitDecoratorMetadata` 不会生成构造参数元数据，DI 报 "Can't resolve dependencies"——不是 provider 注册的问题，是装饰器缺失。
23. **404 这类"没匹配到路由"的错误响应没有 requestId**：Interceptor 不执行（`req.requestId` 不存在），但全局 Filter 仍会兜住并给统一结构；`JSON.stringify` 顺带丢掉 undefined 的 key（错题 6 活案例）。面试聊生命周期的好素材。
24. **Redis key 格式收敛到一处**：key 拼接散在三处手写导致读/写对不上、整条链路静默失效；抽成私有方法（`codeKey(phone)`）单一来源。
25. **dev watch 进程会卡在旧代码**：重构中途编译挂过后恢复的代码不一定被热载，404/新路由不生效时先重启 `start:dev`，看 `Mapped {...}` 日志确认。

## 七、待用户补充的信息

- 阶段 2 需要：PostgreSQL 里建库信息（库名、账号是否可用 `DATABASE_URL` 连通）
