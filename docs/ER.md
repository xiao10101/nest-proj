User 用户
id Int 主键，自增
phone String 唯一约束
nickname String? 可空
createdAt / updatedAt
关系：User 1—N Order（外键在哪张表？）Order.userId

Product 商品
id Int
description String?
status ProductStatus 枚举，两个值：ProductStatus.OnSale / ProductStatus.OffSale
createdAt / updatedAt
关系：Product 1—N sku（外键在谁那边？）sku.productId

Sku 规格单元
id Int
productId Int 外键 → Product
spec String 例："256G 黑色"
price Int 单位：分
createdAt / updatedAt
关系：Sku N—1 Product；Sku 1—N CartItem

Inventory 库存
id Int
skuId Int 外键 → Sku.id（为什么不是 productId？）存的是sku的单品，不是整个商品，比如苹果手机200台，不如存苹果手机黑色100台
available Int 可售数
locked Int 锁定数（锁定数=预扣数+占用数）防止超卖
createdAt / updatedAt

CartItem 购物车项
id Int
userId Int 外键 → User
skuId Int 外键 → Sku
quantity Int
联合唯一约束：防止重复添加，重复的数据合并成一个项，修改 quantity
决策备注：为什么没有独立 Cart 表？一句话：数据需要有自己的生命周期才能建表，如：订单有状态的流转

Order 订单
id BigInt 主键（内部标识）
orderNo String 业务单号，唯一索引
userId Int 外键 → User，谁买的
status OrderStatus 枚举：PENDING/PAID/CANCELLED/EXPIRED/SHIPPED/DONE
totalAmount Int 实付总额，单位分
expireAt DateTime 超时取消截止（状态机的物理支撑）
paidAt DateTime? 支付时间，未支付为 null
createdAt / updatedAt 每张表标配

关系：User 1—N Order; Order 1—N OrderItem; Order 1—1 Payment

OrderItem 订单项
id Int
orderId Int 外键 → Order
skuId Int ____（已经快照了信息，为什么还保留外键？）快照冻结，用于溯源和分析，展示用快照
skuName String ____（这字段存在的意义？）下了订单之后，名称就固定了，不会因为改了sku改了名，订单信息收到影响
price Int sku.price snapshot
quantity Int
subtotal Int ____（= ？，为什么落库固化而不用计算？） 计算会被后续sku修改影响
createdAt / updatedAt

Payment 支付单
id Int
orderId Int 外键 → Order
amount Int ____（和 Order.totalAmount 什么关系？回调时拿它干什么？）
channelTradeNo String? ____（谁发给你的？没有它有什么后果？）
status ____ 枚举三个值：___SUCCESS_ / **FAIL** / **PENDING**
paidAt DateTime?
createdAt / updatedAt
决策备注：Order 与 Payment 基数是 1—1? ，为什么？
