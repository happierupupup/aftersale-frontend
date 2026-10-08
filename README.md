# aftersale-frontend

售后 Demo 前端：登录后 **左菜单 + 右内容**；售后工作台为 **左列表 / 右详情操作**。

按角色展示不同菜单：

| 角色 | 菜单 |
|------|------|
| USER | 我的售后、申请售后、我的订单、站内信 |
| MERCHANT | 待审核、待退款、全部售后、库存、站内信 |
| WAREHOUSE | 待发货、全部售后、库存、站内信 |
| ADMIN | 待审核/发货/退款、全部售后、申请、订单、**用户管理**、库存、站内信 |

申请页：**保存** → `POST /aftersale/draft`；**提交** → `POST /aftersale/apply`（后端先删草稿再新增）。进页按订单+SKU `GET /aftersale/draft` 回填（`draft: true`）。

```bash
npm install
npm run dev   # http://127.0.0.1:5173 → gateway :8080
```

演示密码均为 `123456`：精神状态良好 / AAA代购 / AAA极速发货 / 00000
