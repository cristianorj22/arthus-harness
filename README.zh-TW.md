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

> 通用的 Claude Code harness 工程套件。透過 **5 層保護**(流程 · 技術不變量 · 操作原則 · 透過 SDD 的契約不變量 · 體驗不變量)引導新專案 — 從 `go-party-venue-hub` 中提取。

[![npm version](https://img.shields.io/npm/v/create-arthus-harness.svg)](https://www.npmjs.com/package/create-arthus-harness)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 快速開始

```bash
npx create-arthus-harness my-project
cd my-project
```

精靈會問 **3 個問題**(預設 · 原則 · git-init)並生成一個專案,包含:

- 9 個專業 agent(`code-reviewer`, `typescript-reviewer`, `silent-failure-hunter`, `security-reviewer`, `a11y-architect`, `refactor-cleaner`, `code-archaeologist`, `debugger`, `product-manager`)
- 4 個 skill(`experience-principles`, `init-project`, `harness-doctor`, `spec-keeper`)
- 3 個 hook(`config-protection`, `post-edit-accumulator`, `batch-format-typecheck`)
- 5 個 slash command(`/plan`, `/feature-dev`, `/code-review`, `/refactor-clean`, `/save-session`)
- 8 個文件範本(ADR, RUNBOOK, SPEC 等)
- **5 層文件堆疊**:`MISSION.md`(技術不變量)· `Docs/SPEC.md`(元件契約,Spec-Driven Development)· `Docs/sdd-guide.md`(SDD 方法)· `Docs/produto/PRODUTO.md`(願景 + 操作原則)· `Docs/produto/principios-de-experiencia.md`(情感不變量)
- 5 個 CI workflow(lint, design-check, type-check, secrets-scan, npm-audit)
- 用於 `arthus-harness sync` 的鎖檔 `.arthus-harness/lock.json` + `baseline/`

## 這是什麼?

Cristiano 花了幾個月在 `go-party-venue-hub` 中構建了一個複雜的 Claude Code harness:17 個專業 agent、12 個 skill、4 個 hook、7 個 slash command、8 個範本、MCP 整合、自動 memory、design-system pipeline。這個 repo 提取了**形式**(通用準則)成為一個可重用套件,同時將**內容**(Asaas, Veriff, Supabase RLS, Confiança/Alívio)留在 opt-in 外掛中。

**Job-To-Be-Done。** 當你開始一個新專案時,你希望你的「產品有感覺」的紀律 + 操作 Claude Code 的習慣已經安裝好了 — 而不必記住你是如何在上一個專案中達到那一點的。

## 這不是什麼

- ❌ React/Next/Vite 樣板(你帶自己的 stack)
- ❌ create-next-app / Yeoman / Cookiecutter(那些產生產品程式碼)
- ❌ SaaS 範本 / starter kit
- ❌ Runtime 依賴(一次性產生器,bootstrap 後零佔用)

## 5 層保護

> **MISSION** = 永不在技術上崩潰 · **SPEC** = 元件之間的契約 · **PRODUTO §Princípios** = 如何權衡決策 · **principios-de-experiencia** = 永不在情感上崩潰。每一層有不同的嚴重性和頻率 — 不要合併。詳情見 [`docs/architecture.md`](docs/architecture.md)。

### 1. 流程層 — hooks + slash commands

每次 commit 都經過:

- **`config-protection.cjs`**(PreToolUse,**阻塞**)— 阻止在沒有使用者明確授權的情況下編輯 `tsconfig`、`eslint`、`package.json`、`MISSION.md` 等。防止 agent 透過放鬆設定來掩蓋錯誤。
- **`batch-format-typecheck.cjs`**(Stop,**lint 阻塞 / tsc 警告**)— 在會話結束時對編輯過的檔案執行 ESLint。lint 錯誤時阻塞 Stop。tsc 僅警告(TS 債務是漸進的)。
- **`post-edit-accumulator.cjs`**(PostToolUse,**警告**)— 自動 memory:在 `~/.claude/projects/<slug>/memory/` 中記錄編輯過的檔案。
- **`/code-review`** slash command — commit 前並行執行 3 個 reviewer。

### 2. 技術不變量 — MISSION.md

骨架附帶 §1-§7 部分(安全、冪等性、RBAC、遷移、品質、流程)。使用者在 scaffold 時透過訪談填寫 TODO。外掛自動填充(例如 `plugin-supabase` 用 RLS 規則填充 §1)。

### 3. 操作原則 — `Docs/produto/PRODUTO.md §Princípios operacionais`

3-7 條與 MISSION 不同的可執行原則。每條必須 (a) 在程式碼審查中可執行,(b) 與 MISSION 不同(有權衡,可在合理理由下打破),(c) 簡短。

範例(範本中已註解 — 替換為你自己的):「人在掌控」 · 「預設可引用」 · 「失敗要發聲」 · 「LGPD-first」 · 「成本可預測」。

### 4. 契約不變量 — `Docs/SPEC.md`(Spec-Driven Development)

元件之間契約的形式化規範 — `Input → Output → Acceptance → Status`。狀態生命週期 `[STUB]` / `[DRAFT]` / `[STABLE]`。破壞 `[STABLE]` 需要 ADR + 遷移計畫。

`code-reviewer` agent 在公共表面變更未更新 SPEC 時標記 **MEDIUM**;在沒有 ADR 的情況下破壞 `[STABLE]` 時標記 **HIGH**。方法在 [`core/Docs/sdd-guide.md.eta`](core/Docs/sdd-guide.md.eta) 中。

### 5. 體驗不變量 — `Docs/produto/principios-de-experiencia.md`

核心 IP。兩種策略共存:

- **策略 A(預設 literal)。** 附帶 GoParty 的 4 個錨定感受(Confiança, Alívio, Clareza, Comemoração) + 5 條操作準則 — 原文,帶註解標記 GoParty 特定內容以便覆蓋。
- **策略 C(opt-in framework)。** 附帶空但有型別的 scaffold + manifest.yaml — 定義你自己的 N 個感受、M 條準則;skill `experience-principles` 動態讀取。

Skill `experience-principles` 是**內容無關**的 — 它讀取你專案檔案中的內容。無 GoParty 知識硬編碼。

## CLI 命令

```bash
# Bootstrap 新專案
npx create-arthus-harness my-project [--preset=goparty-like|web-supabase|minimal] [--principles=A|C|both]

# 在從 arthus-harness bootstrap 的現有專案中:
arthus-harness sync                 # 更新範本到最新版本,衝突時 .rej
arthus-harness sync --interactive   # 每個衝突提示
arthus-harness sync --strict        # 任何衝突都失敗(用於 CI)
arthus-harness doctor               # 檢查專案與當前 arthus 版本之間的漂移
arthus-harness add-plugin <name>    # 向現有專案新增外掛
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

## 發佈

- **主要:** npm 套件 `create-arthus-harness`(開箱即用 `npx`)。
- **原始碼:** `github.com/cristianorj22/arthus-harness` — 公開,tags = npm 版本,透過 GH Actions 自動發佈 release。

## 版本管理

- Generator-style,帶快照鎖檔(`.arthus-harness/lock.json`)+ `baseline/` 目錄。
- `arthus-harness sync` 使用你儲存的答案重新渲染範本,在使用者修改的檔案上透過 `node-diff3` 套用**真正的 3-way merge**。預設非阻塞(衝突時寫 `.rej`);可選互動式。
- SemVer:major bump 表示破壞性範本變更;minor 新增外掛/agent。

## 文件

- [PLAN.md](PLAN.md) — master plan(架構 + roadmap)
- [DECISIONS.md](DECISIONS.md) — 13 個架構決策及理由
- [PROVENANCE.md](PROVENANCE.md) — 來自 `go-party-venue-hub` 的內容(紀律 vs 塵埃)
- [RESOLVED-QUESTIONS.md](RESOLVED-QUESTIONS.md) — 已解決的 5 個關鍵決策
- [CHANGELOG.md](CHANGELOG.md) — 版本歷史
- [docs/plugin-authoring.md](docs/plugin-authoring.md) — 如何撰寫外掛
- [docs/upgrade-guide.md](docs/upgrade-guide.md) — `arthus-harness sync` 深入解析
- [docs/architecture.md](docs/architecture.md) — 資料夾結構 + 外掛契約

## Yak-shaving 警告

> 如果你花了 > 2 小時調整 arthus-harness 而不是真正的專案,**停止**。

Harness 是手段,不是目的。在 source repo 開 issue 然後繼續。`init-project` skill 設計為強制下一個 prompt 是關於**產品**,而不是 harness。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cristianorj22/arthus-harness&type=Date)](https://star-history.com/#cristianorj22/arthus-harness&Date)

## 授權

MIT © 2026 Cristiano Moraes

---

> **🌐 翻譯說明:** 此翻譯由 Claude Opus 4.7 生成。母語者歡迎透過 PR 改進。英文版本(`README.md`)是事實來源。
