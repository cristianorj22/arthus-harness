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

> **이전 프로젝트에서 몇 달 동안 조정한 규율을, 다음 프로젝트에 30초 만에 설치.**

[![npm version](https://img.shields.io/npm/v/create-arthus-harness.svg)](https://www.npmjs.com/package/create-arthus-harness)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`arthus-harness`는 **5계층 보호**(agents, skills, hooks, slash commands, 문서 템플릿, 운영 원칙, 감정적 불변량)가 사전 설치된 새 프로젝트를 부트스트랩하는 Claude Code 스캐폴더입니다. 스택 보일러플레이트가 아닙니다. SaaS 스타터 키트도 아닙니다. 이는 한 번 실행하고 프로젝트를 규율로 작동할 준비를 시키고 사라지는 `npx` 명령으로 패키지화된 당신의 **Claude Code 작업 방식**입니다. 다음 프로젝트를 이전 프로젝트가 끝난 **위에서** 시작합니다 — 처음부터가 아닙니다.

## 빠른 시작

```bash
npx create-arthus-harness my-project
cd my-project
```

표시되는 내용:

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

## 왜 존재하는가

당신은 프로젝트에서 Claude Code를 조정하는 데 3개월을 보냅니다. 사일런트 버그를 잡는 agent를 작성합니다. Claude가 lint를 통과시키기 위해 `tsconfig`를 "고치는" 것을 차단하는 hook을 구성합니다. reviewer가 적용하는 법을 배운 UX 규칙을 문서화합니다. 모든 commit 전에 3개의 reviewer를 병렬로 실행하는 slash command를 만듭니다. 아름답게 작동합니다. 각 부분이 무엇을 하고 왜 거기에 있는지 압니다.

그런 다음 새 프로젝트를 엽니다.

거기에 Claude Code가 다시 출고 상태로 있습니다. Agents 없음. Hooks 없음. 같은 RLS 실수를 4번 저지르는 것을 막아준 `MISSION.md` 없음. 모든 오류 메시지가 사용자를 비난하는 대신 다음 단계를 말하도록 한 원칙 파일 없음. 당신은 보고, 한숨을 쉬고, 이전 프로젝트에서 수동으로 `.claude/`를 복사하기 시작합니다 — 내용의 절반은 그 도메인에 특정하고 새 프로젝트를 오염시킬 것이고, 나머지 절반은 보편적이지만 분리할 에너지가 없다는 것을 알면서.

그것이 문제입니다. Claude Code는 **프로젝트를 빠르게 만들도록** 해주지만, 규율은 당신과 함께 여행하지 않습니다. 모든 새 프로젝트는 세계의 평균 수준으로 후퇴합니다. 각 프로젝트에서 더 나아지는 복리 효과는 일어나지 않습니다 — 또는 **단일 프로젝트 내**에서 일어나고, 그것이 죽을 때 죽습니다.

`arthus-harness`는 이 보편적인 부분(**형식**: agents, hooks, skills, 템플릿)을 추출하고, 도메인 특정 콘텐츠는 옵트인으로 남깁니다(플러그인을 통한 **콘텐츠**). 한 번 `npx create-arthus-harness`를 실행하고, 3가지 질문에 답하면, 새 프로젝트는 9개의 agents, 4개의 skills, 3개의 hooks, 5개의 slash commands, 그리고 5계층 문서 스택이 이미 설치된 상태로 탄생합니다. 고정 템플릿이 아닙니다: lockfile, baseline, 진짜 3-way merge가 있습니다 — harness가 진화할 때, 작업을 잃지 않고 개선 사항을 가져옵니다.

통찰은 단순합니다: 모든 새 프로젝트는 이전 프로젝트가 끝난 **위에서** 시작해야 합니다. 패닉 상태에서 파일을 복사하지 않고. 같은 교훈을 다시 배우지 않고. 규율은 복리하는 유일한 것입니다 — 그리고 당신과 함께 여행하는 곳에 패키지화할 때만 복리합니다.

## 해결하는 문제

### 🔥 모든 새 프로젝트에서 반복되는 설정

> **익숙하게 들리나요?**
>
> "새 프로젝트를 시작하고, 이전 프로젝트에서 `.claude/agents/`를 수동으로 복사하는 데 4시간을 썼습니다. 무엇이 보편적이고 무엇이 그 도메인에 특정한지 파일별로 결정했습니다. 끝났을 때, 실제 기능을 시작할 에너지가 남아 있지 않았습니다."

**`arthus-harness`가 해결하는 방법:** `npx create-arthus-harness my-project` + 3가지 질문. 30초 후 9개의 agents, 4개의 skills, 3개의 hooks, 5개의 slash commands가 설치됩니다 — 보편적인 것만. 도메인 특정 콘텐츠는 플러그인을 통해 옵트인입니다.

### 🔥 설정을 완화하여 오류를 침묵시키는 Agent

> **익숙하게 들리나요?**
>
> "Claude가 build를 통과시키느라 고생했습니다. diff를 검토했을 때, `tsconfig.json`에 들어가 `strictNullChecks`를 끈 것을 알아챘습니다. Build는 통과했습니다. 200개의 침묵된 오류와 함께. 2주 후 프로덕션에서 발견했습니다."

**`arthus-harness`가 해결하는 방법:** `config-protection.cjs` hook은 PreToolUse이며 **차단**입니다 — `tsconfig`, `eslint`, `package.json`, `MISSION.md`, migrations에 대한 모든 Edit/Write는 명시적인 권한 요청으로 중단됩니다. Claude는 당신이 보지 않고 설정을 완화하여 오류를 침묵시킬 수 없습니다.

### 🔥 세션 간 메모리 부재

> **익숙하게 들리나요?**
>
> "모든 새 세션에서 Claude에게 현재 상태를 설명하는 데 10분을 잃습니다: 어떤 기능에 있는지, 금요일에 무엇을 결정했는지, 명백한 접근 방식을 왜 사용하지 않았는지. 일주일에 세 세션이면 30분 낭비입니다 — 그리고 Claude는 여전히 이미 폐기한 경로를 갑니다."

**`arthus-harness`가 해결하는 방법:** `post-edit-accumulator` hook은 세션별로 편집된 파일을 auto-memory에 기록합니다. Slash command `/save-session`은 상태 스냅샷(브랜치, 마지막 commit, 결정, 다음 단계)을 저장하고 다음 세션 시작 시 읽습니다. 문서 템플릿(ADR, RUNBOOK, SPEC)은 아키텍처 결정이 당신의 머릿속에만 살지 않을 장소를 제공합니다.

### 🔥 일관된 체크리스트가 없는 PR

> **익숙하게 들리나요?**
>
> "오늘 merge하기 전에 PR을 review했고 3가지를 잡았습니다. 지난주에 같은 크기의 다른 것을 review했고 아무것도 보지 않고 merge했습니다. 악의가 아닙니다 — 기준이 제 기분에 따라 변했습니다. 제가 얼마나 잘 쉬었는지에 의존하는 review를 신뢰할 수 없습니다."

**`arthus-harness`가 해결하는 방법:** `/code-review` slash command는 여러 reviewer를 병렬로 호출합니다(`code-reviewer`, `silent-failure-hunter`, `security-reviewer`, `typescript-reviewer`, `a11y-architect`) — 각각 자체 체크리스트를 가집니다. 당신의 기분에 의존하지 않습니다. Reviewer는 프로젝트별로 memory에 패턴을 축적하여 각 PR마다 더 날카로워집니다.

### 🔥 모든 프로젝트에서 반복되는 UX 오류

> **익숙하게 들리나요?**
>
> "또다시 '문제가 발생했습니다. 다시 시도하세요.' 오류 메시지를 통과시켰습니다 — 무엇이 잘못되었는지, 다음 단계가 무엇인지, 사용자나 시스템의 잘못인지 말하지 않고. 올해 4번째로 최종 review에서만 기억하고, 모든 것이 이미 프로덕션에 있습니다."

**`arthus-harness`가 해결하는 방법:** Layer 5 — `principios-de-experiencia.md`는 4개의 앵커 감각 + 5개의 운영 규칙으로 출고됩니다. `experience-principles` skill은 콘텐츠 무관이며 UI/copy 파일에서 자동 발화합니다. 당신이 규칙을 정의하고, skill이 적용을 보장합니다.

### 🔥 잃어버린 아키텍처 결정

> **익숙하게 들리나요?**
>
> "3개월 후, 누군가가 PR에서 묻습니다: '왜 X를 사용하지 않았어?'. 아무도 기억하지 못합니다. 저는 그때 기억했고, 머릿속에 적었고, 명백하다고 생각했습니다. 관성에 있어서 기록하지 않았습니다. 이제 모든 것을 다시 논의합니다."

**`arthus-harness`가 해결하는 방법:** `ADR.md` 템플릿이 기본으로 출고됩니다. Layer 4(Spec-Driven Development)는 `Docs/SPEC.md`를 컴포넌트 계약을 위한 공식 장소로 만듭니다. 누군가가 ADR 없이 `[STABLE]`을 깨면, `code-reviewer`가 HIGH로 플래그합니다.

### 🔥 코드와 문서 간의 드리프트

> **익숙하게 들리나요?**
>
> "결제 모듈을 리팩토링하고, `Docs/arquitetura/` 업데이트를 잊었습니다. 6주 후 새 dev가 합류해서 문서를 읽고, 따라가고, 변경된 코드에서 길을 잃었습니다. 깨닫지 못한 채 온보딩 병목이 되었습니다."

**`arthus-harness`가 해결하는 방법:** Layer 4(SPEC) + `code-reviewer` agent는 SPEC 업데이트 없이 공개 표면이 변경되면 **MEDIUM**으로 플래그합니다. `spec-keeper` skill은 `Docs/SPEC.md`를 살아 있게 유지하고 계약별로 상태(`[STUB]` / `[DRAFT]` / `[STABLE]`)를 요구합니다. 오래된 문서는 review를 통과하지 못합니다 — 메모리 누수가 아닌 commit 경계가 됩니다.

## 이것이 당신에게 열어주는 것

### 📈 프로젝트 간 복리

**이전:** 프로젝트 A에서 배운 교훈은 거기서 죽었습니다.
**지금:** 그것들은 harness 개선이 됩니다. `arthus-harness sync`는 작업을 잃지 않고 살아 있는 프로젝트로 업데이트를 가져옵니다. 모든 새 프로젝트가 이전 프로젝트의 **위에서** 시작합니다.

### 📈 규율 후퇴 없는 멀티 프로젝트

**이전:** 3개의 병렬 프로젝트 = 3개의 다른 규율 수준.
**지금:** 모든 프로젝트가 같은 문서 스택, 같은 차단 hook, 같은 reviewer로 태어납니다. Solo dev는 "후퇴 세금" 없이 N개 프로젝트로 확장합니다.

### 📈 무거운 도구 없는 Spec-Driven Development

**이전:** SDD는 OpenAPI generators, Stoplight, 전담 QA 팀이 있는 엔터프라이즈 일처럼 보였습니다.
**지금:** `Docs/SPEC.md`는 `Input → Output → Acceptance → Status` 테이블이 있는 Markdown입니다. 3단계 상태 라이프사이클. SDD가 마침내 solo 프로젝트에 맞습니다.

### 📈 의식이 아닌 가드레일로서의 계약

**이전:** "계약을 형식화하자"는 아무도 읽지 않는 Notion 문서 + 회의가 되었습니다.
**지금:** 계약은 코드와 함께, 같은 PR에서 살아 있습니다. `[STABLE]`을 깨려면 ADR이 필요합니다. `[DRAFT]`를 깨는 것은 무료입니다. 형식이 성숙도에 비례합니다.

### 📈 부풀어 오른 starter kit 대신 옵트인 플러그인

**이전:** SaaS 템플릿은 절반만 사용해도 모든 것이 번들로 출고되었습니다.
**지금:** core는 9개의 보편적인 agents를 출고합니다. 7개의 플러그인이 옵트인입니다. 슬림한 풋프린트, Claude를 위한 깨끗한 컨텍스트.

### 📈 UX 팀 없는 일관된 UX

**이전:** 기본 UX 규칙은 당신의 머릿속에만 살았습니다.
**지금:** Layer 5는 자동 발화 skill을 통해 규칙을 자동 code review로 변환합니다. UX 팀 없는 UX 팀 품질.

## 누구를 위한 것인가

### ✅ 다음과 같다면 `arthus-harness`를 사용하세요

- Claude Code를 충분히 운영해 본 경험이 있어 기본 설정에서 무엇이 누락되어 있는지에 대한 의견이 있다 — 자신의 agents, 차단 hooks, `paths:` 스코핑이 있는 skills, 사용자 정의 slash commands.
- Solo dev 또는 별도의 QA / UX / DevOps가 없는 소규모 팀(≤5명)이며, 이러한 규율을 코드로 프로젝트에 설치하기를 원한다.
- 여러 병렬 프로젝트를 다루고 있고 각 프로젝트가 평균 수준으로 후퇴하는 데 지쳤다.
- 기술적 규율과 UX/UI에 대한 관심이 다른 종류의 불변량이라고 믿으며, 그 구분을 존중하는 도구(별도의 계층, 별도의 심각도)를 원한다.
- 아키텍처 결정이 ADR이 되고, 계약이 SPEC이 되며, 원칙이 자동 reviewer가 되기를 원한다.

### ❌ 다음과 같다면 사용하지 마세요

- auth + landing + dashboard가 준비된 React/Next/Vite 템플릿을 찾고 있다. `arthus-harness`는 스택 무관입니다 — 당신이 스택을 가져옵니다.
- agent, hook, skill, slash command가 무엇인지 이해하려는 노력 없이 "Claude Code와 함께 vibing을 시작하고" 싶다. Harness는 1일차 사람에게 오버헤드입니다; 먼저 Claude Code에서 생산적이 되고, 그 다음에 규율을 패키지화하러 오세요.
- 전담 QA/SRE/DevRel이 있는 대규모 팀에서 일하고 있다 — 이 사람들이 외부에서 harness가 코드로 캡슐화하는 것을 이미 제공합니다.
- 최소한의 의식을 견딜 수 없다. 5계층은 `MISSION` / `SPEC` / 원칙을 업데이트하는 습관을 요구합니다. "어떤 것이든 merge하는 0 마찰"을 원한다면, harness가 의도적으로 당신을 괴롭힐 것입니다.

## 5계층 보호

| # | 계층 | 문서 | 위반 심각도 |
|---|---|---|---|
| 1 | **프로세스** | hooks `.cjs` + slash commands | 차단(exit 2) |
| 2 | **기술적**(협상 불가) | `MISSION.md` | 사고 등급(키 회전, 사후 분석) |
| 3 | **운영 원칙** | `PRODUTO.md §Princípios` | 토론(PR에서 인용) |
| 4 | **계약적(SDD)** | `SPEC.md` + `sdd-guide.md` | Review(PR 거부) |
| 5 | **감정적** | `principios-de-experiencia.md` | UI/copy에서 skill 자동 발화 |

각 계층은 다른 심각도와 빈도를 가짐 — 합치지 마세요. 자세한 내용은 [`docs/architecture.md`](docs/architecture.md).

## CLI 명령

```bash
# 새 프로젝트 부트스트랩
npx create-arthus-harness my-project
# → 30초, 3개 질문, 규율로 Claude Code를 사용할 준비가 된 프로젝트

# harness가 진화할 때 기존 프로젝트 업데이트
arthus-harness sync
# → 3-way merge: 만지지 않은 파일은 자동 업데이트; 수정된 것은 .rej 받음

# 드리프트 진단
arthus-harness doctor
# → 현재 vs 설치된 버전 + 플러그인 + 누락된 파일 보고

# 기존 프로젝트에 플러그인 추가
arthus-harness add-plugin supabase
# → 플러그인 기여가 .claude/ + package.json + .env.example로 병합
```

## 플러그인(옵트인)

| 플러그인 | 출고 내용 |
|---|---|
| `design-system-pipeline` | `DESIGN.md → src/index.css` 파이프라인 + `design:check` 검증기 + `/design-check` slash command + `design-quality-check.cjs` hook |
| `supabase` | `database-reviewer` agent + `supabase-rls-pattern` 및 `supabase-migration` skills + edge-function 템플릿 |
| `e2e-playwright` | `storageState` 패턴 + persona fixtures + `AxeBuilder` helper + Playwright 설정 |
| `i18n` | JSON tree 검증기 + `i18n-source-of-truth` skill + locale 템플릿 |
| `payment-asaas` | Asaas webhook HMAC + 멱등 middleware + `asaas-integration` skill |
| `journey-mapping` | `Docs/produto/jornadas/` + `journey-touch-reminder` hook |
| `mcp-code-review-graph` | code-review-graph MCP server (Tree-sitter 지식 그래프) + 4개 helper skill + 2개 settingsHooks. `uv` + `uv tool install code-review-graph` 필요. |

## 비교

| | `arthus-harness` | `create-t3-app` | `cookiecutter` | 수동 `cp -r` |
|---|---|---|---|---|
| `.claude/` 스캐폴드 | ✅ | ❌ | ❌ | ✅ (manual) |
| 제품 코드 스캐폴드 | ❌ | ✅ | ✅ | ✅ |
| 3-way merge로 업데이트 가능(`sync`) | ✅ | ❌ | ❌ | ❌ |
| 옵트인 플러그인 | ✅ | ⚠️ via opts | ⚠️ via hooks | ❌ |
| 스택 무관 | ✅ | ❌ (Next-only) | ✅ | ✅ |
| 5계층 문서 스택 | ✅ | ❌ | ❌ | ❌ |

## 거인의 어깨 위에 서서

- [`create-t3-app`](https://create.t3.gg) — CLI 스캐폴더 패턴 + opinionated 철학
- [`cookiecutter`](https://cookiecutter.readthedocs.io) — 템플릿 라이프사이클 + hook 시스템 영감
- [Anthropic Skills](https://github.com/anthropics/skills) — skill 형식 사양
- [`PRPs-agentic-eng`](https://github.com/Wirasm/PRPs-agentic-eng) by Wirasm — 적응된 slash command 패턴(`/code-review`, `/plan`, `/feature-dev`)
- [`everything-claude-code`](https://github.com/affaan-m/everything-claude-code) — 다국어 README 패턴
- 6개월간 실제 프로덕션 마켓플레이스 운영 — agents/skills/hooks가 harness가 되기 전에 실전 테스트됨

## 문서

- [PLAN.md](PLAN.md) — 마스터 플랜(아키텍처 + 로드맵)
- [DECISIONS.md](DECISIONS.md) — 13개 아키텍처 결정과 근거
- [PROVENANCE.md](PROVENANCE.md) — 규율 vs 먼지 감사
- [CHANGELOG.md](CHANGELOG.md) — 버전 기록
- [docs/plugin-authoring.md](docs/plugin-authoring.md) — 플러그인 작성 방법
- [docs/upgrade-guide.md](docs/upgrade-guide.md) — `arthus-harness sync` 심층 분석
- [docs/architecture.md](docs/architecture.md) — 폴더 구조 + 플러그인 계약

## Yak-shaving 경고

> 실제 프로젝트가 아닌 arthus-harness를 2시간 이상 튜닝하고 있다면, **멈추세요**.

Harness는 수단이지 목적이 아닙니다. issue를 열고 진행하세요. `init-project` skill은 다음 프롬프트가 harness가 아닌 **제품**에 관한 것이 되도록 강제하기 위해 설계되었습니다.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cristianorj22/arthus-harness&type=Date)](https://star-history.com/#cristianorj22/arthus-harness&Date)

## 라이선스

MIT © 2026 Cristiano Moraes

---

> **🌐 번역 안내:** 이 번역은 Claude Opus 4.7에 의해 생성되었습니다. 원어민은 PR로 개선을 환영합니다. 영어 버전(`README.md`)이 진실의 출처입니다.
