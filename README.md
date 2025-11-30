# 祝福视频生成器

一个简单易用的在线工具，帮助用户为亲人制作个性化祝福视频。

## 功能特点

- 🎨 **精美模板** - 多种主题模板（生日、节日、日常问候）
- 📸 **图片上传** - 支持拖拽上传个人照片
- 🎵 **音乐选择** - 内置背景音乐或上传自定义音乐
- 🎬 **实时预览** - 实时显示视频效果预览
- ⚡ **快速生成** - 60-90秒祝福视频快速生成
- 📱 **响应式设计** - 适配移动端和桌面端
- 💝 **温暖主题** - 粉色系温馨设计风格

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **视频处理**: FFmpeg.wasm（浏览器端）
- **后端**: Supabase（认证 + 存储）
- **UI组件**: 自定义组件 + Lucide图标

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制 `.env.example` 为 `.env` 并填写你的 Supabase 配置：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> 如果没有 Supabase 配置，项目会使用模拟数据运行，适合开发测试。

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用。

### 4. 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── components/          # 可复用组件
│   └── ui/             # 基础UI组件
├── pages/              # 页面组件
│   ├── Home.tsx        # 首页
│   ├── Create.tsx      # 制作页面
│   └── Preview.tsx     # 预览页面
├── stores/             # 状态管理
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
│   ├── supabase.ts     # Supabase客户端
│   ├── videoProcessor.ts # 视频处理
│   └── supabase.mock.ts # 模拟数据
└── App.tsx             # 主应用组件
```

## 使用流程

1. **首页** - 浏览产品介绍和模板预览
2. **制作页面** - 输入祝福信息、选择模板、上传照片和音乐
3. **预览页面** - 生成并预览视频，下载或分享

## 数据库结构

### 模板表 (templates)
- 存储视频模板信息
- 包含名称、分类、配置、预览图

### 项目表 (projects)
- 存储用户制作的项目
- 包含收祝福人、祝福语、模板、图片、音乐、状态等

## 部署

项目支持部署到 Vercel、Netlify 等平台。确保设置正确的环境变量。

## 许可证

MIT License