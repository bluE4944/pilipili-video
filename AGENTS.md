# Repository Guidelines

## 项目结构与模块组织
代码主要集中在 `src/`：页面放在 `src/views/`，通用组件在 `src/components/`，路由在 `src/router/`，状态管理在 `src/store/`，API 封装在 `src/api/`，工具函数在 `src/utils/`，类型定义在 `src/types/`，全局样式在 `src/style/`，静态资源在 `src/assets/`。静态公开文件放在 `public/`。设计与说明文档位于 `docs/`，脚本位于 `scripts/`，其他资料在 `information/`。

## 构建、测试与开发命令
- `npm install`：安装依赖。
- `npm run serve`：启动本地开发服务器（默认 `http://localhost:8080`）。
- `npm run build`：构建生产包，输出到 `dist/`。
- `npm run type-check`：运行 `vue-tsc` 进行类型检查。

## 编码风格与命名规范
使用 2 空格缩进，TS/JS 采用单引号。Vue 组件使用 `<script setup lang="ts">`。组件文件名采用 PascalCase（如 `VideoCard.vue`），变量/函数使用 camelCase，CSS 类名使用 kebab-case。模块导入优先使用路径别名 `@/` 指向 `src/`。TypeScript 处于严格模式，导出接口尽量显式标注类型。

## 测试指南
当前未配置自动化测试框架，也没有覆盖率门槛。若新增测试，请在 PR 中说明所选框架与目录布局（建议统一 `*.spec.ts` 或 `*.test.ts` 命名），并补充对应的运行命令。

## Commit 与 Pull Request 规范
提交记录以简短英文动词开头为主（如 `add xxx`、`modify xxx`），保持小而清晰。PR 需包含变更摘要、影响范围与自测步骤；涉及 UI 变更请附截图；关联问题请在描述中链接；如修改了配置或文档，记得同步更新对应说明。

## 配置与安全
环境变量文件位于 `.env`、`.env.development` 与 `.env.example`。本地开发请从 `.env.example` 复制并避免提交敏感信息。浏览器端无法直接访问本地文件系统，涉及文件读取需依赖用户选择或后端能力。
