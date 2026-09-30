# 索引评审（2.5）

## 一、高频查询清单（推演业务得出）

| #   | 场景           | SQL 形态                                         |
| --- | -------------- | ------------------------------------------------ |
| 1   | 手机号登录     | WHERE phone = ?                                  |
| 2   | 用户的订单列表 | WHERE userId = ? ORDER BY createdAt DESC LIMIT ? |     |
| 3   | 商品列表页     | WHERE status = ? ORDER BY createdAt DESC（分页） |
| 4   | 某用户的购物车 | WHERE userId = ?                                 |
| 5   | 下单扣库存     | UPDATE Inventory ... WHERE skuId = ?             |

高频查询场景添加索引
