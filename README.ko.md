# arthus-harness

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <strong>한국어</strong> ·
  <a href="README.tr.md">Türkçe</a>
</p>

> 범용 Claude Code harness 엔지니어링 키트. **5계층 보호**(프로세스 · 기술적 불변량 · 운영 원칙 · SDD를 통한 계약적 불변량 · 경험적 불변량)로 새 프로젝트를 부트스트랩 — `go-party-venue-hub`에서 추출됨.

[![npm version](https://img.shields.io/npm/v/create-arthus-harness.svg)](https://www.npmjs.com/package/create-arthus-harness)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 빠른 시작

```bash
npx create-arthus-harness my-project
cd my-project
```

마법사가 **3가지 질문**(프리셋 · 원칙 · git-init)을 하고 다음을 포함한 프로젝트를 생성합니다:

- 9개 전문 agent(`code-reviewer`, `typescript-reviewer`, `silent-failure-hunter`, `security-reviewer`, `a11y-architect`, `refactor-cleaner`, `code-archaeologist`, `debugger`, `product-manager`)
- 4개 skill(`experience-principles`, `init-project`, `harness-doctor`, `spec-keeper`)
- 3개 hook(`config-protection`, `post-edit-accumulator`, `batch-format-typecheck`)
- 5개 slash command(`/plan`, `/feature-dev`, `/code-review`, `/refactor-clean`, `/save-session`)
- 8개 문서 템플릿(ADR, RUNBOOK, SPEC 등)
- **5계층 문서 스택**: `MISSION.md`(기술적 불변량) · `Docs/SPEC.md`(컴포넌트 계약, Spec-Driven Development) · `Docs/sdd-guide.md`(SDD 방법) · `Docs/produto/PRODUTO.md`(비전 + 운영 원칙) · `Docs/produto/principios-de-experiencia.md`(경험적 불변량)
- 5개 작업의 CI 워크플로우(lint, design-check, type-check, secrets-scan, npm-audit)
- `arthus-harness sync`용 잠금 파일 `.arthus-harness/lock.json` + `baseline/`

## 이게 뭔가요?

Cristiano는 `go-party-venue-hub`에서 정교한 Claude Code harness를 구축하는 데 몇 달을 보냈습니다: 17개 전문 agent, 12개 skill, 4개 hook, 7개 slash command, 8개 템플릿, MCP 통합, auto-memory, design-system 파이프라인. 이 repo는 **형식**(보편적 규율)을 재사용 가능한 키트로 추출하고, **콘텐츠**(Asaas, Veriff, Supabase RLS, Confiança/Alívio)는 옵트인 플러그인에 남겨둡니다.

**Job-To-Be-Done.** 새 프로젝트를 시작할 때, "감각이 있는 제품" 규율과 Claude Code 운영 습관이 이미 설치되어 있기를 원합니다 — 이전 프로젝트에서 어떻게 거기에 도달했는지 기억할 필요 없이.

## 이건 뭐가 아닌가요

- ❌ React/Next/Vite 보일러플레이트 (당신의 스택을 가져오세요)
- ❌ create-next-app / Yeoman / Cookiecutter (그것들은 제품 코드를 생성합니다)
- ❌ SaaS 템플릿 / 스타터 킷
- ❌ 런타임 의존성 (일회성 생성기, 부트스트랩 후 제로 풋프린트)

## 5계층 보호

> **MISSION** = 기술적으로 절대 깨지지 않음 · **SPEC** = 컴포넌트 간 계약 · **PRODUTO §Princípios** = 트레이드오프를 결정하는 방법 · **principios-de-experiencia** = 감정적으로 절대 깨지지 않음. 각 계층은 다른 심각도와 빈도를 가짐 — 합치지 마세요. 자세한 내용은 [`docs/architecture.md`](docs/architecture.md).

### 1. 프로세스 계층 — hooks + slash commands

모든 commit은 다음을 거칩니다:

- **`config-protection.cjs`** (PreToolUse, **차단**) — 사용자의 명시적 승인 없이 `tsconfig`, `eslint`, `package.json`, `MISSION.md` 등의 편집을 차단. agent가 설정을 완화하여 오류를 숨기는 것을 방지.
- **`batch-format-typecheck.cjs`** (Stop, **lint 차단 / tsc 경고**) — 세션 내에서 편집된 파일에 대해 종료 시 ESLint를 실행. lint 오류 시 Stop을 차단. tsc는 경고만 (TS 부채는 점진적).
- **`post-edit-accumulator.cjs`** (PostToolUse, **경고**) — auto-memory: `~/.claude/projects/<slug>/memory/`에 편집된 파일을 기록.
- **`/code-review`** slash command — commit 전에 3개 reviewer를 병렬로 실행.

### 2. 기술적 불변량 — MISSION.md

뼈대는 §1-§7 섹션(보안, 멱등성, RBAC, 마이그레이션, 품질, 프로세스)으로 출고. 사용자는 scaffold 시 인터뷰를 통해 TODO를 채움. 플러그인이 자동 입력(예: `plugin-supabase`는 RLS 규칙으로 §1을 채움).

### 3. 운영 원칙 — `Docs/produto/PRODUTO.md §Princípios operacionais`

MISSION과 다른 3-7개의 실행 가능한 원칙. 각 원칙은 (a) 코드 리뷰에서 실행 가능, (b) MISSION과 다름(트레이드오프 있음, 정당화 시 깨질 수 있음), (c) 짧아야 함.

예시(템플릿에 주석 처리됨 — 자신의 것으로 교체): "사람이 통제" · "기본적으로 인용 가능" · "실패는 소리내어" · "LGPD-first" · "예측 가능한 비용".

### 4. 계약적 불변량 — `Docs/SPEC.md` (Spec-Driven Development)

컴포넌트 간 계약의 형식 사양 — `Input → Output → Acceptance → Status`. 상태 라이프사이클 `[STUB]` / `[DRAFT]` / `[STABLE]`. `[STABLE]`로의 파괴적 변경은 ADR + 마이그레이션 계획이 필요.

`code-reviewer` agent는 공개 표면 변경에 SPEC 업데이트가 없을 때 **MEDIUM**으로 플래그; ADR 없이 `[STABLE]`을 파괴할 때 **HIGH**. 방법은 [`core/Docs/sdd-guide.md.eta`](core/Docs/sdd-guide.md.eta)에.

### 5. 경험적 불변량 — `Docs/produto/principios-de-experiencia.md`

핵심 IP. 두 가지 전략 공존:

- **전략 A (literal 기본).** GoParty의 4가지 앵커 감각(Confiança, Alívio, Clareza, Comemoração) + 5가지 운영 규칙을 원본으로 출고 — GoParty 특정 부분에 주석을 달아 쉽게 오버라이드.
- **전략 C (옵트인 framework).** 비어 있지만 타입이 지정된 scaffold + manifest.yaml로 출고 — 자신의 N개 감각, M개 규칙을 정의; skill `experience-principles`가 동적으로 읽음.

Skill `experience-principles`는 **콘텐츠 무관** — 프로젝트 파일에 있는 것을 읽음. GoParty 지식이 하드코딩되지 않음.

## CLI 명령

```bash
# 새 프로젝트 부트스트랩
npx create-arthus-harness my-project [--preset=goparty-like|web-supabase|minimal] [--principles=A|C|both]

# arthus-harness에서 부트스트랩된 기존 프로젝트 내에서:
arthus-harness sync                 # 템플릿을 최신 버전으로 업데이트, 충돌 시 .rej
arthus-harness sync --interactive   # 충돌마다 프롬프트
arthus-harness sync --strict        # 충돌이 있으면 실패 (CI용)
arthus-harness doctor               # 프로젝트와 현재 arthus 버전 간 드리프트 확인
arthus-harness add-plugin <name>    # 기존 프로젝트에 플러그인 추가
```

## 플러그인 (옵트인)

| 플러그인 | 출고 내용 |
|---|---|
| `design-system-pipeline` | `DESIGN.md → src/index.css` 파이프라인 + `design:check` 검증기 + `/design-check` slash command + `design-quality-check.cjs` hook |
| `supabase` | `database-reviewer` agent + `supabase-rls-pattern` 및 `supabase-migration` skills + edge-function 템플릿 |
| `e2e-playwright` | `storageState` 패턴 + persona fixtures + `AxeBuilder` helper + Playwright 설정 |
| `i18n` | JSON tree 검증기 + `i18n-source-of-truth` skill + locale 템플릿 |
| `payment-asaas` | Asaas webhook HMAC + 멱등 middleware + `asaas-integration` skill |
| `journey-mapping` | `Docs/produto/jornadas/` + `journey-touch-reminder` hook |
| `mcp-code-review-graph` | code-review-graph MCP server (Tree-sitter 지식 그래프) + 4개 helper skill + 2개 settingsHooks. `uv` + `uv tool install code-review-graph` 필요. |

## 배포

- **주요:** npm 패키지 `create-arthus-harness` (`npx`로 즉시 작동).
- **소스:** `github.com/cristianorj22/arthus-harness` — 공개, tags = npm 버전, GH Actions를 통해 release 자동 게시.

## 버전 관리

- 스냅샷 잠금 파일(`.arthus-harness/lock.json`) + `baseline/` 디렉토리가 있는 Generator-style.
- `arthus-harness sync`는 저장된 답변을 사용하여 템플릿을 다시 렌더링하고, 사용자 수정 파일에 `node-diff3`를 통해 **실제 3-way merge** 적용. 기본 비차단(충돌 시 `.rej` 작성); 옵트인 인터랙티브.
- SemVer: major bump는 파괴적 템플릿 변경을 의미; minor는 플러그인/agent를 추가.

## 문서

- [PLAN.md](PLAN.md) — 마스터 플랜 (아키텍처 + 로드맵)
- [DECISIONS.md](DECISIONS.md) — 13개 아키텍처 결정과 근거
- [PROVENANCE.md](PROVENANCE.md) — `go-party-venue-hub`에서 온 것 (규율 vs 먼지)
- [RESOLVED-QUESTIONS.md](RESOLVED-QUESTIONS.md) — 해결된 5가지 중요한 결정
- [CHANGELOG.md](CHANGELOG.md) — 버전 기록
- [docs/plugin-authoring.md](docs/plugin-authoring.md) — 플러그인 작성 방법
- [docs/upgrade-guide.md](docs/upgrade-guide.md) — `arthus-harness sync` 심층 분석
- [docs/architecture.md](docs/architecture.md) — 폴더 구조 + 플러그인 계약

## Yak-shaving 경고

> 실제 프로젝트가 아닌 arthus-harness를 2시간 이상 튜닝하고 있다면, **멈추세요**.

Harness는 수단이지 목적이 아닙니다. source repo에 issue를 열고 진행하세요. `init-project` skill은 다음 프롬프트가 harness가 아닌 **제품**에 관한 것이 되도록 강제하기 위해 설계되었습니다.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cristianorj22/arthus-harness&type=Date)](https://star-history.com/#cristianorj22/arthus-harness&Date)

## 라이선스

MIT © 2026 Cristiano Moraes

---

> **🌐 번역 안내:** 이 번역은 Claude Opus 4.7에 의해 생성되었습니다. 원어민은 PR로 개선을 환영합니다. 영어 버전(`README.md`)이 진실의 출처입니다.
