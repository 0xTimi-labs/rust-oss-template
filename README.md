# rust-oss-template

开源 Rust 项目模板：跨平台 CLI + 核心库 + 极简前端，内置完整的 CI/安全/发布流水线。

## 流水线总览

| Workflow | 触发 | 内容 |
|---|---|---|
| `ci.yml` | PR / push main | 三平台测试矩阵、fmt、clippy、覆盖率上报、前端构建、main 上跑性能基准 |
| `security.yml` | PR / push main / 每周一 | gitleaks 密钥扫描、cargo-deny 依赖检查、CodeQL 静态分析 |
| `nightly.yml` | 每天凌晨 / 手动 | cargo-mutants 变异测试 |
| `release.yml` | 推送 tag `v*` | cargo-dist 自动产出全平台二进制 + 安装器 + GitHub Release |

## 发布

```bash
# 正式版
git tag v0.1.0 && git push origin v0.1.0

# 预发布版（自动标记为 pre-release）
git tag v0.1.0-beta.1 && git push origin v0.1.0-beta.1
```

## 本地开发

```bash
cargo test --workspace     # 测试
cargo clippy --workspace   # Lint
cargo bench --workspace    # 基准
cd web && bun install && bun run build   # 前端（Bun）
```

## 已配置的仓库设置

- **分支保护**：main 禁止直推，fmt/clippy/三平台测试/前端构建/gitleaks/cargo-deny 全部通过才能进队列
- **合并队列**：PR 通过检查后进入队列，按 ALLGREEN 策略分组合并，避免合入瞬间互相打破

## 推送到 GitHub 后的启用清单

以下功能依赖仓库级配置，本地无法完成：

### 必做

0. [ ] **替换模板占位符**：根 `Cargo.toml` 的 `repository` 字段、`LICENSE` 版权人、
       各 crate 包名（当前含 rust-oss-template 前缀）
1. [ ] **安装 Renovate App**：<https://github.com/apps/renovate> → Add project，之后每周一自动提依赖升级 PR
2. [ ] **安装 CodeRabbit App**（AI reviewer）：<https://github.com/apps/coderabbitai> → 开源仓库免费，装完即在每个 PR 上生效；备选 Greptile（OSI 开源免费需申请：<https://www.greptile.com/open-source>）
3. [ ] **分支保护**：Settings → Branches → main 要求 `test (ubuntu-latest)`、`test (macos-latest)`、`test (windows-latest)`、`clippy`、`gitleaks`、`cargo-deny` 通过后才能合并

### 可选

4. [ ] **CODECOV_TOKEN**：codecov.io 绑定仓库后把 token 存到 Actions secrets（公开仓库不填也能工作）
5. [ ] **基准历史**：bench job 首次运行需要 `gh-pages` 分支存在：`git switch -c gh-pages && git commit --allow-empty -m init && git push origin gh-pages`
6. [ ] **自建 AI reviewer（pi 方案）**：想替换 CodeRabbit 时再加 `ai-review` job——专用账号登录 pi 后导出 `~/.pi/agent/auth.json` 内容到 secrets `PI_AUTH_JSON`

## 注意事项

- `release.yml` 由 cargo-dist 生成后叠加了本地安全加固补丁（SHA 锁定/权限收敛/tag 防注入，
  详见文件头清单），**升级 dist 重新 generate 后需对照文件头重放补丁**
- 性能基准在共享 runner 上只能可靠检测 ~20% 以上的退化，精细测量请在固定硬件的本地机器上做
