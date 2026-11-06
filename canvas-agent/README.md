# Infinite Canvas 连接器

本机只运行连接器，不部署画布。画布、用户数据、生成任务和算力点继续使用当前打开的 `studio.massmore.org` 或 `canvas.linkfoai.com` 页面；工具定义、节点操作和生成流程仍由网页现有实现执行。

## 启动

安装 Node.js 22+ 后，保持线上画布标签打开并登录，在终端执行：

```sh
npx -y github:Laurenceli13/infinite-canvas-connector#v0.1.5
```

首次启动自动生成 Token，保存在当前用户的 `~/.infinite-canvas/codex-agent.json`；下次启动复用。终端显示 `Local URL` 和 `Connect token`，默认地址为 `http://127.0.0.1:3210`。连接器只接受 `studio.massmore.org` 和 `canvas.linkfoai.com` 两个正式域名。

Codex 尚未登录时执行 `npx -y @openai/codex@0.159.2 login` 并完成登录，已有登录态会直接复用。

## 插件自动连接

在 Codex 所在电脑执行：

```sh
codex plugin marketplace add https://github.com/Laurenceli13/infinite-canvas-connector.git
codex plugin add canvas-agent@infinite-canvas
```

安装后新建 Codex 对话，说“帮我打开并连接到 Infinite Canvas”。插件优先使用当前对话提供的画布地址或原画布标签；无法确定站点时再询问地址。

插件市场由独立的公开连接器仓库提供，避免让用户访问私人画布仓库。插件只负责启动连接器和打开线上画布；MCP 与画布工具仍由网页提供。

插件会启动服务、自动带入连接信息，并通过 MCP 确认目标画布。已有画布优先复用原浏览器标签；标签不可控时使用 `npx -y github:Laurenceli13/infinite-canvas-connector#v0.1.5 open "<画布URL>" <浏览器> [浏览器参数...]`。浏览器支持 `chrome`、`edge`、`firefox`、`brave` 和 `default`，保持原浏览器及配置；画布地址沿用实际的 `/canvas/[id]` 路由。浏览器的本地网络权限提示由用户允许。

移除插件执行 `codex plugin remove canvas-agent`。

## 直接注册 MCP

与插件安装二选一：

```sh
codex mcp add infinite-canvas -- npx -y github:Laurenceli13/infinite-canvas-connector#v0.1.5 mcp
```

直接注册 MCP 不包含自动打开 Skill，需要先启动服务并连接画布。移除时执行 `codex mcp remove infinite-canvas`。

## 本机配置与范围

`npx -y github:Laurenceli13/infinite-canvas-connector#v0.1.5 config` 输出 `{url, token, origins}`，首次尚未启动时会提示先启动服务。HTTP `GET /config` 只返回 `{url, hasToken}`；Token 和包含它的连接链接不要分享。

`CANVAS_AGENT_TOKEN`、`CANVAS_AGENT_PORT` 可选环境变量覆盖 Token 和端口；更改后重启服务。网站来源固定为两个正式域名，不能通过环境变量放开。

外部 MCP 默认只操作唯一已连接的画布；多个画布连接时，通过 MCP 环境变量 `CANVAS_AGENT_CLIENT_ID` 明确目标。断开连接会结束对应 Codex 进程，已提交的生成任务仍由现有画布流程处理。

外部 MCP 仅对已登录的正式画布会话开放。未登录时 MCP 工具列表为空，工具调用返回 `login_required`；登录后，图片、视频和音频生成继续走画布现有任务与算力点扣退链路。关闭画布标签会断开外部 MCP。

默认权限为 `workspace-write` 与 `on-request`，工作目录为实际 Agent 包目录。服务不写 Codex 全局配置文件；其他全局 MCP 是否合并到当前会话尚未联调确认。
