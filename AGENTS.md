# Repository Guidelines

## 项目结构与模块组织
- `src/` 为前端源码：`components/` 组件、`views/` 页面、`router/` 路由、`store/` 状态、`api/` 请求封装、`utils/` 工具、`style/` 全局样式、`assets/` 资源。
- `public/` 为静态资源与入口模板，`dist/` 为构建产物（自动生成，不手改）。
- 根目录含 `.env`、`.env.development` 环境变量文件与 `vue.config.js`/`babel.config.js` 配置。

## 构建、测试与本地开发命令
- `npm install` 安装依赖。
- `npm run serve` 本地开发热更新（Vue CLI）。
- `npm run build` 生产构建输出到 `dist/`。
- 目前未配置测试或 lint 脚本；如需补充，请同步更新 `package.json` 与本指南。

## 编码风格与命名约定
- 以 Vue 2 SFC 为主（`*.vue`），JS/TS 混用；保持模板与脚本缩进一致（建议 2 空格）。
- 组件使用 PascalCase（如 `VideoList.vue`），路由与视图使用语义化命名（如 `manageVideos`）。
- 依赖同时使用 Element UI、Ant Design Vue、Bootstrap 等 UI 库，新增样式请避免冲突并限定作用域。

## 测试指南
- 当前仓库未内置测试框架与覆盖率要求。
- 若引入测试（如 Jest + Vue Test Utils），请将测试放在 `tests/` 或与源码同级的 `__tests__/`，并在 PR 说明如何运行。

## 提交与合并请求规范
- 现有提交消息多为简短英文动词 + 对象（例如 `add mathjs`、`modify manage`、`Update App.vue`）。建议保持一致，描述清晰即可。
- PR 需包含：变更摘要、影响范围、验证方式（运行命令或手测步骤）。
- UI 相关改动请附关键页面截图或录屏，并标注适配端（PC/移动）。

## 配置与安全提示
- `.env*` 中的密钥与接口地址不要提交到公共仓库；新增环境变量需在 README 或本文件中说明用途与示例。
