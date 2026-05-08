<p align="center">
  <img src="assets/logo.png" width="240" alt="arthus-harness 吉祥物 — 戴著攀岩安全帶的水豚" />
</p>

# arthus-harness

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <strong>繁體中文</strong> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.tr.md">Türkçe</a>
</p>

> **你花了幾個月在上一個專案調優的紀律,在下一個專案裡 30 秒安裝好。**

[![npm version](https://img.shields.io/npm/v/create-arthus-harness.svg)](https://www.npmjs.com/package/create-arthus-harness)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`arthus-harness` 是一個 Claude Code 腳手架,透過 **5 層保護**(agents、skills、hooks、slash commands、文件範本、操作原則、情感不變量)預安裝來引導新專案。它不是 stack 樣板,不是 SaaS 起步套件。它是你**操作 Claude Code 的方式**,打包成一個 `npx` 命令 — 執行一次,讓專案準備好以紀律工作,然後消失。你從下一個專案的**上方**開始,而不是從零開始。

## 快速開始

```bash
npx create-arthus-harness my-project
cd my-project
```

你會看到:

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

## 為什麼存在這個

你花了三個月在一個專案上調優 Claude Code。寫了一個 agent 捕捉靜默 bug。配置了一個 hook 阻止 Claude 透過修改 `tsconfig` 來讓 lint 通過。記錄了 reviewer 學會應用的 UX 規則。建立了一個 slash command 在每次 commit 前並行執行 3 個 reviewer。執行得很漂亮。你知道每個部分做什麼以及為什麼在那裡。

然後你打開一個新專案。

Claude Code 又回到了出廠狀態。沒有 agents。沒有 hooks。沒有那個讓你避免 4 次犯同樣 RLS 錯誤的 `MISSION.md`。沒有那個讓每個錯誤訊息都說出下一步,而不是責怪使用者的原則檔。你看,嘆氣,開始手動從舊專案複製 `.claude/` — 知道一半的內容是特定於那個領域的,會污染新專案,另一半是通用的,但你沒有精力去分離。

這就是問題。Claude Code 讓你**快速建立專案**,但紀律不會跟著你。每個新專案都退回到世界的平均水準。你在每個專案中變得更好的複利效應不會發生 — 或者它發生在**單個專案內**,在它結束時死去。

`arthus-harness` 提取了這種通用部分(**形式**:agents、hooks、skills、範本),並將特定於領域的部分留作 opt-in(透過外掛的**內容**)。你執行 `npx create-arthus-harness` 一次,回答 3 個問題,新專案就誕生了 9 個 agents、4 個 skills、3 個 hooks、5 個 slash commands 和已安裝的 5 層文件堆疊。這不是固定範本:它有 lockfile、baseline、真正的 3-way merge — 當 harness 進化時,你拉取改進而不會遺失你的工作。

洞察很簡單:每個新專案都應該從前一個結束的**上方**開始。不是慌亂地複製檔案。不是重新學習相同的教訓。紀律是唯一會複利的東西 — 而它只有在你將它打包到一個跟你走的地方時才會複利。

## 解決的問題

### 🔥 每個新專案重複設定

> **聽起來很熟悉?**
>
> "我開始一個新專案,花了 4 小時手動從舊專案複製 `.claude/agents/`,逐個檔案決定什麼是通用的,什麼是特定於那個領域的。當我完成時,我已經沒有精力開始實際功能了。"

**`arthus-harness` 如何解決:** `npx create-arthus-harness my-project` + 3 個問題。30 秒後你有 9 個 agents、4 個 skills、3 個 hooks、5 個 slash commands 安裝好 — 只有通用的。特定於領域的內容透過外掛 opt-in。

### 🔥 Agent 透過放鬆設定靜默錯誤

> **聽起來很熟悉?**
>
> "Claude 正在掙扎讓 build 通過。當我審查 diff 時,我注意到它進入了 `tsconfig.json` 並關閉了 `strictNullChecks`。Build 通過了,是的。還有 200 個靜默的錯誤。我在 2 週後在生產環境中發現了它們。"

**`arthus-harness` 如何解決:** `config-protection.cjs` hook 是 PreToolUse 和**阻塞的** — 任何對 `tsconfig`、`eslint`、`package.json`、`MISSION.md`、migrations 的 Edit/Write 都會被中斷,需要明確的授權請求。Claude 無法透過放鬆設定來靜默錯誤而不被你看到。

### 🔥 工作階段之間沒有 memory

> **聽起來很熟悉?**
>
> "每個新工作階段我都會浪費 10 分鐘向 Claude 解釋當前狀態:我在哪個 feature 上,我們週五決定了什麼,我們為什麼沒用明顯的方法。每週三個工作階段,這就是浪費了半小時 — 而 Claude 仍然走上了我們已經放棄的路徑。"

**`arthus-harness` 如何解決:** `post-edit-accumulator` hook 在每個工作階段中將編輯過的檔案記錄到 auto-memory。Slash command `/save-session` 儲存狀態快照(分支、最後 commit、決策、下一步),在下一個工作階段開始時讀取。文件範本(ADR、RUNBOOK、SPEC)給架構決策一個不只活在你腦子裡的地方。

### 🔥 沒有一致 checklist 的 PR

> **聽起來很熟悉?**
>
> "今天我在 merge 之前 review 了我的 PR,抓到了 3 個東西。上週我 review 了一個相同大小的 PR,什麼都沒看到就 merge 了。不是惡意 — 標準隨我的心情而變。你不能信任依賴於我休息得有多好的 review。"

**`arthus-harness` 如何解決:** `/code-review` slash command 並行呼叫多個 reviewer(`code-reviewer`、`silent-failure-hunter`、`security-reviewer`、`typescript-reviewer`、`a11y-architect`)— 每個都有自己的 checklist。不依賴於你的心情。Reviewer 在每個專案的 memory 中累積模式,每個 PR 都變得更敏銳。

### 🔥 在每個專案重複的 UX 錯誤

> **聽起來很熟悉?**
>
> "我又一次讓一個錯誤訊息通過了'出錯了。請重試。' — 沒有說出錯了什麼,沒有說下一步,沒有說是使用者的還是系統的錯。今年第四次,我只在最終 review 中記得這一點,所有東西都已經在生產環境中。"

**`arthus-harness` 如何解決:** 第 5 層 — `principios-de-experiencia.md` 出貨時帶有 4 個錨定感受 + 5 個操作規則。`experience-principles` skill 是內容無關的,在 UI/copy 檔案上自動觸發。你定義你的規則;skill 確保它們被應用。

### 🔥 遺失的架構決策

> **聽起來很熟悉?**
>
> "三個月後,有人在 PR 中問:'你們為什麼不用 X?'。沒人記得。我當時記得,在腦子裡寫下,以為很明顯。我沒有記錄因為我在慣性中。現在我們要再討論一次。"

**`arthus-harness` 如何解決:** `ADR.md` 範本預設出貨。第 4 層(Spec-Driven Development)使 `Docs/SPEC.md` 成為元件契約的正式位置。當有人在沒有 ADR 的情況下打破 `[STABLE]` 時,`code-reviewer` 標記為 HIGH。

### 🔥 程式碼和文件之間的漂移

> **聽起來很熟悉?**
>
> "我重構了支付模組,忘了更新 `Docs/arquitetura/`。六週後一個新 dev 加入,讀了文件,跟著它走,然後在變化的程式碼中迷失。我成了入職瓶頸而沒意識到。"

**`arthus-harness` 如何解決:** 第 4 層(SPEC)+ `code-reviewer` agent 在 public surface 變更未更新 SPEC 時標記 **MEDIUM**。`spec-keeper` skill 保持 `Docs/SPEC.md` 活躍,並對每個契約要求狀態(`[STUB]` / `[DRAFT]` / `[STABLE]`)。過時的文件不能通過 review — 成為 commit 邊界,而不是 memory leak。

## 這給你打開了什麼

### 📈 專案之間的複利

**之前:** 專案 A 中學到的教訓死在那裡。
**現在:** 它們成為 harness 的改進。`arthus-harness sync` 將更新拉到活動專案中而不遺失你的工作。每個新專案都從前一個**上方**開始。

### 📈 多專案而無紀律退化

**之前:** 3 個並行專案 = 3 個不同的紀律級別。
**現在:** 所有專案都以相同的文件堆疊、相同的阻塞 hook、相同的 reviewer 出生。Solo dev 可以擴展到 N 個專案,而無"退化稅"。

### 📈 無重型工具的 Spec-Driven Development

**之前:** SDD 看起來像有 OpenAPI generators、Stoplight、專門 QA 團隊的企業大事。
**現在:** `Docs/SPEC.md` 是帶有 `Input → Output → Acceptance → Status` 表的 Markdown。3 級狀態生命週期。SDD 終於適合 solo 專案。

### 📈 契約作為護欄,而不是儀式

**之前:** "讓我們正式化契約"成了一個會議 + 沒人讀的 Notion 文件。
**現在:** 契約和程式碼一起存在,在同一個 PR 中。打破 `[STABLE]` 需要 ADR。打破 `[DRAFT]` 是免費的。形式與成熟度成比例。

### 📈 Opt-in 外掛而不是膨脹的 starter kit

**之前:** SaaS 範本帶著所有東西出貨,即使你只會用一半。
**現在:** core 出貨 9 個通用 agents。7 個外掛 opt-in。精簡的足跡,Claude 的清潔上下文。

### 📈 沒有 UX 團隊的一致 UX

**之前:** 基本 UX 規則只活在你的腦子裡。
**現在:** 第 5 層透過自動觸發的 skill 將你的規則轉化為自動 code review。沒有 UX 團隊的 UX 團隊品質。

## 這是為誰的

### ✅ 如果你...,使用 `arthus-harness`

- 已經操作過 Claude Code 足夠多,對預設設定缺少什麼有自己的看法 — 自己的 agents、阻塞 hooks、帶 `paths:` scoping 的 skills、自訂 slash commands。
- 是 solo dev 或小團隊(≤5 人),沒有單獨的 QA / UX / DevOps,因此希望這些紀律作為程式碼安裝在專案中。
- 同時處理多個專案,厭倦了每個專案都退化到平均水準。
- 相信技術紀律和對 UX/UI 的關心是不同類型的不變量 — 並希望尊重這種區分的工具(單獨的層、單獨的嚴重性)。
- 希望架構決策成為 ADR,契約成為 SPEC,原則成為自動 reviewer。

### ❌ 如果你...,不要使用

- 尋找帶 auth + landing + dashboard 準備好的 React/Next/Vite 範本。`arthus-harness` 是 stack 無關的 — 你帶 stack。
- 想要"開始 vibing 與 Claude Code"而尚未努力理解什麼是 agent、hook、skill、slash command。Harness 對第 1 天的人來說是開銷;先在 Claude Code 中變得高效,然後再來打包你的紀律。
- 在大團隊工作,有專門的 QA/SRE/DevRel — 這些人外部已經提供了 harness 作為程式碼封裝的內容。
- 不能容忍最低的儀式。5 層需要保持 `MISSION` / `SPEC` / 原則更新的習慣。如果你想要"merge 任何東西的 0 摩擦",harness 會困擾你 — 故意如此。

## 5 層保護

| # | 層 | 文件 | 違反的嚴重性 |
|---|---|---|---|
| 1 | **流程** | hooks `.cjs` + slash commands | 阻塞(exit 2) |
| 2 | **技術**(不可協商) | `MISSION.md` | 事故級(輪換 keys、事後剖析) |
| 3 | **操作原則** | `PRODUTO.md §Princípios` | 討論(在 PR 中引用) |
| 4 | **契約(SDD)** | `SPEC.md` + `sdd-guide.md` | Review(PR 被拒絕) |
| 5 | **情感** | `principios-de-experiencia.md` | Skill 在 UI/copy 上自動觸發 |

每層有不同的嚴重性和頻率 — 不要合併。詳情見 [`docs/architecture.md`](docs/architecture.md)。

## CLI 命令

```bash
# Bootstrap 新專案
npx create-arthus-harness my-project
# → 30 秒,3 個問題,專案準備好以紀律使用 Claude Code

# 當 harness 進化時更新現有專案
arthus-harness sync
# → 3-way merge:未觸及的檔案自動更新;已修改的獲得 .rej

# 診斷漂移
arthus-harness doctor
# → 報告當前與已安裝版本 + 外掛 + missing 檔案

# 向現有專案新增外掛
arthus-harness add-plugin supabase
# → 外掛貢獻 merged 到 .claude/ + package.json + .env.example
```

## 外掛(opt-in)

| 外掛 | 包含什麼 |
|---|---|
| `design-system-pipeline` | `DESIGN.md → src/index.css` pipeline + `design:check` 驗證器 + `/design-check` slash command + `design-quality-check.cjs` hook |
| `supabase` | `database-reviewer` agent + `supabase-rls-pattern` 和 `supabase-migration` skills + edge-function 範本 |
| `e2e-playwright` | `storageState` 模式 + persona fixtures + `AxeBuilder` helper + Playwright 設定 |
| `i18n` | JSON tree 驗證器 + `i18n-source-of-truth` skill + locale 範本 |
| `payment-asaas` | Asaas webhook HMAC + 冪等 middleware + `asaas-integration` skill |
| `journey-mapping` | `Docs/produto/jornadas/` + `journey-touch-reminder` hook |
| `mcp-code-review-graph` | code-review-graph MCP server(Tree-sitter 知識圖譜)+ 4 個 helper skill + 2 個 settingsHooks。需要 `uv` + `uv tool install code-review-graph`。 |

## 比較

| | `arthus-harness` | `create-t3-app` | `cookiecutter` | 手動 `cp -r` |
|---|---|---|---|---|
| Scaffold `.claude/` | ✅ | ❌ | ❌ | ✅ (manual) |
| Scaffold 產品程式碼 | ❌ | ✅ | ✅ | ✅ |
| 可更新(`sync`)帶 3-way merge | ✅ | ❌ | ❌ | ❌ |
| Opt-in 外掛 | ✅ | ⚠️ via opts | ⚠️ via hooks | ❌ |
| Stack-agnostic | ✅ | ❌ (Next-only) | ✅ | ✅ |
| 5 層文件堆疊 | ✅ | ❌ | ❌ | ❌ |

## 站在巨人的肩膀上

- [`create-t3-app`](https://create.t3.gg) — CLI scaffolder 模式 + opinionated 哲學
- [`cookiecutter`](https://cookiecutter.readthedocs.io) — 範本生命週期 + hook 系統靈感
- [Anthropic Skills](https://github.com/anthropics/skills) — skill 格式規範
- [`PRPs-agentic-eng`](https://github.com/Wirasm/PRPs-agentic-eng) by Wirasm — 適配的 slash command 模式(`/code-review`、`/plan`、`/feature-dev`)
- [`everything-claude-code`](https://github.com/affaan-m/everything-claude-code) — 多語言 README 模式
- 6 個月運行真正的生產 marketplace — agents/skills/hooks 在成為 harness 之前經過實戰考驗

## 文件

- [PLAN.md](PLAN.md) — master plan(架構 + roadmap)
- [DECISIONS.md](DECISIONS.md) — 13 個架構決策及理由
- [PROVENANCE.md](PROVENANCE.md) — 紀律 vs 塵埃稽核
- [CHANGELOG.md](CHANGELOG.md) — 版本歷史
- [docs/plugin-authoring.md](docs/plugin-authoring.md) — 如何撰寫外掛
- [docs/upgrade-guide.md](docs/upgrade-guide.md) — `arthus-harness sync` 深入解析
- [docs/architecture.md](docs/architecture.md) — 資料夾結構 + 外掛契約

## Yak-shaving 警告

> 如果你花了 > 2 小時調整 arthus-harness 而不是真正的專案,**停止**。

Harness 是手段,不是目的。開 issue 然後繼續。`init-project` skill 設計為強制下一個 prompt 是關於**產品**,而不是 harness。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cristianorj22/arthus-harness&type=Date)](https://star-history.com/#cristianorj22/arthus-harness&Date)

## 授權

MIT © 2026 Cristiano Moraes

---

> **🌐 翻譯說明:** 此翻譯由 Claude Opus 4.7 生成。母語者歡迎透過 PR 改進。英文版本(`README.md`)是事實來源。
