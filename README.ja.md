<p align="center">
  <img src="assets/logo.png" width="240" alt="arthus-harness マスコット — クライミングハーネスを着けたカピバラ" />
</p>

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

> **前のプロジェクトで何ヶ月もかけて調整した規律を、次のプロジェクトに 30 秒でインストール。**

[![npm version](https://img.shields.io/npm/v/create-arthus-harness.svg)](https://www.npmjs.com/package/create-arthus-harness)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`arthus-harness` は、新しいプロジェクトを **5 層の保護**(agents、skills、hooks、slash commands、ドキュメントテンプレート、運用原則、感情的不変条件)を事前にインストールしてブートストラップする Claude Code スキャフォルダーです。スタックのボイラープレートではありません。SaaS スターターキットでもありません。これはあなたの **Claude Code を操作する方法**を、一度実行してプロジェクトを規律で動かす準備を整え、消える `npx` コマンドにパッケージ化したものです。次のプロジェクトを、前のプロジェクトが終わった**上から**始める — ゼロからではなく。

## クイックスタート

```bash
npx create-arthus-harness my-project
cd my-project
```

表示される内容:

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

## なぜ存在するか

あなたは 3 ヶ月かけて、プロジェクトで Claude Code を調整します。サイレントバグを捕捉する agent を書きます。Claude が lint を通すために `tsconfig` を「修正」するのをブロックする hook を設定します。reviewer が適用することを学んだ UX ルールを文書化します。すべての commit の前に 3 つの reviewer を並列実行する slash command を作ります。美しく動きます。各部分が何をして、なぜそこにあるかを知っています。

そして新しいプロジェクトを開きます。

そこには Claude Code が再び工場出荷時の状態に戻っています。Agents なし。Hooks なし。同じ RLS の間違いを 4 回犯すのを防いだ `MISSION.md` なし。すべてのエラーメッセージがユーザーを責めるのではなく、次のステップを言うようにした原則ファイルなし。あなたは見て、ため息をつき、古いプロジェクトから手動で `.claude/` をコピーし始めます — 内容の半分はそのドメインに固有で新しいものを汚染することを知っており、もう半分は普遍的だが分離するエネルギーがありません。

それが問題です。Claude Code は**プロジェクトを速く作る**ことを可能にしますが、規律はあなたと一緒に旅しません。すべての新しいプロジェクトは世界の平均レベルに後退します。各プロジェクトであなたが良くなるという複利効果は起こりません — または**1 つのプロジェクト内**で起こり、それが死ぬときに死にます。

`arthus-harness` は、この普遍的な部分(**形式**: agents、hooks、skills、テンプレート)を抽出し、ドメイン固有のコンテンツをオプトインで残します(プラグイン経由の**コンテンツ**)。`npx create-arthus-harness` を一度実行し、3 つの質問に答えると、新しいプロジェクトは 9 つの agents、4 つの skills、3 つの hooks、5 つの slash commands、そして 5 層のドキュメントスタックがすでにインストールされた状態で誕生します。固定テンプレートではありません: lockfile、baseline、本物の 3-way merge があります — harness が進化するとき、あなたは作業を失わずに改善を引き出します。

洞察はシンプルです: すべての新しいプロジェクトは、前のプロジェクトが終わった**上から**始まるべきです。パニックでファイルをコピーするのではなく。同じ教訓を学び直すのではなく。規律は唯一複利するものです — そして、あなたと一緒に旅する場所にパッケージ化したときだけ複利します。

## 解決する問題

### 🔥 すべての新しいプロジェクトでセットアップを繰り返す

> **心当たりがありますか?**
>
> "新しいプロジェクトを始めて、古いプロジェクトから `.claude/agents/` を手動でコピーするのに 4 時間費やしました。何が普遍的で何がそのドメインに固有かを、ファイルごとに決定しました。終わったときには、実際の機能を始めるエネルギーが残っていませんでした。"

**`arthus-harness` の解決方法:** `npx create-arthus-harness my-project` + 3 つの質問。30 秒後、9 つの agents、4 つの skills、3 つの hooks、5 つの slash commands がインストールされます — 普遍的なものだけ。ドメイン固有のコンテンツはプラグイン経由でオプトインです。

### 🔥 設定を緩めることでエラーを黙らせる Agent

> **心当たりがありますか?**
>
> "Claude が build を通すのに苦労していました。diff を確認したところ、`tsconfig.json` に入って `strictNullChecks` をオフにしたことに気づきました。Build は通りました。200 個の沈黙したエラーと一緒に。本番環境で 2 週間後に発見しました。"

**`arthus-harness` の解決方法:** `config-protection.cjs` hook は PreToolUse で**ブロッキング**です — `tsconfig`、`eslint`、`package.json`、`MISSION.md`、migrations への Edit/Write は明示的な認証要求で中断されます。Claude はあなたが見ていないところで設定を緩めてエラーを黙らせることができません。

### 🔥 セッション間でメモリがない

> **心当たりがありますか?**
>
> "新しいセッションごとに 10 分かけて Claude に現在の状態を説明します: どの機能にいるか、金曜日に何を決定したか、明らかなアプローチをなぜ使わなかったか。週 3 セッションで 30 分の無駄 — そして Claude は私たちがすでに捨てたパスを進みます。"

**`arthus-harness` の解決方法:** `post-edit-accumulator` hook は、編集されたファイルをセッションごとに auto-memory に記録します。Slash command `/save-session` は状態のスナップショット(ブランチ、最後の commit、決定事項、次のステップ)を保存し、次のセッションの最初に読み込まれます。ドキュメントテンプレート(ADR、RUNBOOK、SPEC)は、アーキテクチャ決定があなたの頭の中だけに住まないための場所を提供します。

### 🔥 一貫したチェックリストのない PR

> **心当たりがありますか?**
>
> "今日 merge する前に PR を review して、3 つのことを見つけました。先週同じサイズの別のものを review して、何も見ずに merge しました。悪意ではありません — 基準が私の気分によって変わったのです。私がどれだけ休息しているかに依存する review は信頼できません。"

**`arthus-harness` の解決方法:** `/code-review` slash command は複数の reviewer を並列で呼び出します(`code-reviewer`、`silent-failure-hunter`、`security-reviewer`、`typescript-reviewer`、`a11y-architect`)— それぞれが独自のチェックリストを持ちます。あなたの気分に依存しません。Reviewer はプロジェクトごとに memory にパターンを蓄積し、各 PR でより鋭くなります。

### 🔥 すべてのプロジェクトで繰り返される UX エラー

> **心当たりがありますか?**
>
> "また「何かが間違いました。再試行してください。」というエラーメッセージを通してしまいました — 何が間違ったかも、次のステップも、ユーザーのせいかシステムのせいかも言わずに。今年 4 度目で、最終 review でしか覚えていません。すべてが本番環境にあります。"

**`arthus-harness` の解決方法:** Layer 5 — `principios-de-experiencia.md` は 4 つのアンカー感覚 + 5 つの運用ルール付きで出荷されます。`experience-principles` skill はコンテンツ非依存で、UI/copy ファイルで自動発火します。あなたがルールを定義し、skill が適用を保証します。

### 🔥 失われたアーキテクチャ決定

> **心当たりがありますか?**
>
> "3 ヶ月後、誰かが PR で尋ねます: 'なぜ X を使わなかったの?'。誰も覚えていません。私はその時覚えていて、頭の中で書いて、明らかだと思いました。記録しなかったのは慣性でした。今、すべてを再び議論します。"

**`arthus-harness` の解決方法:** `ADR.md` テンプレートがデフォルトで出荷されます。Layer 4(Spec-Driven Development)は `Docs/SPEC.md` をコンポーネント契約の正式な場所にします。誰かが ADR なしで `[STABLE]` を破ると、`code-reviewer` が HIGH としてフラグを立てます。

### 🔥 コードとドキュメント間のドリフト

> **心当たりがありますか?**
>
> "支払いモジュールをリファクタリングして、`Docs/arquitetura/` の更新を忘れました。6 週間後に新しい dev が参加し、ドキュメントを読み、それに従い、変更されたコードで迷子になりました。気づかないうちに、私はオンボーディングのボトルネックになりました。"

**`arthus-harness` の解決方法:** Layer 4(SPEC)+ `code-reviewer` agent は、SPEC 更新なしでパブリックサーフェスが変更された場合に **MEDIUM** をフラグします。`spec-keeper` skill は `Docs/SPEC.md` を生かし、契約ごとにステータス(`[STUB]` / `[DRAFT]` / `[STABLE]`)を要求します。古いドキュメントは review を通りません — メモリリークではなく commit 境界になります。

## これがあなたに開くもの

### 📈 プロジェクト間の複利

**前:** プロジェクト A で学んだ教訓はそこで死にました。
**今:** それらは harness の改善になります。`arthus-harness sync` は、作業を失うことなく更新を生きているプロジェクトに引き出します。すべての新しいプロジェクトは前のプロジェクトの**上から**始まります。

### 📈 規律の後退なしのマルチプロジェクト

**前:** 3 つの並列プロジェクト = 3 つの異なる規律レベル。
**今:** すべてが同じドキュメントスタック、同じブロッキング hook、同じ reviewer で生まれます。Solo dev は「後退税」なしで N プロジェクトにスケールします。

### 📈 重いツーリングなしの Spec-Driven Development

**前:** SDD は OpenAPI generators、Stoplight、専用 QA チームを持つエンタープライズの大物のように見えました。
**今:** `Docs/SPEC.md` は `Input → Output → Acceptance → Status` テーブルを持つ Markdown です。3 段階のステータスライフサイクル。SDD はついに solo プロジェクトに収まります。

### 📈 セレモニーではなくガードレールとしての契約

**前:** 「契約を形式化しよう」は、誰も読まない Notion ドキュメント + 会議になりました。
**今:** 契約はコードと一緒に、同じ PR の中で生きます。`[STABLE]` を破るには ADR が必要です。`[DRAFT]` を破るのは無料です。形式は成熟度に比例します。

### 📈 膨らんだ starter kit ではなくオプトインプラグイン

**前:** SaaS テンプレートは、半分しか使わなくてもすべてバンドルされて出荷されました。
**今:** core は 9 つの普遍的な agents を出荷します。7 つのプラグインがオプトインです。スリムなフットプリント、Claude のためのクリーンなコンテキスト。

### 📈 UX チームなしの一貫した UX

**前:** 基本的な UX ルールはあなたの頭の中だけに住んでいました。
**今:** Layer 5 は、自動発火する skill 経由でルールを自動 code review に変えます。UX チームなしの UX チーム品質。

## これは誰のためか

### ✅ 次のような場合 `arthus-harness` を使う

- Claude Code を十分に操作したことがあり、デフォルト設定に何が欠けているかについて意見を持っている — 自分の agents、ブロッキング hooks、`paths:` スコーピング付き skills、カスタム slash commands。
- Solo dev または小規模チーム(≤5 人)で、別の QA / UX / DevOps を持っておらず、これらの規律をプロジェクトにコードとしてインストールしたい。
- 複数の並列プロジェクトに取り組んでおり、各プロジェクトが平均レベルに後退するのに疲れている。
- 技術的規律と UX/UI への配慮は異なるタイプの不変条件であると信じており、その区別を尊重するツール(別々の層、別々の重大度)が欲しい。
- アーキテクチャ決定が ADR になり、契約が SPEC になり、原則が自動 reviewer になることを望んでいる。

### ❌ 次のような場合は使わない

- auth + landing + dashboard 準備済みの React/Next/Vite テンプレートを探している。`arthus-harness` はスタック非依存です — あなたがスタックを持ってきます。
- agent、hook、skill、slash command が何かを理解する努力をまだしていないのに「Claude Code でバイブを始めたい」。Harness は 1 日目の人にとってオーバーヘッドです; まず Claude Code で生産的になり、その後規律をパッケージ化しに来てください。
- 専用の QA/SRE/DevRel を持つ大規模チームで働いている — これらの人々は harness がコードとしてカプセル化するものを外部で提供しています。
- 最低限のセレモニーに耐えられない。5 層は `MISSION` / `SPEC` / 原則を更新する習慣を要求します。「何でも merge する 0 摩擦」が欲しい場合、harness はあなたを困らせます — 意図的に。

## 5 層の保護

| # | 層 | ドキュメント | 違反の重大度 |
|---|---|---|---|
| 1 | **プロセス** | hooks `.cjs` + slash commands | ブロッキング(exit 2) |
| 2 | **技術的**(交渉不可) | `MISSION.md` | インシデント級(キーローテーション、ポストモーテム) |
| 3 | **運用原則** | `PRODUTO.md §Princípios` | 議論(PR で引用) |
| 4 | **契約的(SDD)** | `SPEC.md` + `sdd-guide.md` | Review(PR 拒否) |
| 5 | **感情的** | `principios-de-experiencia.md` | UI/copy で skill 自動発火 |

各層には異なる重大度と頻度があります — 統合しないこと。詳細は [`docs/architecture.md`](docs/architecture.md) を参照。

## CLI コマンド

```bash
# 新プロジェクトのブートストラップ
npx create-arthus-harness my-project
# → 30 秒、3 つの質問、規律で Claude Code を使う準備ができたプロジェクト

# harness が進化したときに既存プロジェクトを更新
arthus-harness sync
# → 3-way merge: 触れていないファイルは自動更新; 変更されたファイルは .rej を取得

# ドリフトを診断
arthus-harness doctor
# → 現在対インストール済みバージョン + プラグイン + 不足ファイルを報告

# 既存プロジェクトにプラグインを追加
arthus-harness add-plugin supabase
# → プラグインの貢献が .claude/ + package.json + .env.example にマージ
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

## 比較

| | `arthus-harness` | `create-t3-app` | `cookiecutter` | 手動 `cp -r` |
|---|---|---|---|---|
| `.claude/` をスキャフォルド | ✅ | ❌ | ❌ | ✅ (manual) |
| プロダクトコードをスキャフォルド | ❌ | ✅ | ✅ | ✅ |
| 3-way merge による更新可能(`sync`) | ✅ | ❌ | ❌ | ❌ |
| オプトインプラグイン | ✅ | ⚠️ via opts | ⚠️ via hooks | ❌ |
| スタック非依存 | ✅ | ❌ (Next-only) | ✅ | ✅ |
| 5 層ドキュメントスタック | ✅ | ❌ | ❌ | ❌ |

## 巨人の肩の上に立つ

- [`create-t3-app`](https://create.t3.gg) — CLI スキャフォルダーパターン + opinionated 哲学
- [`cookiecutter`](https://cookiecutter.readthedocs.io) — テンプレートライフサイクル + hook システムの インスピレーション
- [Anthropic Skills](https://github.com/anthropics/skills) — skill 形式仕様
- [`PRPs-agentic-eng`](https://github.com/Wirasm/PRPs-agentic-eng) by Wirasm — 適応された slash command パターン(`/code-review`、`/plan`、`/feature-dev`)
- [`everything-claude-code`](https://github.com/affaan-m/everything-claude-code) — 多言語 README パターン
- 6 ヶ月の本物の本番マーケットプレイスの運用 — agents/skills/hooks が harness になる前に実戦テストされた

## ドキュメント

- [PLAN.md](PLAN.md) — マスタープラン(アーキテクチャ + ロードマップ)
- [DECISIONS.md](DECISIONS.md) — 13 のアーキテクチャ決定とその理由
- [PROVENANCE.md](PROVENANCE.md) — 規律 vs ホコリ 監査
- [CHANGELOG.md](CHANGELOG.md) — バージョン履歴
- [docs/plugin-authoring.md](docs/plugin-authoring.md) — プラグインの書き方
- [docs/upgrade-guide.md](docs/upgrade-guide.md) — `arthus-harness sync` の詳細
- [docs/architecture.md](docs/architecture.md) — フォルダ構造 + プラグイン契約

## Yak-shaving 警告

> 実際のプロジェクトではなく arthus-harness を 2 時間以上調整しているなら、**止めなさい**。

Harness は手段であり、目的ではない。issue を開いて先に進む。`init-project` skill は次のプロンプトが harness ではなく**製品**についてになるよう強制するために設計されている。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cristianorj22/arthus-harness&type=Date)](https://star-history.com/#cristianorj22/arthus-harness&Date)

## ライセンス

MIT © 2026 Cristiano Moraes

---

> **🌐 翻訳に関する注意:** この翻訳は Claude Opus 4.7 によって生成されました。ネイティブスピーカーの方は PR で改善を歓迎します。英語版(`README.md`)が真実の源です。
