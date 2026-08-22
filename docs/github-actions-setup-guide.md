# GitHub Actions 最佳实践搭建指南

本文档是本模板仓库的完整搭建手册：从空仓库到"CI → AI 审查 → 合并队列 → 自动发布"
全流程的标准搭建顺序。标有 **【人工】** 的步骤必须在 GitHub 网页或本地终端手动执行，
其余为仓库内文件即可完成的部分。

---

## 一、流水线架构总览

```
PR 打开 / 更新
  ├─ ci.yml ────────── 格式检查 / Clippy / 三平台测试矩阵 / 覆盖率 / E2E / 前端构建
  ├─ security.yml ──── gitleaks / cargo-deny
  │
  ├─ CI 全部成功 → review-gate.yml 触发 AI 审查
  │     ├─ CodeRabbit：打 review-ready 标签（官方 label 选入机制）
  │     └─ Greptile：MCP API 直调触发
  │
  └─ CI 失败 → AI 审查全部沉默（失败时的审查没有意义）

main 分支 push ────── 上述门禁 + CodeQL + 性能基准
每周定时 ──────────── CodeQL 全量扫描 / 变异测试
推送 tag v*.*.* ───── release.yml 全平台编译 + GitHub Release（beta 后缀自动标预发布）
```

设计原则：
- **AI 审查是顾问不是门禁**——硬门禁只有分支保护要求的确定性检查
- **每个 workflow 只做一类事**，职责单一互不重叠
- **重活不进 PR 门禁**（CodeQL、变异测试、基准），按成本分配触发时机

---

## 二、搭建步骤（按顺序执行）

### 第 1 步 【人工】创建 main 骨架

```bash
git init && printf '# 项目名\n' > README.md
git add README.md && git commit -m "chore: 初始化空项目"
# 在 GitHub 创建组织与公开仓库后推送
gh repo create <org>/<repo> --public --source=. --push
```

> 为什么 main 只放一个 README：所有业务代码必须走 PR 进入，
> 这样第一次完整流程就是由 PR 驱动的，门禁从第一天起就是真实的。

### 第 2 步 【人工】准备 secrets 与变量

| 名称 | 类型 | 来源 | 用途 |
|---|---|---|---|
| `APP_ID` / `APP_PRIVATE_KEY` | Secret | 自建 GitHub App（见第 4 步） | review-gate 发评论/标签 |
| `GREPTILE_API_KEY` | Secret | app.greptile.com 设置页 | API 直调触发 Greptile |
| `CODECOV_TOKEN` | Secret | codecov.io 绑定仓库 | 覆盖率上报（公开仓库可不填） |
| `AI_REVIEW_ENABLED` | Variable | 手动设置 `true` 时启用 | pi 自建审查开关 |

```bash
gh secret set APP_ID --body "<AppID>"
gh secret set APP_PRIVATE_KEY < app-private-key.pem
gh secret set GREPTILE_API_KEY --body "<key>"
gh variable set AI_REVIEW_ENABLED --body "false"   # 先 false，需要时改 true
```

### 第 3 步 推送自动化配置到 main【人工】

`.github/workflows/*.yml`、`.coderabbit.yaml`、`greptile.json` 这类**自动化配置必须存在于
默认分支才能生效**——这是 GitHub 的机制约束，无法通过 PR 分支提前验证。

推荐做法：业务代码走 PR；仅把 workflow 与配置文件作为独立的"引导提交"推上 main。
引导提交只包含基础设施文件，不包含业务代码。

### 第 4 步 【人工】安装三方 App

1. **Renovate**：<https://github.com/apps/renovate> → Add project。
   依赖升级 PR 由 Renovate 云服务产生，不消耗你的 Actions 分钟数
2. **CodeRabbit**：<https://github.com/apps/coderabbitai> → 公开仓库免费。
   本模板通过 `.coderabbit.yaml` 关闭其自动审查（`auto_review.enabled: false` +
   `labels: ["review-ready"]` 选入），避免与 review-gate 的触发时序打架
3. **Greptile**（可选，二选一或并存）：<https://www.greptile.com/open-source> 申请开源免费档，
   需在 dashboard 开启 "Respond to comments" 以支持手动评论触发

### 第 5 步 配置分支保护与合并队列【人工】

Settings → Rulesets → 新建 ruleset（target: 默认分支）：

- 禁止 delete / non-fast-forward
- required checks（名称必须与 job 的 `name:` 完全一致）：
  `格式检查`、`Clippy`、`测试 (ubuntu-latest)`、`测试 (macos-latest)`、
  `测试 (windows-latest)`、`前端构建`、`密钥泄露扫描`、`依赖检查`
- **合并队列**：ALLGREEN 分组、squash 合并——PR 通过检查后进队列，
  队列内再次验证，避免合入瞬间互相打破
- 给 Repository admin 配置 bypass（否则维护者自己也会被锁死）

命令行方式：

```bash
gh api repos/<org>/<repo>/rulesets -X POST --input ruleset.json
```

### 第 6 步 通过 PR 提交全部业务代码【人工】

从 main 切分支，提交项目骨架，开 PR。此时应观察到完整流程自动运转：

```
打开 PR → CI 三平台矩阵 + 安全扫描并行启动
        → CI 全绿 → review-gate 打标签 / 调 API → 两家 AI 开始审查
        → AI 发现按 P0/P1/P2 分级出现在行内评论
        → 人工确认后进入合并队列 → 合并
```

### 第 7 步 验证清单

| 检查项 | 预期行为 |
|---|---|
| PR 上 CI | 12+ 个检查全绿；连续 push 时旧运行被并发组取消 |
| PR 上安全扫描 | gitleaks 秒级、cargo-deny 约 1 分钟 |
| Review Gate | CI 成功后自动运行；标签先删后加保证每次都重新触发 |
| CodeRabbit / Greptile | 收到标签/API 触发后产出分级审查意见 |
| CodeQL / 基准 / 变异测试 / 发布构建 | PR 上 skipped，分别在 push main、weekly、cron、tag 时执行 |

---

## 三、关键教训（本仓库实际踩过的坑）

1. **PR 与 main 冲突时 pull_request 工作流会静默跳过**
   GitHub 无法构造 merge ref 就直接不触发，API 里连运行记录都没有。
   症状是"所有事件都不触发"，实际是合并冲突。解决：rebase/merge main 消除冲突。

2. **workflow_run 类 workflow 只认默认分支上的版本**
   在 feature 分支上修 bug 无效，必须同步到 main。升级生成器后注意重放补丁。

3. **AI App 会过滤机器人发出的命令评论**
   以 `github-actions[bot]` 或自建 App 身份发的 `@xxx review` 评论会被反循环过滤忽略
   （实测证实），只有真人账号的评论才被响应。因此触发通道用标签（状态事件）和
   MCP API（带 key 直调），不用评论。

3.1 **GitHub App 权限有两层：注册页 ≠ 安装侧**
   App 设置页显示的权限是"申请值"，每个安装点还需批准；未批准时安装实际生效的是旧权限。
   症状：GET 正常、POST 403 "Resource not accessible by integration"。
   修复：安装页接受 pending 权限变更后重新生成令牌。本模板最终方案直接用 `github.token`
   打标签，完全绕开此层复杂度，自建 App 仅在需要机器人身份评论/写操作时才必要。

4. **crate 不能命名为 `core`**——与 Rust 内置核心库冲突，`use core::...` 会解析到内置库。

5. **Windows runner 默认 shell 是 pwsh 不是 bash**
   使用 bash 数组等语法的步骤必须显式声明 `shell: bash`，且这类问题只在推 tag 发版时暴露。

6. **图像快照比对只在单一平台跑**
   macOS/Windows/Linux 字体渲染差异会使像素比对不可复现，视觉回归锁定 Linux。

7. **共享 runner 上性能基准只能检测 ~20% 以上退化**
   噪声环境下精细测量无意义，CI 只防数量级退化，精测在固定硬件本地做。

8. **OAuth 凭据（如 Codex）的 refresh token 会轮换**
   CI 使用的 auth.json 必须来自专用账号，与开发者本地共用会互相顶掉登录态。
