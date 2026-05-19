# 中山房产智能日报 Agent

每天早上 9:00 自动搜集中山房产信息，通过 PushPlus 推送到个人微信。

## 快速开始

### 1. 获取 PushPlus Token
- 访问 pushplus.plus 注册
- 关注其公众号，获取你的 Token

### 2. 获取 YouTube API Key（可选）
- 访问 Google Cloud Console
- 启用 YouTube Data API v3
- 创建 API Key

### 3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 填入你的 Token 和 Key
```

### 4. 本地测试
```bash
pip install -r requirements.txt
python main.py
```

### 5. 部署到 GitHub
- 将代码推送到 GitHub 仓库
- 在 Settings > Secrets and variables > Actions 中添加：
  - `PUSHPLUS_TOKEN`
  - `YOUTUBE_API_KEY`（可选）
- Actions 会每天早上 9:00 自动运行
- 也可以在 Actions 页面手动触发测试
