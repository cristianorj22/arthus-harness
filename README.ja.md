# arthus-harness

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a> ·
  <strong>日本語</strong> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.tr.md">Türkçe</a>
</p>

> 汎用的な Claude Code harness エンジニアリングキット。**5 層の保護**(プロセス · 技術的不変条件 · 運用原則 · SDD による契約的不変条件 · 体験的不変条件)で新しいプロジェクトをブートストラップ — `go-party-venue-hub` から抽出。

[![npm version](https://img.shields.io/npm/v/create-arthus-harness.svg)](https://www.npmjs.com/package/create-arthus-harness)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## クイックスタート

```bash
npx create-arthus-harness my-project
cd my-project
```

ウィザードが **3 つの質問**(プリセット · 原則 · git-init)をして、以下を含むプロジェクトを生成します:

- 9 つの専門 agent(`code-reviewer`, `typescript-reviewer`, `silent-failure-hunter`, `security-reviewer`, `a11y-architect`, `refactor-cleaner`, `code-archaeologist`, `debugger`, `product-manager`)
- 4 つの skill(`experience-principles`, `init-project`, `harness-doctor`, `spec-keeper`)
- 3 つの hook(`config-protection`, `post-edit-accumulator`, `batch-format-typecheck`)
- 5 つの slash command(`/plan`, `/feature-dev`, `/code-review`, `/refactor-clean`, `/save-session`)
- 8 つのドキュメントテンプレート(ADR, RUNBOOK, SPEC など)
- **5 層のドキュメントスタック**:`MISSION.md`(技術的不変条件)· `Docs/SPEC.md`(コンポーネント契約、Spec-Driven Development)· `Docs/sdd-guide.md`(SDD メソッド)· `Docs/produto/PRODUTO.md`(ビジョン + 運用原則)· `Docs/produto/principios-de-experiencia.md`(体験的不変条件)
- 5 つの CI ジョブワークフロー(lint, design-check, type-check, secrets-scan, npm-audit)
- `arthus-harness sync` 用のロックファイル `.arthus-harness/lock.json` + `baseline/`

## これは何?

Cristiano は数か月かけて `go-party-venue-hub` で洗練された Claude Code harness を構築しました:17 の専門 agent、12 の skill、4 つの hook、7 つの slash command、8 つのテンプレート、MCP 統合、auto-memory、design-system パイプライン。このリポジトリは**形式**(普遍的な規律)を再利用可能なキットに抽出し、**コンテンツ**(Asaas、Veriff、Supabase RLS、Confiança/Alívio)はオプトインプラグインに残します。

**Job-To-Be-Done。** 新しいプロジェクトを始めるとき、「感覚を伴う製品」の規律と Claude Code を操作する習慣がすでにインストールされていてほしい — 前のプロジェクトでどうやってそこに到達したかを覚えておく必要なく。

## これは何ではない

- ❌ React/Next/Vite ボイラープレート(自分のスタックを持参)
- ❌ create-next-app / Yeoman / Cookiecutter(あれらは製品コードを生成する)
- ❌ SaaS テンプレート / スターターキット
- ❌ ランタイム依存(ワンショットジェネレーター、ブートストラップ後ゼロフットプリント)

## 5 層の保護

> **MISSION** = 技術的に決して壊さない · **SPEC** = コンポーネント間の契約 · **PRODUTO §Princípios** = トレードオフを判断する方法 · **principios-de-experiencia** = 感情的に決して壊さない。各層には異なる重大度と頻度がある — 統合しないこと。詳細は [`docs/architecture.md`](docs/architecture.md) を参照。

### 1. プロセス層 — hooks + slash commands

すべての commit は以下を通る:

- **`config-protection.cjs`**(PreToolUse、**ブロッキング**)— ユーザーの明示的な承認なしに `tsconfig`、`eslint`、`package.json`、`MISSION.md` などへの編集をブロック。設定を緩めることで agent がエラーを隠すのを防ぐ。
- **`batch-format-typecheck.cjs`**(Stop、**lint ブロッキング / tsc 警告**)— セッション内で編集されたファイルに対して終了時に ESLint を実行。lint エラー時に Stop をブロック。tsc は警告のみ(TS 負債は段階的)。
- **`post-edit-accumulator.cjs`**(PostToolUse、**警告**)— auto-memory:`~/.claude/projects/<slug>/memory/` に編集されたファイルを記録。
- **`/code-review`** slash command — commit 前に 3 つの reviewer を並列実行。

### 2. 技術的不変条件 — MISSION.md

骨組みには §1-§7 のセクション(セキュリティ、冪等性、RBAC、マイグレーション、品質、プロセス)が付属。ユーザーは scaffold 時にインタビューを通じて TODO を埋める。プラグインが自動入力(例:`plugin-supabase` は RLS ルールで §1 を埋める)。

### 3. 運用原則 — `Docs/produto/PRODUTO.md §Princípios operacionais`

MISSION とは異なる 3-7 個の実行可能な原則。各原則は (a) コードレビューで実行可能、(b) MISSION とは異なる(トレードオフがあり、正当化があれば破られる)、(c) 短い必要がある。

例(テンプレートでコメント化 — 自分のものに置き換え):「人間が指揮」 · 「デフォルトで引用可能」 · 「失敗を声に出す」 · 「LGPD-first」 · 「予測可能なコスト」。

### 4. 契約的不変条件 — `Docs/SPEC.md`(Spec-Driven Development)

コンポーネント間の契約の形式仕様 — `Input → Output → Acceptance → Status`。状態ライフサイクル `[STUB]` / `[DRAFT]` / `[STABLE]`。`[STABLE]` への破壊的変更には ADR + 移行計画が必要。

`code-reviewer` agent は公開サーフェスの変更で SPEC 更新がない場合に **MEDIUM** をフラグ;ADR なしで `[STABLE]` を破壊する場合に **HIGH**。メソッドは [`core/Docs/sdd-guide.md.eta`](core/Docs/sdd-guide.md.eta)。

### 5. 体験的不変条件 — `Docs/produto/principios-de-experiencia.md`

中核となる IP。2 つの戦略が共存:

- **戦略 A(literal デフォルト)。** GoParty の 4 つのアンカー感覚(Confiança、Alívio、Clareza、Comemoração) + 5 つの運用ルールを原文で出荷 — GoParty 固有の部分にコメントを付けて簡単にオーバーライド可能。
- **戦略 C(オプトイン framework)。** 空だが型付けされた scaffold + manifest.yaml で出荷 — 自分の N 個の感覚、M 個のルールを定義;skill `experience-principles` が動的に読み取る。

Skill `experience-principles` は**コンテンツ非依存** — プロジェクトのファイルにあるものを読む。GoParty の知識は埋め込まれていない。

## CLI コマンド

```bash
# 新プロジェクトのブートストラップ
npx create-arthus-harness my-project [--preset=goparty-like|web-supabase|minimal] [--principles=A|C|both]

# arthus-harness からブートストラップされた既存プロジェクト内で:
arthus-harness sync                 # テンプレートを最新版に更新、競合時に .rej
arthus-harness sync --interactive   # 競合ごとにプロンプト
arthus-harness sync --strict        # 競合があれば失敗(CI 用)
arthus-harness doctor               # プロジェクトと現在の arthus バージョン間のドリフトをチェック
arthus-harness add-plugin <name>    # 既存プロジェクトにプラグインを追加
```

## プラグイン(オプトイン)

| プラグイン | 何を出荷 |
|---|---|
| `design-system-pipeline` | `DESIGN.md → src/index.css` パイプライン + `design:check` バリデーター + `/design-check` slash command + `design-quality-check.cjs` hook |
| `supabase` | `database-reviewer` agent + `supabase-rls-pattern` と `supabase-migration` skills + edge-function テンプレート |
| `e2e-playwright` | `storageState` パターン + persona fixtures + `AxeBuilder` helper + Playwright 設定 |
| `i18n` | JSON tree バリデーター + `i18n-source-of-truth` skill + locale テンプレート |
| `payment-asaas` | Asaas webhook HMAC + 冪等 middleware + `asaas-integration` skill |
| `journey-mapping` | `Docs/produto/jornadas/` + `journey-touch-reminder` hook |
| `mcp-code-review-graph` | code-review-graph MCP server(Tree-sitter ナレッジグラフ)+ 4 つの helper skill + 2 つの settingsHooks。`uv` + `uv tool install code-review-graph` が必要。 |

## 配布

- **主要:** npm パッケージ `create-arthus-harness`(`npx` ですぐに使える)。
- **ソース:** `github.com/cristianorj22/arthus-harness` — 公開、tags = npm バージョン、GH Actions 経由で release を自動公開。

## バージョニング

- Generator-style、スナップショットロックファイル(`.arthus-harness/lock.json`)+ `baseline/` ディレクトリ付き。
- `arthus-harness sync` は保存された回答を使用してテンプレートを再レンダリングし、ユーザーが変更したファイルに `node-diff3` 経由で**真の 3-way merge** を適用。デフォルトは非ブロッキング(競合時に `.rej` を書き込む);オプトインで対話式。
- SemVer:major bump はテンプレートの破壊的変更を示す;minor はプラグイン/agent を追加する。

## ドキュメント

- [PLAN.md](PLAN.md) — マスタープラン(アーキテクチャ + ロードマップ)
- [DECISIONS.md](DECISIONS.md) — 13 のアーキテクチャ決定とその理由
- [PROVENANCE.md](PROVENANCE.md) — `go-party-venue-hub` から来たもの(規律 vs ホコリ)
- [RESOLVED-QUESTIONS.md](RESOLVED-QUESTIONS.md) — 解決された 5 つの重要な決定
- [CHANGELOG.md](CHANGELOG.md) — バージョン履歴
- [docs/plugin-authoring.md](docs/plugin-authoring.md) — プラグインの書き方
- [docs/upgrade-guide.md](docs/upgrade-guide.md) — `arthus-harness sync` の詳細
- [docs/architecture.md](docs/architecture.md) — フォルダ構造 + プラグイン契約

## Yak-shaving 警告

> 実際のプロジェクトではなく arthus-harness を 2 時間以上調整しているなら、**止めなさい**。

Harness は手段であり、目的ではない。source repo に issue を開いて先に進む。`init-project` skill は次のプロンプトが harness ではなく**製品**についてになるよう強制するために設計されている。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cristianorj22/arthus-harness&type=Date)](https://star-history.com/#cristianorj22/arthus-harness&Date)

## ライセンス

MIT © 2026 Cristiano Moraes

---

> **🌐 翻訳に関する注意:** この翻訳は Claude Opus 4.7 によって生成されました。ネイティブスピーカーの方は PR で改善を歓迎します。英語版(`README.md`)が真実の源です。
