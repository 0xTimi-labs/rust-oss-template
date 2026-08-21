# PR #7 不触发 GitHub Actions 的根因调研（2026-08-22）

## 结论（前置）

**根因：PR #7（feat/v2 → main）与 main 存在 merge conflict，冲突文件为 `.coderabbit.yaml`。GitHub 对有合并冲突的 PR 无法创建 `refs/pull/N/merge` 测试引用，因此不会触发任何 `pull_request` workflow。** 这是 GitHub 官方文档明确记载的行为，且已被本仓库 API 实测证实。

修复方式：将 feat/v2 rebase/merge 到 main 并解决 `.coderabbit.yaml` 冲突后 push，workflow 会以 `synchronize` 事件正常触发。

## 假设逐一验证

### 假设 1（主假设）：merge conflict 导致 pull_request workflow 不触发 —— ✅ 证实

**(a) PR #7 处于冲突状态**

```
$ gh pr view 7 --json mergeable,mergeStateStatus
{"baseRefName":"main","headRefName":"feat/v2","mergeStateStatus":"DIRTY","mergeable":"CONFLICTING","number":7,"state":"OPEN"}
```

本地实测确认冲突文件与双方改动来源：

```
$ git fetch origin main feat/v2 && git merge-tree --write-tree origin/main origin/feat/v2
# exit=1
CONFLICT (content): Merge conflict in .coderabbit.yaml
```

- main 侧：fe3b984「fix: 同步 coderabbit 增量审查配置到 main」改 `.coderabbit.yaml`（4+/5-）
- feat/v2 侧：625e5ec「chore: 精简 CodeRabbit 配置」重写同一文件（15+/29-）
- 双方基于共同祖先 f9a0cca 对同一区域做了不兼容修改。

**(b) 官方文档明确此行为**

GitHub Actions 官方故障排查文档原文：

> "Workflows will not run on `pull_request` activity if the pull request has a merge conflict."

来源：<https://docs.github.com/en/actions/how-tos/troubleshoot-workflows>（"Troubleshooting workflow triggers" 一节）。

机制背景：`pull_request` 事件默认在合成 merge 引用 `refs/pull/<N>/merge` 上运行（`GITHUB_SHA` 即该 merge commit），PR 冲突时该引用无法创建，事件不会被调度。见 <https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows>；社区讨论 <https://github.com/orgs/community/discussions/26304> 有同样结论。

**(c) 与正常触发的 PR #4 对照**

```
$ gh pr view 4 --json mergeable,mergeStateStatus
{"baseRefName":"main","headRefName":"feat/v1","mergeStateStatus":"CLEAN","mergeable":"MERGEABLE","number":4,"state":"CLOSED"}
```

| | PR #4 | PR #7 |
|---|---|---|
| mergeable / state | MERGEABLE / CLEAN | CONFLICTING / DIRTY |
| pull_request runs | 12:57:38Z 三条全部触发（CI/Security/Release） | 0 条 |
| head commit 上的 Actions check suite | 3 个（conclusion=success） | 0 个 |

check suite 对比实测：

```
$ gh api repos/0xTimi-labs/rust-oss-template/commits/3b9e536/check-suites   # PR #4 head
GitHub Pages / coderabbitai / Greptile Apps / GitHub Actions ×3 (success)

$ gh api repos/0xTimi-labs/rust-oss-template/commits/625e5ec/check-suites   # PR #7 head
仅 GitHub Pages / coderabbitai / Greptile Apps 三个 App suite，无任何 GitHub Actions suite
```

App（coderabbitai、Greptile、Pages）自行创建 check run，不受 merge ref 影响，所以它们仍在；Actions 因无法创建 merge ref 而完全缺席。16:12Z close+reopen 后依旧零 run 也与此一致——冲突未解决，任何 `pull_request` 类型（含 reopened）都无法调度。15:00Z 之后仓库 workflow run 总数为 0：

```
$ gh api "repos/0xTimi-labs/rust-oss-template/actions/runs?created=>2026-08-22T15:00:00Z" --jq '.total_count'
0
```

### 假设 2：push feat/v2 只产生 CreateEvent 无 PushEvent —— ✅ 属实，但与本问题无关

Events API 实测（`gh api repos/0xTimi-labs/rust-oss-template/events`）：

- `2026-08-22T15:34:21Z CreateEvent ref=feat/v2 actor=0xTimi2233`
- 无对应 `PushEvent`
- 提交 625e5ec 的 author/committer 时间为 15:34:18Z，3 秒后即出现建分支事件

这是典型的 Web UI 流程（编辑器提交 + 直接在服务端创建分支 ref）：GitHub 直接创建引用时只产生 `CreateEvent`，不产生 `PushEvent`。

对 workflow 触发无影响，因为本仓库的 push 触发器根本不含 feat/v2 这类分支：

```yaml
# ci.yml / security.yml
on:
  pull_request:
  push:
    branches: [main]
# release.yml
on:
  pull_request:
  push:
    tags: ['**[0-9]+.[0-9]+.[0-9]+*']
```

即使有 PushEvent 也不会跑；PR 场景下唯一应触发的就是 `pull_request`，而它被假设 1 挡住。

### 假设 3（排除项复核）：org 策略 / abuse flag / 平台 incident —— ❌ 全部排除

- **repo 级 Actions 配置正常**：`gh api repos/.../actions/permissions` 返回 `{"enabled":true,"allowed_actions":"all","sha_pinning_required":false}`。
- **org 级策略**：查询接口需 org admin 权限（403，非 admin 无法直读）。但有充分反证：若 org 禁用或 abuse 限制生效，同日 12:57:38Z 的三个 pull_request run 不可能成功触发并跑完，且 abuse flag 通常表现为 run 创建后被取消或报 403，而非「零条 run 创建 + 第三方 App 正常运行」。当前观测到的模式只与「无可创建的 merge ref」一致，无需 org admin 权限即可排除。
- **平台 incident**：GitHub Status 显示 2026-08-22 当天 Actions 为 operational，无 incident（最近的 Actions 相关记录是 8 月 17 日已解决的降级和 8 月 18 日标记为误报的事件）。来源：<https://www.githubstatus.com/history>。

## 时间线复盘

| UTC | 事件 | Actions 行为 |
|---|---|---|
| 12:43Z | 推 fe3b984 到 main | CI/Security (push) 触发，failure |
| 12:57:32Z | 推 feat/v1，开 PR #4（无冲突） | 12:57:38Z 三个 pull_request workflow 全部触发 ✓ |
| 13:00:40Z | 关闭 PR #4 | — |
| 15:34:18–21Z | Web UI 在 feat/v1 基础上重写 `.coderabbit.yaml` 并直接创建 feat/v2 分支 | 仅 CreateEvent，无 PushEvent（不影响触发） |
| 15:34:38Z | 开 PR #7（`.coderabbit.yaml` 与 main 冲突） | 零 run 创建，head 无 Actions check suite |
| 16:12Z | close+reopen PR #7 | 冲突未解，仍零 run |

## 参考

- GitHub Docs – Troubleshooting workflows（冲突不触发原文）：<https://docs.github.com/en/actions/how-tos/troubleshoot-workflows>
- GitHub Docs – Events that trigger workflows（`refs/pull/N/merge` 机制）：<https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows>
- GitHub Community Discussion #26304：<https://github.com/orgs/community/discussions/26304>
- GitHub Status 历史：<https://www.githubstatus.com/history>
