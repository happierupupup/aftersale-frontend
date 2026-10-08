# aftersale-frontend

电商**售后退换货**前端：Vue 3 + TypeScript + Vite 5 + Element Plus + Pinia + Vue Router。

登录后 **左菜单 + 右内容**；售后工作台为 **左列表 / 右详情操作**。浏览器只打 **gateway `:8080`**（Vite 开发代理）。

## 配套后端

| | |
|--|--|
| 仓库 | [happierupupup/aftersale-backend](https://github.com/happierupupup/aftersale-backend) |
| SSH | `git@github.com:happierupupup/aftersale-backend.git` |
| 联调入口 | gateway `http://127.0.0.1:8080` |
| 启动顺序 | portal → process → trade → gateway（详见后端 README） |

建议与后端同级目录：

```text
aftersale-code/
├── aftersale-backend/     # 后端
└── aftersale-frontend/    # 本仓库
```

```bash
git clone git@github.com:happierupupup/aftersale-backend.git
git clone git@github.com:happierupupup/aftersale-frontend.git
```

## 技术栈

- Vue 3.5 + TypeScript + Vite 5
- Element Plus + `@element-plus/icons-vue`
- Pinia（登录态）+ Vue Router
- Axios（统一 `R{code,msg,data}`；Access 内存 Bearer；Refresh HttpOnly Cookie + `withCredentials`）

## 项目结构

```text
aftersale-frontend/
├── index.html
├── package.json
├── vite.config.ts          # 开发代理 → gateway :8080
├── .env.development        # VITE_API_BASE（默认空，走相对路径+代理）
├── tsconfig.json           # 工程引用
├── tsconfig.app.json
├── tsconfig.node.json
└── src/
    ├── main.ts             # 入口：Pinia / Router / Element Plus
    ├── App.vue
    ├── style.css
    ├── api/                # 后端接口封装
    │   ├── http.ts         # Axios 实例、拦截器
    │   ├── auth.ts         # 登录 / 登出 / refresh
    │   ├── ticket.ts       # 售后 + 草稿
    │   ├── order.ts
    │   ├── stock.ts
    │   ├── notify.ts
    │   └── user.ts         # 用户管理（ADMIN）
    ├── layouts/
    │   └── MainLayout.vue  # 左菜单 + 顶栏
    ├── router/
    │   └── index.ts        # 路由与角色守卫（进页前静默续期）
    ├── stores/
    │   └── user.ts         # Access 内存 / 角色；Refresh Cookie
    ├── types/
    │   └── api.ts          # R / PageResult / Ticket 等
    ├── utils/
    │   ├── roles.ts        # 按角色裁菜单、首页
    │   └── ticket.ts       # 状态文案 / 终态判断
    ├── components/
    │   └── NotifyBell.vue  # 顶栏铃铛 + 未读角标
    └── views/
        ├── LoginView.vue
        ├── WorkbenchView.vue      # 售后左列表右详情
        ├── TicketApplyView.vue    # 保存草稿 + 提交
        ├── OrderListView.vue
        ├── StockListView.vue
        └── UserManageView.vue
```

## 使用方式

### 环境

- Node.js **20+**（建议；过旧可能装不上 Vite 5）
- 本机已起后端 gateway `:8080`（以及 portal / trade / process）

### 安装与启动

```bash
cd aftersale-frontend
npm install
npm run dev
# 浏览器打开 http://127.0.0.1:5173
```

### 其它脚本

```bash
npm run build     # vue-tsc + vite build → dist/
npm run preview   # 预览构建产物
```

### 代理说明

`vite.config.ts` 将下列前缀转到 `http://127.0.0.1:8080`：

`/api` · `/aftersale` · `/order` · `/stock` · `/sku` · `/notify` · `/user`

前端代码用相对路径即可，无需写死后端域名。

## 角色与页面

| 角色 | 侧栏菜单 |
|------|----------|
| USER | **售后管理**（我的售后、申请售后、我的订单） |
| MERCHANT | **售后管理**（待审核、待退款、全部）+ **库存管理** |
| WAREHOUSE | **售后管理**（待发货、全部）+ **库存管理** |
| ADMIN | **售后管理**（各状态一页 + 全部 + 申请）、订单管理、用户管理、库存管理 |

站内信：顶栏右上角铃铛（红点未读数），不再进侧栏。

申请页：

- **保存** → `POST /aftersale/draft`
- **提交** → `POST /aftersale/apply`（后端先删草稿再新增正式单）
- 进页按订单+SKU `GET /aftersale/draft` 回填（`draft: true` / `status: -1`）

## 种子账号

密码均为 `123456`（用户名仅字母 / 数字 / 下划线）：

| 用户名 | 角色 |
|--------|------|
| user | USER |
| merchant | MERCHANT |
| warehouse | WAREHOUSE |
| admin | ADMIN |

## 鉴权（双 JWT）

| 令牌 | 存放 | 用途 |
|------|------|------|
| Access | **仅内存**（不写 localStorage） | `Authorization: Bearer` 调业务接口 |
| Refresh | **HttpOnly Cookie**（网关 `Set-Cookie`，path=`/api/auth`） | `POST /api/auth/refresh` 换新 Access；续期时旧 Refresh 拉黑 |

- Axios `withCredentials: true`，开发代理同源 Cookie 可用。  
- 刷新页面：路由守卫 `bootstrap()` → 无 Access 则静默 refresh。  
- 业务 401：拦截器续期一次后重试；失败再跳登录。

## 联调注意

1. 先起后端，再 `npm run dev`；浏览器只打 `:5173`，经代理到 gateway。  
2. 不要让前端直连 trade `:8082`（会绕过 JWT / 路径 ACL）。  
3. 后端接口约定、售后状态、草稿语义见 [aftersale-backend README](https://github.com/happierupupup/aftersale-backend)。
