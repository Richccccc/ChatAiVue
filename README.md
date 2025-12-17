# Fake Job Prediction System - Frontend

这是一个基于 **Vue 3** + **Vite** + **TypeScript** + **Pure Admin** 构建的现代化前端管理系统。
该项目主要用于假职位预测系统的可视化管理，包含模型训练、部署分析以及职位数据的 CRUD 管理。

## 🚀 功能特性

- **可视化大屏 (Dashboard)**: 直观的数据展示和分析概览。
- **AI 模型管理**:
  - **模型管理**: 统一管理已上传和训练的模型。
  - **模型训练**: 可视化配置训练参数，监控训练进度。
  - **模型分析**: 部署模型并展示预测分析结果。
- **职位数据管理**:
  - 完整的职位增删改查 (CRUD) 功能。
  - 支持多维度筛选和数据导出。
- **现代化技术栈**: 使用最新的前端技术，保证高性能和良好的开发体验。

## 🛠️ 技术栈

- **框架**: [Vue 3](https://vuejs.org/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **UI 组件库**: [Element Plus](https://element-plus.org/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **样式**: [TailwindCSS](https://tailwindcss.com/)
- **图标**: Iconify

## 📦 安装与运行

确保你本地安装了 [Node.js](https://nodejs.org/) (推荐 v18+)。

### 1. 克隆项目
```bash
git clone https://github.com/Richccccc/ChatAiVue.git
cd ChatAiVue
```

### 2. 安装依赖
建议使用 `pnpm` 进行安装，速度更快。
```bash
pnpm install
# 或者 npm install
```

### 3. 启动开发服务器
```bash
pnpm dev
```
启动后访问 `http://localhost:8848` (端口可能不同，请以终端输出为准)。

### 4. 构建生产版本
```bash
pnpm build
```
构建产物将输出到 `dist` 目录。

## ☁️ 部署

本项目支持一键部署到 **Vercel** 或 **Netlify**。

详细部署指南请参考项目中的 deployment_guide.md (如果有)。

## 📄 License
[MIT](./LICENSE)
