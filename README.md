# rust-oss-template

开源 Rust 项目模板：跨平台 CLI、核心库与极简前端，内置 CI、安全、审查和发布流水线。

## 流水线总览

| Workflow | 触发 | 内容 |
|---|---|---|
| `ci.yml` | PR / push main / merge queue | 三平台测试矩阵、fmt、clippy、覆盖率上报、E2E、前端构建、main 上跑性能基准 |
| `security.yml` | PR / push main / 每周一 | gitleaks 密钥扫描、cargo-deny 依赖检查、CodeQL 静态分析 |
| `review-gate.yml` | CI 首次成功后自动 | 校验 PR 状态与 head SHA 后，发布两条 AI 审查命令评论；后续提交由维护者手动触发 |
| `ai-review.yml` | 手动（默认关闭） | pi 自建 AI 审查，仅内部成员 PR 可启用 |
| `nightly.yml` | 每周六 / 手动 | cargo-mutants 变异测试 |
| `release.yml` | PR 预检 + 推送 tag | cargo-dist 自动产出全平台二进制、安装器与 GitHub Release |

Review Gate 只处理名为 `CI` 的 `workflow_run` 完成事件，且仅接受 `pull_request` 成功运行。PR 必须处于 Ready 状态，当前 `head.sha` 必须等于该运行的 `head_sha`；fork PR 使用来源仓库与分支反查，旧运行直接跳过。同一 PR 的触发任务串行执行；已有自动命令评论时，后续成功 CI 均跳过。

首次触发由 `github-actions[bot]` 发布两条评论：

- `@coderabbitai review`
- `@greptileai review`

CodeRabbit 的自动审查与自动增量审查已关闭，但维护者仍可手动评论 `@coderabbitai review`。Greptile 保持 `skipReview=AUTOMATIC`，后续由维护者手动评论 `@greptileai review`。

## 发布

```bash
git tag v0.1.0 && git push origin v0.1.0
git tag v0.1.0-beta.1 && git push origin v0.1.0-beta.1
```

## 本地开发

```bash
cargo test --workspace
cargo clippy --workspace
cargo bench --workspace
cd web && bun install && bun run build
```

## 已配置的仓库设置

- **分支保护**：main 禁止直推，格式、Clippy、三平台测试、E2E、前端构建和安全检查全部通过后才能合并。
- **合并队列**：PR 通过检查后进入队列，按 ALLGREEN 策略分组合并，避免并发合入互相破坏。

## 推送到 GitHub 后的启用清单

以下功能依赖仓库级配置，本地无法完成：

### 必做

0. [ ] **替换模板占位符**：根 `Cargo.toml` 的 `repository` 字段、`LICENSE` 版权人和各 crate 包名。
1. [ ] **安装 Renovate App**：<https://github.com/apps/renovate> → Add project。
2. [ ] **安装 CodeRabbit App**：<https://github.com/apps/coderabbitai> → 开源仓库免费。
3. [ ] **安装并配置 Greptile**：<https://github.com/apps/greptileai>。保持仓库配置 `skipReview=AUTOMATIC`，并允许 `github-actions[bot]` 的命令评论触发审查。
4. [ ] **配置分支保护**：Settings → Rulesets → main 规则集的 required checks 与实际 job 名称一致：`格式检查`、`Clippy`、`测试 (ubuntu-latest)`、`测试 (macos-latest)`、`测试 (windows-latest)`、`E2E 测试`、`前端构建`、`密钥泄露扫描`、`依赖检查`。

### 可选

5. [ ] **CODECOV_TOKEN**：codecov.io 绑定仓库后把 token 存到 Actions secrets（公开仓库可不填）。
6. [ ] **基准历史**：bench job 首次运行需要 `gh-pages` 分支存在。
7. [ ] **自建 AI reviewer（pi 方案）**：`ai-review.yml` 默认关闭；按文件内说明配置后，通过 `workflow_dispatch` 手动运行。

## 维护约定

- `workflow_run` 工作流只从默认分支上的版本生效；修改 Review Gate 后须同步到默认分支。
- Review Gate 只在首次成功 CI 时自动发布命令评论。PR 后续每次提交由维护者确认变更后手动评论触发审查；若首次触发只成功发布一条评论，维护者应根据失败日志手动补发另一条。
- AI 审查是顾问，不是合并门禁；确定性门禁仍由分支保护与合并队列负责。
- `release.yml` 由 cargo-dist 生成后叠加安全加固补丁；升级 dist 后需重新核对 SHA 锁定、权限和输入校验。
- 性能基准在共享 runner 上只用于发现数量级退化；精细测量应在固定硬件执行。
