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

> **你花了几个月在上一个项目调优的纪律,在下一个项目里 30 秒安装好。**

[![npm version](https://img.shields.io/npm/v/create-arthus-harness.svg)](https://www.npmjs.com/package/create-arthus-harness)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`arthus-harness` 是一个 Claude Code 脚手架,通过 **5 层保护**(agents、skills、hooks、slash commands、文档模板、操作原则、情感不变量)预安装来引导新项目。它不是 stack 样板,不是 SaaS 起步套件。它是你**操作 Claude Code 的方式**,打包成一个 `npx` 命令 — 运行一次,让项目准备好以纪律工作,然后消失。你从下一个项目的**上方**开始,而不是从零开始。

## 快速开始

```bash
npx create-arthus-harness my-project
cd my-project
```

你会看到:

```
✔ Project name: my-project
✔ Preset: minimal
✔ Principles strategy: A (literal default)
✔ Init git? Yes

Created my-project/
  → 9 agents, 4 skills, 3 hooks, 5 slash commands
  → MISSION.md, SPEC.md, principios-de-experiencia.md ready
  → .git initialized

cd my-project && claude
```

## 为什么存在这个

你花了三个月在一个项目上调优 Claude Code。写了一个 agent 捕获静默 bug。配置了一个 hook 阻止 Claude 通过修改 `tsconfig` 来让 lint 通过。记录了 reviewer 学会应用的 UX 规则。创建了一个 slash command 在每次 commit 前并行运行 3 个 reviewer。运行得很漂亮。你知道每个部分做什么以及为什么在那里。

然后你打开一个新项目。

Claude Code 又回到了出厂状态。没有 agents。没有 hooks。没有那个让你避免 4 次犯同样 RLS 错误的 `MISSION.md`。没有那个让每个错误消息都说出下一步,而不是责怪用户的原则文件。你看,叹气,开始手动从旧项目复制 `.claude/` — 知道一半的内容是特定于那个领域的,会污染新项目,另一半是通用的,但你没有精力去分离。

这就是问题。Claude Code 让你**快速创建项目**,但纪律不会跟着你。每个新项目都退回到世界的平均水平。你在每个项目中变得更好的复利效应不会发生 — 或者它发生在**单个项目内**,在它结束时死去。

`arthus-harness` 提取了这种通用部分(**形式**:agents、hooks、skills、模板),并将特定于领域的部分留作 opt-in(通过插件的**内容**)。你运行 `npx create-arthus-harness` 一次,回答 3 个问题,新项目就诞生了 9 个 agents、4 个 skills、3 个 hooks、5 个 slash commands 和已安装的 5 层文档栈。这不是固定模板:它有 lockfile、baseline、真正的 3-way merge — 当 harness 进化时,你拉取改进而不会丢失你的工作。

洞察很简单:每个新项目都应该从前一个结束的**上方**开始。不是慌乱地复制文件。不是重新学习相同的教训。纪律是唯一会复利的东西 — 而它只有在你将它打包到一个跟你走的地方时才会复利。

## 解决的问题

### 🔥 每个新项目重复设置

> **听起来很熟悉?**
>
> "我开始一个新项目,花了 4 个小时手动从旧项目复制 `.claude/agents/`,逐个文件决定什么是通用的,什么是特定于那个领域的。当我完成时,我已经没有精力开始实际功能了。"

**`arthus-harness` 如何解决:** `npx create-arthus-harness my-project` + 3 个问题。30 秒后你有 9 个 agents、4 个 skills、3 个 hooks、5 个 slash commands 安装好 — 只有通用的。特定于领域的内容通过插件 opt-in。

### 🔥 Agent 通过放松配置静默错误

> **听起来很熟悉?**
>
> "Claude 正在挣扎让 build 通过。当我审查 diff 时,我注意到它进入了 `tsconfig.json` 并关闭了 `strictNullChecks`。Build 通过了,是的。还有 200 个静默的错误。我在 2 周后在生产环境中发现了它们。"

**`arthus-harness` 如何解决:** `config-protection.cjs` hook 是 PreToolUse 和**阻塞的** — 任何对 `tsconfig`、`eslint`、`package.json`、`MISSION.md`、migrations 的 Edit/Write 都会被中断,需要明确的授权请求。Claude 无法通过放松配置来静默错误而不被你看到。

### 🔥 会话之间没有 memory

> **听起来很熟悉?**
>
> "每个新会话我都会浪费 10 分钟向 Claude 解释当前状态:我在哪个 feature 上,我们周五决定了什么,我们为什么没用明显的方法。每周三个会话,这就是浪费了半小时 — 而 Claude 仍然走上了我们已经放弃的路径。"

**`arthus-harness` 如何解决:** `post-edit-accumulator` hook 在每个会话中将编辑过的文件记录到 auto-memory。Slash command `/save-session` 保存状态快照(分支、最后 commit、决策、下一步),在下一个会话开始时读取。文档模板(ADR、RUNBOOK、SPEC)给架构决策一个不只活在你脑子里的地方。

### 🔥 没有一致 checklist 的 PR

> **听起来很熟悉?**
>
> "今天我在 merge 之前 review 了我的 PR,抓到了 3 个东西。上周我 review 了一个相同大小的 PR,什么都没看到就 merge 了。不是恶意 — 标准随我的心情而变。你不能信任依赖于我休息得有多好的 review。"

**`arthus-harness` 如何解决:** `/code-review` slash command 并行调用多个 reviewer(`code-reviewer`、`silent-failure-hunter`、`security-reviewer`、`typescript-reviewer`、`a11y-architect`)— 每个都有自己的 checklist。不依赖于你的心情。Reviewer 在每个项目的 memory 中累积模式,每个 PR 都变得更敏锐。

### 🔥 在每个项目重复的 UX 错误

> **听起来很熟悉?**
>
> "我又一次让一个错误消息通过了'出错了。请重试。' — 没有说出错了什么,没有说下一步,没有说是用户的还是系统的错。今年第四次,我只在最终 review 中记得这一点,所有东西都已经在生产环境中。"

**`arthus-harness` 如何解决:** 第 5 层 — `principios-de-experiencia.md` 出货时带有 4 个锚定感觉 + 5 个操作规则。`experience-principles` skill 是内容无关的,在 UI/copy 文件上自动触发。你定义你的规则;skill 确保它们被应用。

### 🔥 丢失的架构决策

> **听起来很熟悉?**
>
> "三个月后,有人在 PR 中问:'你们为什么不用 X?'。没人记得。我当时记得,在脑子里写下,以为很明显。我没有记录因为我在惯性中。现在我们要再讨论一次。"

**`arthus-harness` 如何解决:** `ADR.md` 模板默认出货。第 4 层(Spec-Driven Development)使 `Docs/SPEC.md` 成为组件契约的正式位置。当有人在没有 ADR 的情况下打破 `[STABLE]` 时,`code-reviewer` 标记为 HIGH。

### 🔥 代码和文档之间的漂移

> **听起来很熟悉?**
>
> "我重构了支付模块,忘了更新 `Docs/arquitetura/`。六周后一个新 dev 加入,读了文档,跟着它走,然后在变化的代码中迷失。我成了入职瓶颈而没意识到。"

**`arthus-harness` 如何解决:** 第 4 层(SPEC)+ `code-reviewer` agent 在 public surface 变更未更新 SPEC 时标记 **MEDIUM**。`spec-keeper` skill 保持 `Docs/SPEC.md` 活跃,并对每个契约要求状态(`[STUB]` / `[DRAFT]` / `[STABLE]`)。过时的文档不能通过 review — 成为 commit 边界,而不是 memory leak。

## 这给你打开了什么

### 📈 项目之间的复利

**之前:** 项目 A 中学到的教训死在那里。
**现在:** 它们成为 harness 的改进。`arthus-harness sync` 将更新拉到活动项目中而不丢失你的工作。每个新项目都从前一个**上方**开始。

### 📈 多项目而无纪律退化

**之前:** 3 个并行项目 = 3 个不同的纪律级别。
**现在:** 所有项目都以相同的文档栈、相同的阻塞 hook、相同的 reviewer 出生。Solo dev 可以扩展到 N 个项目,而无"退化税"。

### 📈 无重型工具的 Spec-Driven Development

**之前:** SDD 看起来像有 OpenAPI generators、Stoplight、专门 QA 团队的企业大事。
**现在:** `Docs/SPEC.md` 是带有 `Input → Output → Acceptance → Status` 表的 Markdown。3 级状态生命周期。SDD 终于适合 solo 项目。

### 📈 契约作为护栏,而不是仪式

**之前:** "让我们正式化契约"成了一个会议 + 没人读的 Notion 文档。
**现在:** 契约和代码一起存在,在同一个 PR 中。打破 `[STABLE]` 需要 ADR。打破 `[DRAFT]` 是免费的。形式与成熟度成比例。

### 📈 Opt-in 插件而不是膨胀的 starter kit

**之前:** SaaS 模板带着所有东西出货,即使你只会用一半。
**现在:** core 出货 9 个通用 agents。7 个插件 opt-in。精简的足迹,Claude 的清洁上下文。

### 📈 没有 UX 团队的一致 UX

**之前:** 基本 UX 规则只活在你的脑子里。
**现在:** 第 5 层通过自动触发的 skill 将你的规则转化为自动 code review。没有 UX 团队的 UX 团队质量。

## 这是为谁的

### ✅ 如果你...,使用 `arthus-harness`

- 已经操作过 Claude Code 足够多,对默认设置缺少什么有自己的看法 — 自己的 agents、阻塞 hooks、带 `paths:` scoping 的 skills、自定义 slash commands。
- 是 solo dev 或小团队(≤5 人),没有单独的 QA / UX / DevOps,因此希望这些纪律作为代码安装在项目中。
- 同时处理多个项目,厌倦了每个项目都退化到平均水平。
- 相信技术纪律和对 UX/UI 的关心是不同类型的不变量 — 并希望尊重这种区分的工具(单独的层、单独的严重性)。
- 希望架构决策成为 ADR,契约成为 SPEC,原则成为自动 reviewer。

### ❌ 如果你...,不要使用

- 寻找带 auth + 着陆页 + dashboard 准备好的 React/Next/Vite 模板。`arthus-harness` 是 stack 无关的 — 你带 stack。
- 想要"开始 vibing 与 Claude Code"而尚未努力理解什么是 agent、hook、skill、slash command。Harness 对第 1 天的人来说是开销;先在 Claude Code 中变得高效,然后再来打包你的纪律。
- 在大团队工作,有专门的 QA/SRE/DevRel — 这些人外部已经提供了 harness 作为代码封装的内容。
- 不能容忍最低的仪式。5 层需要保持 `MISSION` / `SPEC` / 原则更新的习惯。如果你想要"merge 任何东西的 0 摩擦",harness 会困扰你 — 故意如此。

## 5 层保护

| # | 层 | 文档 | 违反的严重性 |
|---|---|---|---|
| 1 | **流程** | hooks `.cjs` + slash commands | 阻塞(exit 2) |
| 2 | **技术**(不可协商) | `MISSION.md` | 事故级(轮换 keys、事后剖析) |
| 3 | **操作原则** | `PRODUTO.md §Princípios` | 讨论(在 PR 中引用) |
| 4 | **契约(SDD)** | `SPEC.md` + `sdd-guide.md` | Review(PR 被拒绝) |
| 5 | **情感** | `principios-de-experiencia.md` | Skill 在 UI/copy 上自动触发 |

每层有不同的严重性和频率 — 不要合并。详情见 [`docs/architecture.md`](docs/architecture.md)。

## CLI 命令

```bash
# Bootstrap 新项目
npx create-arthus-harness my-project
# → 30 秒,3 个问题,项目准备好以纪律使用 Claude Code

# 当 harness 进化时更新现有项目
arthus-harness sync
# → 3-way merge:未触及的文件自动更新;已修改的获得 .rej

# 诊断漂移
arthus-harness doctor
# → 报告当前与已安装版本 + 插件 + missing 文件

# 向现有项目添加插件
arthus-harness add-plugin supabase
# → 插件贡献 merged 到 .claude/ + package.json + .env.example
```

## 插件(opt-in)

| 插件 | 包含什么 |
|---|---|
| `design-system-pipeline` | `DESIGN.md → src/index.css` 流水线 + `design:check` 验证器 + `/design-check` slash command + `design-quality-check.cjs` hook |
| `supabase` | `database-reviewer` agent + `supabase-rls-pattern` 和 `supabase-migration` skills + edge-function 模板 |
| `e2e-playwright` | `storageState` 模式 + persona fixtures + `AxeBuilder` helper + Playwright 配置 |
| `i18n` | JSON tree 验证器 + `i18n-source-of-truth` skill + locale 模板 |
| `payment-asaas` | Asaas webhook HMAC + 幂等 middleware + `asaas-integration` skill |
| `journey-mapping` | `Docs/produto/jornadas/` + `journey-touch-reminder` hook |
| `mcp-code-review-graph` | code-review-graph MCP server(Tree-sitter 知识图谱)+ 4 个 helper skill + 2 个 settingsHooks。需要 `uv` + `uv tool install code-review-graph`。 |

## 比较

| | `arthus-harness` | `create-t3-app` | `cookiecutter` | 手动 `cp -r` |
|---|---|---|---|---|
| Scaffold `.claude/` | ✅ | ❌ | ❌ | ✅ (manual) |
| Scaffold 产品代码 | ❌ | ✅ | ✅ | ✅ |
| 可更新(`sync`)带 3-way merge | ✅ | ❌ | ❌ | ❌ |
| Opt-in 插件 | ✅ | ⚠️ via opts | ⚠️ via hooks | ❌ |
| Stack-agnostic | ✅ | ❌ (Next-only) | ✅ | ✅ |
| 5 层文档栈 | ✅ | ❌ | ❌ | ❌ |

## 站在巨人的肩膀上

- [`create-t3-app`](https://create.t3.gg) — CLI scaffolder 模式 + opinionated 哲学
- [`cookiecutter`](https://cookiecutter.readthedocs.io) — 模板生命周期 + hook 系统灵感
- [Anthropic Skills](https://github.com/anthropics/skills) — skill 格式规范
- [`PRPs-agentic-eng`](https://github.com/Wirasm/PRPs-agentic-eng) by Wirasm — 适配的 slash command 模式(`/code-review`、`/plan`、`/feature-dev`)
- [`everything-claude-code`](https://github.com/affaan-m/everything-claude-code) — 多语言 README 模式
- 6 个月运行真正的生产 marketplace — agents/skills/hooks 在成为 harness 之前经过实战考验

## 文档

- [PLAN.md](PLAN.md) — master plan(架构 + roadmap)
- [DECISIONS.md](DECISIONS.md) — 13 个架构决策及理由
- [PROVENANCE.md](PROVENANCE.md) — 纪律 vs 灰尘审计
- [CHANGELOG.md](CHANGELOG.md) — 版本历史
- [docs/plugin-authoring.md](docs/plugin-authoring.md) — 如何编写插件
- [docs/upgrade-guide.md](docs/upgrade-guide.md) — `arthus-harness sync` 深入解析
- [docs/architecture.md](docs/architecture.md) — 文件夹结构 + 插件契约

## Yak-shaving 警告

> 如果你花了 > 2 小时调整 arthus-harness 而不是真正的项目,**停止**。

Harness 是手段,不是目的。开 issue 然后继续。`init-project` skill 设计为强制下一个 prompt 是关于**产品**,而不是 harness。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cristianorj22/arthus-harness&type=Date)](https://star-history.com/#cristianorj22/arthus-harness&Date)

## 许可证

MIT © 2026 Cristiano Moraes

---

> **🌐 翻译说明:** 此翻译由 Claude Opus 4.7 生成。母语者欢迎通过 PR 改进。英文版本(`README.md`)是事实来源。
