# arthus-harness

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <strong>简体中文</strong> ·
  <a href="README.zh-TW.md">繁體中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.tr.md">Türkçe</a>
</p>

> 通用的 Claude Code harness 工程套件。通过 **5 层保护**(流程 · 技术不变量 · 操作原则 · 通过 SDD 的契约不变量 · 体验不变量)引导新项目 — 从 `go-party-venue-hub` 中提取。

[![npm version](https://img.shields.io/npm/v/create-arthus-harness.svg)](https://www.npmjs.com/package/create-arthus-harness)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 快速开始

```bash
npx create-arthus-harness my-project
cd my-project
```

向导会问 **3 个问题**(预设 · 原则 · git-init)并生成一个项目,包含:

- 9 个专业 agent(`code-reviewer`, `typescript-reviewer`, `silent-failure-hunter`, `security-reviewer`, `a11y-architect`, `refactor-cleaner`, `code-archaeologist`, `debugger`, `product-manager`)
- 4 个 skill(`experience-principles`, `init-project`, `harness-doctor`, `spec-keeper`)
- 3 个 hook(`config-protection`, `post-edit-accumulator`, `batch-format-typecheck`)
- 5 个 slash command(`/plan`, `/feature-dev`, `/code-review`, `/refactor-clean`, `/save-session`)
- 8 个文档模板(ADR, RUNBOOK, SPEC 等)
- **5 层文档栈**:`MISSION.md`(技术不变量)· `Docs/SPEC.md`(组件契约,Spec-Driven Development)· `Docs/sdd-guide.md`(SDD 方法)· `Docs/produto/PRODUTO.md`(愿景 + 操作原则)· `Docs/produto/principios-de-experiencia.md`(情感不变量)
- 5 个 CI workflow(lint, design-check, type-check, secrets-scan, npm-audit)
- 用于 `arthus-harness sync` 的锁文件 `.arthus-harness/lock.json` + `baseline/`

## 这是什么?

Cristiano 花了几个月在 `go-party-venue-hub` 中构建了一个复杂的 Claude Code harness:17 个专业 agent、12 个 skill、4 个 hook、7 个 slash command、8 个模板、MCP 集成、自动 memory、design-system 流水线。这个 repo 提取了**形式**(通用准则)成为一个可复用套件,同时将**内容**(Asaas, Veriff, Supabase RLS, Confiança/Alívio)留在 opt-in 插件中。

**Job-To-Be-Done。** 当你开始一个新项目时,你希望你的"产品有感觉"的纪律 + 操作 Claude Code 的习惯已经安装好了 — 而不必记住你是如何在上一个项目中达到那一点的。

## 这不是什么

- ❌ React/Next/Vite 样板(你带自己的栈)
- ❌ create-next-app / Yeoman / Cookiecutter(那些生成产品代码)
- ❌ SaaS 模板 / starter kit
- ❌ 运行时依赖(一次性生成器,bootstrap 后零占用)

## 5 层保护

> **MISSION** = 永不在技术上崩溃 · **SPEC** = 组件之间的契约 · **PRODUTO §Princípios** = 如何权衡决策 · **principios-de-experiencia** = 永不在情感上崩溃。每一层有不同的严重性和频率 — 不要合并。详情见 [`docs/architecture.md`](docs/architecture.md)。

### 1. 流程层 — hooks + slash commands

每次 commit 都经过:

- **`config-protection.cjs`**(PreToolUse,**阻塞**)— 阻止在没有用户明确授权的情况下编辑 `tsconfig`、`eslint`、`package.json`、`MISSION.md` 等。防止 agent 通过放松配置来掩盖错误。
- **`batch-format-typecheck.cjs`**(Stop,**lint 阻塞 / tsc 警告**)— 在会话结束时对编辑过的文件运行 ESLint。lint 错误时阻塞 Stop。tsc 仅警告(TS 债务是渐进的)。
- **`post-edit-accumulator.cjs`**(PostToolUse,**警告**)— 自动 memory:在 `~/.claude/projects/<slug>/memory/` 中记录编辑过的文件。
- **`/code-review`** slash command — commit 前并行运行 3 个 reviewer。

### 2. 技术不变量 — MISSION.md

骨架附带 §1-§7 部分(安全、幂等性、RBAC、迁移、质量、流程)。用户在 scaffold 时通过访谈填写 TODO。插件自动填充(例如 `plugin-supabase` 用 RLS 规则填充 §1)。

### 3. 操作原则 — `Docs/produto/PRODUTO.md §Princípios operacionais`

3-7 条与 MISSION 不同的可执行原则。每条必须 (a) 在代码审查中可执行,(b) 与 MISSION 不同(有权衡,可在合理理由下打破),(c) 简短。

示例(模板中已注释 — 替换为你自己的):"人在掌控" · "默认可引用" · "失败要发声" · "LGPD-first" · "成本可预测"。

### 4. 契约不变量 — `Docs/SPEC.md`(Spec-Driven Development)

组件之间契约的形式化规范 — `Input → Output → Acceptance → Status`。状态生命周期 `[STUB]` / `[DRAFT]` / `[STABLE]`。破坏 `[STABLE]` 需要 ADR + 迁移计划。

`code-reviewer` agent 在公共表面变更未更新 SPEC 时标记 **MEDIUM**;在没有 ADR 的情况下破坏 `[STABLE]` 时标记 **HIGH**。方法在 [`core/Docs/sdd-guide.md.eta`](core/Docs/sdd-guide.md.eta) 中。

### 5. 体验不变量 — `Docs/produto/principios-de-experiencia.md`

核心 IP。两种策略共存:

- **策略 A(默认 literal)。** 附带 GoParty 的 4 个锚定感觉(Confiança, Alívio, Clareza, Comemoração) + 5 条操作准则 — 原文,带注释标记 GoParty 特定内容以便覆盖。
- **策略 C(opt-in framework)。** 附带空但有类型的 scaffold + manifest.yaml — 定义你自己的 N 个感觉、M 条准则;skill `experience-principles` 动态读取。

Skill `experience-principles` 是**内容无关**的 — 它读取你项目文件中的内容。无 GoParty 知识硬编码。

## CLI 命令

```bash
# Bootstrap 新项目
npx create-arthus-harness my-project [--preset=goparty-like|web-supabase|minimal] [--principles=A|C|both]

# 在从 arthus-harness bootstrap 的现有项目中:
arthus-harness sync                 # 更新模板到最新版本,冲突时 .rej
arthus-harness sync --interactive   # 每个冲突提示
arthus-harness sync --strict        # 任何冲突都失败(用于 CI)
arthus-harness doctor               # 检查项目与当前 arthus 版本之间的漂移
arthus-harness add-plugin <name>    # 向现有项目添加插件
```

## 插件(opt-in)

| 插件 | 包含什么 |
|---|---|
| `design-system-pipeline` | `DESIGN.md → src/index.css` 流水线 + `design:check` 验证器 + `/design-check` slash command + `design-quality-check.cjs` hook |
| `supabase` | `database-reviewer` agent + `supabase-rls-pattern` 和 `supabase-migration` skills + edge-function 模板 |
| `e2e-playwright` | `storageState` 模式 + persona fixtures + `AxeBuilder` helper + Playwright 配置 |
| `i18n` | JSON tree 验证器 + `i18n-source-of-truth` skill + locale 模板 |
| `payment-asaas` | Asaas webhook HMAC + 幂等中间件 + `asaas-integration` skill |
| `journey-mapping` | `Docs/produto/jornadas/` + `journey-touch-reminder` hook |
| `mcp-code-review-graph` | code-review-graph MCP server(Tree-sitter 知识图谱)+ 4 个 helper skill + 2 个 settingsHooks。需要 `uv` + `uv tool install code-review-graph`。 |

## 分发

- **主要:** npm 包 `create-arthus-harness`(开箱即用 `npx`)。
- **源代码:** `github.com/cristianorj22/arthus-harness` — 公开,tags = npm 版本,通过 GH Actions 自动发布 release。

## 版本管理

- Generator-style,带快照锁文件(`.arthus-harness/lock.json`)+ `baseline/` 目录。
- `arthus-harness sync` 使用你保存的答案重新渲染模板,在用户修改的文件上通过 `node-diff3` 应用**真正的 3-way merge**。默认非阻塞(冲突时写 `.rej`);可选交互式。
- SemVer:major bump 表示破坏性模板变更;minor 添加插件/agent。

## 文档

- [PLAN.md](PLAN.md) — master plan(架构 + roadmap)
- [DECISIONS.md](DECISIONS.md) — 13 个架构决策及理由
- [PROVENANCE.md](PROVENANCE.md) — 来自 `go-party-venue-hub` 的内容(纪律 vs 灰尘)
- [RESOLVED-QUESTIONS.md](RESOLVED-QUESTIONS.md) — 已解决的 5 个关键决策
- [CHANGELOG.md](CHANGELOG.md) — 版本历史
- [docs/plugin-authoring.md](docs/plugin-authoring.md) — 如何编写插件
- [docs/upgrade-guide.md](docs/upgrade-guide.md) — `arthus-harness sync` 深入解析
- [docs/architecture.md](docs/architecture.md) — 文件夹结构 + 插件契约

## Yak-shaving 警告

> 如果你花了 > 2 小时调整 arthus-harness 而不是真正的项目,**停止**。

Harness 是手段,不是目的。在 source repo 开 issue 然后继续。`init-project` skill 设计为强制下一个 prompt 是关于**产品**,而不是 harness。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cristianorj22/arthus-harness&type=Date)](https://star-history.com/#cristianorj22/arthus-harness&Date)

## 许可证

MIT © 2026 Cristiano Moraes

---

> **🌐 翻译说明:** 此翻译由 Claude Opus 4.7 生成。母语者欢迎通过 PR 改进。英文版本(`README.md`)是事实来源。
