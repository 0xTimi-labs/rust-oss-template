window.BENCHMARK_DATA = {
  "lastUpdate": 1787564196948,
  "repoUrl": "https://github.com/0xTimi-labs/rust-oss-template",
  "entries": {
    "Benchmark": [
      {
        "commit": {
          "author": {
            "email": "0xtimi2233@gmail.com",
            "name": "0xTimi2233",
            "username": "0xTimi2233"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d36ece48bf2c7d853e706d8541a7730935a1f800",
          "message": "feat: 完成 Rust OSS 模板 v3 (#9)\n\n* feat: 项目骨架与完整流水线\n\n- Rust workspace：oss-core（lib + 单元/集成测试 + criterion bench）+ cli\n- ci.yml：三平台测试矩阵、fmt/clippy、覆盖率、Bun 前端构建、main 基准\n- security.yml：gitleaks、cargo-deny、CodeQL（push main + 每周定时）\n- nightly.yml：cargo-mutants 变异测试\n- release.yml：cargo-dist 生成，tag 触发全平台发布\n- 工具链固定 1.98.0，action 全部锁定 commit SHA\n- 配套 renovate.json / codecov.yml / deny.toml / REVIEW_GUIDELINES.md\n\n* fix: 工具链组件声明 + workspace 依赖补版本号\n\n* chore: 添加 CodeRabbit 配置，约束其只发评论不改写 PR 描述\n\n* chore: CodeRabbit 配置降噪，只保留审查意见本体\n\n* fix: 修复 CodeRabbit 审查发现\n\n- release.yml：action 锁 SHA、权限收敛为最小化、tag 经环境变量传入防注入\n- ci.yml：bench 管道加 pipefail，不掩盖真实退出码\n- benches：吞吐量字节数改用 INPUT.len()，消除硬编码偏差\n- .gitignore：.idae 笔误改为 .idea/\n- 新增 greptile.json：审查输出中文 + 对齐 REVIEW_GUIDELINES.md 规范\n\n* fix: 开启 dist allow-dirty，允许加固版 release.yml 运行\n\n* fix: allow-dirty 为文件路径列表而非布尔值\n\n* fix: allow-dirty 取值为枚举 ci\n\n* feat: 严格 lint 规范 + AI review 流水线 + Biome 前端工具链\n\n- workspace 级 clippy 禁 unwrap/expect/panic，测试豁免走 clippy.toml 配置\n- bench 消除 unwrap，保持全域一致\n- 新增 ai-review.yml（pi 方案，默认跳过，AI_REVIEW_ENABLED 变量启用）\n- 前端引入 Biome：lint/format 脚本、严格规则、CI 门禁\n- node-version 升至 24\n\n* refactor: 落地整仓审查采纳项\n\n- P0: release.yml tag 注入彻底修复（全部消费点 env + 引号/数组传参）\n- P1: ParseError 实现 Display/Error；renovate groupBy 改 groupName；\n     REVIEW_GUIDELINES semver 描述与实际对齐\n- P2: cli 包改名 rust-oss-template-cli；API 返回 Setting 结构体；\n     workspace lints 加 forbid(unsafe_code)；.idea 移除跟踪；\n     Codecov token 去重；nightly 加 concurrency 并改每周；\n     README 矛盾修正 + 占位符替换清单\n\n* fix: 复审修复\n\n- P0: Build artifacts 步骤补 shell: bash（Windows 默认 pwsh 会解析失败）\n- P2: announce 撤销闲置的 contents:write；README nightly 频率同步；\n     错误实现统一 core::error 路径\n\n* chore: CodeRabbit 等 CI 完成后再审查\n\n* feat: AI 审查统一由 review-gate 在 CI 成功后触发\n\n- 新增 review-gate.yml：CI 成功后逐 bot 评论触发（fork PR 用 head SHA 反查兜底）\n- greptile.json 关闭自动审查（skipReview: AUTOMATIC），仅响应手动评论\n- .coderabbit.yaml 关闭自动审查；github-checks 移到 reviews.tools 正确位置，\n  删除已从 schema 移除的 timeout_ms\n\n* feat: CI 与 review-gate 加并发取消组（防抖）\n\n* feat: review-gate 改用 timi-review-bot App 身份发评论\n\n* chore: 启用 AI 审查自动化配置（引导提交）\n\nreview-gate.yml / .coderabbit.yaml / greptile.json 必须存在于默认分支才能生效，\n从 feat 分支提前摘出，业务代码仍走 PR 流程\n\n* fix: Greptile 复审发现修复\n\n- review-gate：PR 号优先取事件自带值，反查时过滤 open 状态\n- ai-review：审查规范改从可信 main 分支读取，防被审 PR 指令注入\n\n* docs: 测试 push 事件触发\n\n* chore: 验证 synchronize 触发\n\n* feat: 前端 Playwright e2e 示例（功能断言 + ARIA 快照 + 图像快照）\n\n- playwright.config.ts：CI 稳定性选项（禁动画/藏光标/forbidOnly/重试）\n- e2e job 仅 ubuntu：图像快照跨平台渲染差异大，基准图按平台维护\n- 失败时上传 playwright-report 产物\n\n* fix: review-gate 无 checkout 环境，gh 命令显式指定仓库\n\n* fix: review-gate 同步修复（无 checkout 环境需显式指定仓库；PR 反查优先 open 状态）\n\nworkflow_run 类 workflow 只能从默认分支生效，此修复无法通过 PR 分支提前验证，\n属于基础设施引导性质，故直推 main（见模板文档说明）\n\n* chore: 触发完整 AI 审查流程验证\n\n* feat: AI 审查触发改为确定性通道\n\n- CodeRabbit：label 选入（review-ready），官方机制不受评论者身份影响\n- Greptile：MCP API 直调，绕开 GitHub 评论身份过滤\n- 移除评论触发方式（两家均过滤机器人命令评论，已实测证实）\n\n* fix: review-gate 触发方式重构 + 同步 coderabbit 配置\n\n* fix: CodeRabbit 审查发现修复\n\n- review-gate：App token 最小权限；PR 未找到时正确跳过后续步骤；\n  标签先删后加，确保每次 CI 成功都重新触发审查\n- .coderabbit.yaml：label 选入状态机修正（enabled:false + 增量关闭）\n- ci.yml 等：checkout 统一 persist-credentials: false\n- deny.toml：未知依赖源 warn 改 deny\n- bun-version 固定 1.3.14（Renovate 负责升级）\n- README：分支保护 check 名称与实际对齐、AI 审查启用步骤修正、\n  补充 App/GREPTILE_API_KEY 配置项\n\n* fix: 同步 review-gate 重构与 coderabbit 状态机到 main\n\n* fix: Greptile 触发步骤与 CodeRabbit 互不阻塞\n\n* docs: GitHub Actions 最佳实践搭建指南\n\n* chore: 重新触发 gate 诊断\n\n* fix: review-gate 重写（权限诊断步骤 + 状态机修正）\n\n* debug: 令牌读写权限行为探测\n\n* chore: 触发诊断\n\n* refactor: 标签操作改用 github.token，移除 App 令牌依赖\n\n标签是状态变更事件而非评论，不存在 bot 评论过滤问题；\ngithub.token 按 workflow permissions 声明即具备 issues 写权限\n\n* chore: 触发验证\n\n* docs: 补充 GitHub App 双层权限坑位说明\n\n* fix: 落地双报告采纳项\n\n- ci/security: 增加 merge_group 触发；cargo 命令加 --locked\n- review-gate: 幂等标签（移除删加状态机）、并发键改 PR 编号、权限降级\n- security: fork PR 改用开源 gitleaks CLI 容器（无 license 依赖）\n- ai-review: 凭据写入晚于依赖安装 + persist-credentials:false +\n  仅内部成员 PR 可启用 + PI_CODING_AGENT_DIR 安装/运行时一致\n- Cargo.toml: 声明 MSRV 1.98\n- cli: 抽取 run() 入口、BrokenPipe 视为正常退出、新增集成测试\n- web: Playwright webServer 统一管理、viewport meta\n- README/docs: 总览表补全、App 残留清理、措辞修正\n\n* fix: PR 打标签需要 pull-requests: write（诊断子代理实证结论）\n\n* chore: 验证权限修复后的完整流程\n\n* fix: 启用标签保留期间的自动增量审查（默认行为）\n\n* chore: 验证增量审查\n\n* docs: 补充踩坑记录 9/10（PR 标签权限、App 双层权限）\n\n* refactor: 首次 CI 成功后触发 AI 审查",
          "timestamp": "2026-08-23T16:47:07+08:00",
          "tree_id": "4b58e51c906b9a0c755c3c82ad1da677a2416deb",
          "url": "https://github.com/0xTimi-labs/rust-oss-template/commit/d36ece48bf2c7d853e706d8541a7730935a1f800"
        },
        "date": 1787474879073,
        "tool": "cargo",
        "benches": [
          {
            "name": "parse_setting/typical-line",
            "value": 24,
            "range": "± 0",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "0xtimi2233@gmail.com",
            "name": "chenxiang",
            "username": "0xTimi2233"
          },
          "committer": {
            "email": "0xtimi2233@gmail.com",
            "name": "chenxiang",
            "username": "0xTimi2233"
          },
          "distinct": true,
          "id": "5d253f5a7377e447228e649abfef10d8f17ed369",
          "message": "fix: 基准测试移除 rust-cache（criterion 数据恢复损坏）",
          "timestamp": "2026-08-23T23:34:59+08:00",
          "tree_id": "4f0d47394c2e94f9ce9e541f1cdd36a2f39c6b78",
          "url": "https://github.com/0xTimi-labs/rust-oss-template/commit/5d253f5a7377e447228e649abfef10d8f17ed369"
        },
        "date": 1787499362501,
        "tool": "cargo",
        "benches": [
          {
            "name": "parse_setting/typical-line",
            "value": 33,
            "range": "± 0",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "0xtimi2233@gmail.com",
            "name": "0xTimi2233",
            "username": "0xTimi2233"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "cefbff5db87c657490402d99889dac5316bb8ec1",
          "message": "test: 覆盖 ParseError Display 输出（变异测试发现的漏测） (#20)",
          "timestamp": "2026-08-23T23:44:22+08:00",
          "tree_id": "8741384cd74d408e34a2a9b3008d326f72cfcf85",
          "url": "https://github.com/0xTimi-labs/rust-oss-template/commit/cefbff5db87c657490402d99889dac5316bb8ec1"
        },
        "date": 1787499938937,
        "tool": "cargo",
        "benches": [
          {
            "name": "parse_setting/typical-line",
            "value": 33,
            "range": "± 0",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "0xtimi2233@gmail.com",
            "name": "0xTimi2233",
            "username": "0xTimi2233"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d8dc1c3865680ed4ee403da0f0b08d498f3e9692",
          "message": "fix: merge_group 密钥扫描改用 CLI 容器 (#23)\n\n* fix: merge_group 密钥扫描改用 CLI 容器（官方 action 不支持该事件）\n\n* style: 格式化 Display 测试断言（rustfmt 1.98.0）\n\n* fix: gitleaks 多行命令改用 literal 块（plain scalar 反斜杠续行产生前导空格）",
          "timestamp": "2026-08-23T17:38:14Z",
          "tree_id": "eca640216aa1bde7d491239f27d9d191813d3356",
          "url": "https://github.com/0xTimi-labs/rust-oss-template/commit/d8dc1c3865680ed4ee403da0f0b08d498f3e9692"
        },
        "date": 1787506823838,
        "tool": "cargo",
        "benches": [
          {
            "name": "parse_setting/typical-line",
            "value": 33,
            "range": "± 3",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "0xtimi2233@gmail.com",
            "name": "0xTimi2233",
            "username": "0xTimi2233"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "23c4a4eb5ec3d72eaa0b0378746c884e87b380b9",
          "message": "chore: merge_group 检查集按价值分层，定时任务统一上班前窗口 (#25)\n\n- gitleaks/coverage 不进 merge_group（内容原子/趋势型检查，由 push main 兜底）\n- gitleaks CLI 容器仅用于 fork PR（merge_group 跳过）\n- concurrency 键改用 head_sha（防旧 SHA 迟到事件取消新 run）\n- 定时任务对齐北京时间：安全扫描周一 07:30、变异测试周六 09:30、Renovate 周一 06:30",
          "timestamp": "2026-08-23T18:33:04Z",
          "tree_id": "153fde36faf6677e89db2359c4079ed80932650d",
          "url": "https://github.com/0xTimi-labs/rust-oss-template/commit/23c4a4eb5ec3d72eaa0b0378746c884e87b380b9"
        },
        "date": 1787510134037,
        "tool": "cargo",
        "benches": [
          {
            "name": "parse_setting/typical-line",
            "value": 29,
            "range": "± 3",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "0xtimi2233@gmail.com",
            "name": "0xTimi2233",
            "username": "0xTimi2233"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d75f8a8c765e6c2036152501ac002997f8801f3c",
          "message": "docs: 明确 main 变更一律走 PR 与合并队列 (#21)",
          "timestamp": "2026-08-23T18:35:20Z",
          "tree_id": "d5474be2b98f84b72b83f71dbf2eb786aa68ec8c",
          "url": "https://github.com/0xTimi-labs/rust-oss-template/commit/d75f8a8c765e6c2036152501ac002997f8801f3c"
        },
        "date": 1787510276791,
        "tool": "cargo",
        "benches": [
          {
            "name": "parse_setting/typical-line",
            "value": 30,
            "range": "± 0",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "0xtimi2233@gmail.com",
            "name": "0xTimi2233",
            "username": "0xTimi2233"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "17236e35b0fc974277b2517dbab981630a71976d",
          "message": "docs: 修正发布 tag 与包版本一致性说明 (#27)\n\ncargo-dist 要求 tag 与 workspace.package.version 一致；预发布需先改包版本。\n同步修正 README 示例、搭建指南与 Cargo.toml 注释",
          "timestamp": "2026-08-23T18:44:27Z",
          "tree_id": "3d6489c73f66302895bd209a53985fa898ad85b6",
          "url": "https://github.com/0xTimi-labs/rust-oss-template/commit/17236e35b0fc974277b2517dbab981630a71976d"
        },
        "date": 1787510810549,
        "tool": "cargo",
        "benches": [
          {
            "name": "parse_setting/typical-line",
            "value": 25,
            "range": "± 0",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "0xtimi2233@gmail.com",
            "name": "0xTimi2233",
            "username": "0xTimi2233"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "98e1f0dee7599c8e76fcb55f53fbf688f9419a09",
          "message": "fix: 补充 cargo-dist 构建所需的 dist profile (#28)\n\nrelease 链路实测：缺 [profile.dist] 导致 5 个平台构建 job 全部 exit 255。\n同步在搭建指南中记录该要求",
          "timestamp": "2026-08-23T18:51:54Z",
          "tree_id": "79858bdf1d8ea4eb34dce9245cca5719affc8b12",
          "url": "https://github.com/0xTimi-labs/rust-oss-template/commit/98e1f0dee7599c8e76fcb55f53fbf688f9419a09"
        },
        "date": 1787511257730,
        "tool": "cargo",
        "benches": [
          {
            "name": "parse_setting/typical-line",
            "value": 33,
            "range": "± 0",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "0xtimi2233@gmail.com",
            "name": "0xTimi2233",
            "username": "0xTimi2233"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "08f96c68166af793bc7ac3a9f88d719b56dd1872",
          "message": "test: 验证 CI、Codecov 覆盖率与 AI 审查完整流水线 (#30)\n\n* test: 验证 CI、Codecov 覆盖率与 AI 审查完整流水线\n\n* fix(security): 收敛可复用工作流的密钥访问，显式传递 CODECOV_TOKEN 与 GITLEAKS_LICENSE\n\n* perf(ci): 优化 cargo-deny 原生执行、添加 Playwright 缓存并启用 CodeQL 动静分层\n\n* fix(ci): 修正 cargo deny check 命令行参数\n\n* fix(e2e): 命中 Playwright 缓存时补充安装系统字体与依赖",
          "timestamp": "2026-08-24T09:10:23Z",
          "tree_id": "75c9bfcff90fa725c9700b28f57bbdb01922a528",
          "url": "https://github.com/0xTimi-labs/rust-oss-template/commit/08f96c68166af793bc7ac3a9f88d719b56dd1872"
        },
        "date": 1787562809493,
        "tool": "cargo",
        "benches": [
          {
            "name": "parse_setting/typical-line",
            "value": 31,
            "range": "± 3",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "0xtimi2233@gmail.com",
            "name": "0xTimi2233",
            "username": "0xTimi2233"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "048fd60ab5a00d38425bb2d5c71c6a10dca2d114",
          "message": "docs: 完善 Codecov 组织凭据配置与最小权限工作流架构说明 (#31)\n\n* docs: 完善 Codecov 组织凭据配置与最小权限工作流架构说明\n\n* docs: 精炼 Codecov 覆盖率报告定位与可观察性描述",
          "timestamp": "2026-08-24T09:33:48Z",
          "tree_id": "0266c24bfc6184f8ff2191b32ada1864d6b8a70a",
          "url": "https://github.com/0xTimi-labs/rust-oss-template/commit/048fd60ab5a00d38425bb2d5c71c6a10dca2d114"
        },
        "date": 1787564196202,
        "tool": "cargo",
        "benches": [
          {
            "name": "parse_setting/typical-line",
            "value": 39,
            "range": "± 1",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}