# GitHub Pages 自动部署指南

## 🚀 已配置 GitHub Actions

已创建 `.github/workflows/deploy.yml`，实现自动部署功能。

## 📋 部署配置

### 自动触发

- 当推送代码到 `main` 分支时自动构建并部署
- 可以在 GitHub Actions 页面手动触发工作流

### 工作流程

1. **Build 阶段**：
   - 检出代码
   - 设置 Node.js 环境
   - 安装 pnpm 和依赖
   - 执行 `pnpm run build` 构建

2. **Deploy 阶段**：
   - 上传构建产物到 GitHub Pages
   - 自动部署到 `https://chapoii.github.io/daily-exercise/`

## ⚙️ GitHub Pages 设置

### 重要：更改 Pages 源配置

1. 进入 https://github.com/chapoii/daily-exercise/settings/pages

2. 在 **Build and deployment** 部分：
   - **Source**: 选择 **GitHub Actions** (而不是 "Deploy from a branch")

3. 保存后，每次推送到 main 分支都会自动部署

## 🔄 使用方式

### 自动部署

```bash
# 提交并推送代码
git add .
git commit -m "更新内容"
git push origin main

# GitHub Actions 会自动运行并部署
```

### 手动部署

1. 进入 https://github.com/chapoii/daily-exercise/actions
2. 选择 "Deploy to GitHub Pages" 工作流
3. 点击 "Run workflow"
4. 选择分支（通常是 main）
5. 点击 "Run workflow"

## 📊 查看部署状态

- **Actions 页面**: https://github.com/chapoii/daily-exercise/actions
- **Pages 状态**: https://github.com/chapoii/daily-exercise/settings/pages

## ✨ 优势

相比手动部署，GitHub Actions 的优势：

1. **自动化**: 推送代码即自动部署，无需手动运行命令
2. **一致性**: 每次都在相同的环境中构建，避免本地环境问题
3. **可追溯**: 每次部署都有记录，方便回滚和查看历史
4. **并发控制**: 自动取消正在进行的旧部署，确保部署最新版本

## 🔧 故障排除

### 部署失败

1. 检查 Actions 页面的日志
2. 确认 `vite.config.js` 中的 `base` 配置正确
3. 确认 `package.json` 中的构建脚本正确

### 部署成功但页面空白

**原因**: 路由模式配置问题

**解决方案**:

- 已配置为 Hash 路由模式，URL 会包含 `#` 符号
- 访问地址：`https://chapoii.github.io/daily-exercise/#/`

### 部署成功但页面 404

1. 等待几分钟，GitHub Pages 可能需要时间更新
2. 硬刷新浏览器（Ctrl+Shift+R 或 Cmd+Shift+R）
3. 检查浏览器控制台的错误信息

### 资源加载失败

确认 `vite.config.js` 中的 `base` 路径与仓库名称一致：

```javascript
base: '/daily-exercise/',
```

## 📝 路由说明

本项目使用 **Hash 路由模式**，URL 格式如下：

- 首页：`https://chapoii.github.io/daily-exercise/#/`
- 训练页：`https://chapoii.github.io/daily-exercise/#/training`
- 详情：`https://chapoii.github.io/daily-exercise/#/workout/1`

Hash 路由的优势：

- ✅ 无需服务器配置
- ✅ 完美支持 GitHub Pages
- ✅ 不会出现 404 错误

## 📝 注意事项

- 部署源必须改为 "GitHub Actions" 而不是 "Deploy from a branch"
