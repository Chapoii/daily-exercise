# Tasks
- [x] Task 1: 初始化 Vue3 项目
  - [x] 使用 pnpm 创建 Vite + Vue3 项目
  - [x] 安装必要依赖（vue-router, pinia 等）
  - [x] 配置项目结构

- [x] Task 2: 创建数据模型
  - [x] 定义周计划数据结构
  - [x] 创建训练日数据（7 天）
  - [x] 定义动作、组数、时间/次数数据模型

- [x] Task 3: 实现主页面布局
  - [x] 创建首页（显示今日训练）
  - [x] 创建周计划视图
  - [x] 添加响应式样式

- [x] Task 4: 实现训练计时器
  - [x] 创建倒计时逻辑
  - [x] 实现动作/休息状态切换
  - [x] 添加视觉提示（颜色变化）

- [x] Task 5: 实现训练流程控制
  - [x] 管理当前动作和组数
  - [x] 实现组间自动切换
  - [x] 实现动作间自动切换
  - [x] 完成训练提示

- [x] Task 6: 实现用户交互
  - [x] 开始/暂停/跳过按钮
  - [x] 进度条显示
  - [ ] 声音提示（可选）

- [x] Task 7: 实现进度追踪
  - [x] 使用 localStorage 存储进度
  - [x] 记录完成的训练日
  - [x] 显示训练历史

- [x] Task 8: 优化和测试
  - [x] 移动端适配优化
  - [x] 测试完整训练流程
  - [x] 修复 bug

# Task Dependencies
- Task 2 依赖 Task 1
- Task 3 依赖 Task 1
- Task 4 依赖 Task 2
- Task 5 依赖 Task 4
- Task 6 依赖 Task 5
- Task 7 依赖 Task 5
- Task 8 依赖 Task 6, Task 7
