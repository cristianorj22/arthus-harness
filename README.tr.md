# arthus-harness

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <strong>Türkçe</strong>
</p>

> Genel amaçlı Claude Code harness mühendislik kiti. Yeni projeleri **5 koruma katmanı** (süreç · teknik değişmezler · operasyonel ilkeler · SDD aracılığıyla sözleşmesel değişmezler · deneyim değişmezleri) ile başlatır — `go-party-venue-hub`'dan çıkarıldı.

[![npm version](https://img.shields.io/npm/v/create-arthus-harness.svg)](https://www.npmjs.com/package/create-arthus-harness)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Hızlı başlangıç

```bash
npx create-arthus-harness my-project
cd my-project
```

Sihirbaz **3 soru** sorar (preset · ilkeler · git-init) ve şunları içeren bir proje oluşturur:

- 9 uzman agent (`code-reviewer`, `typescript-reviewer`, `silent-failure-hunter`, `security-reviewer`, `a11y-architect`, `refactor-cleaner`, `code-archaeologist`, `debugger`, `product-manager`)
- 4 skill (`experience-principles`, `init-project`, `harness-doctor`, `spec-keeper`)
- 3 hook (`config-protection`, `post-edit-accumulator`, `batch-format-typecheck`)
- 5 slash komutu (`/plan`, `/feature-dev`, `/code-review`, `/refactor-clean`, `/save-session`)
- 8 doküman şablonu (ADR, RUNBOOK, SPEC, vb.)
- **5 katmanlı doküman yığını**: `MISSION.md` (teknik değişmezler) · `Docs/SPEC.md` (bileşen sözleşmeleri, Spec-Driven Development) · `Docs/sdd-guide.md` (SDD yöntemi) · `Docs/produto/PRODUTO.md` (vizyon + operasyonel ilkeler) · `Docs/produto/principios-de-experiencia.md` (deneyim değişmezleri)
- 5 işli CI workflow (lint, design-check, type-check, secrets-scan, npm-audit)
- `arthus-harness sync` için kilit dosyası `.arthus-harness/lock.json` + `baseline/`

## Bu nedir?

Cristiano, `go-party-venue-hub`'da sofistike bir Claude Code harness oluşturmak için aylar harcadı: 17 uzman agent, 12 skill, 4 hook, 7 slash komutu, 8 şablon, MCP entegrasyonları, auto-memory, design-system pipeline. Bu repo, **biçimleri** (evrensel disiplinleri) yeniden kullanılabilir bir kite çıkarır ve **içeriği** (Asaas, Veriff, Supabase RLS, Confiança/Alívio) opt-in eklentilerde bırakır.

**Job-To-Be-Done.** Yeni bir projeye başladığınızda, "hissi olan ürün" disiplininizin ve Claude Code işletim alışkanlığınızın zaten yüklenmiş olmasını istersiniz — önceki projede oraya nasıl ulaştığınızı hatırlamadan.

## Bu ne DEĞİLDİR

- ❌ React/Next/Vite boilerplate (kendi stack'inizi getirin)
- ❌ create-next-app / Yeoman / Cookiecutter (onlar ürün kodu üretir)
- ❌ SaaS şablonu / starter kit
- ❌ Çalışma zamanı bağımlılığı (tek seferlik üretici, bootstrap'tan sonra sıfır ayak izi)

## 5 koruma katmanı

> **MISSION** = teknik olarak asla kırılmaz · **SPEC** = bileşenler arası sözleşmeler · **PRODUTO §Princípios** = trade-off'lara nasıl karar verilir · **principios-de-experiencia** = duygusal olarak asla kırılmaz. Her katmanın farklı şiddeti ve sıklığı vardır — birleştirmeyin. Detaylar [`docs/architecture.md`](docs/architecture.md) içinde.

### 1. Süreç katmanı — hooks + slash commands

Her commit şunlardan geçer:

- **`config-protection.cjs`** (PreToolUse, **engelleyici**) — kullanıcının açık yetkisi olmadan `tsconfig`, `eslint`, `package.json`, `MISSION.md` vb. dosyalara yapılan düzenlemeleri engeller. Agent'ların yapılandırmayı gevşeterek hataları susturmasını önler.
- **`batch-format-typecheck.cjs`** (Stop, **lint engelleyici / tsc uyarısı**) — oturumda düzenlenen dosyalarda sonda ESLint çalıştırır. Lint hatalarında Stop'u engeller. tsc yalnızca uyarı (TS borcu artımlıdır).
- **`post-edit-accumulator.cjs`** (PostToolUse, **uyarı**) — auto-memory: düzenlenen dosyaları `~/.claude/projects/<slug>/memory/` içine kaydeder.
- **`/code-review`** slash komutu — commit'ten önce 3 reviewer'ı paralel çalıştırır.

### 2. Teknik değişmezler — MISSION.md

İskelet §1-§7 bölümleriyle gelir (Güvenlik, İdempotency, RBAC, Migrasyonlar, Kalite, Süreç). Kullanıcı scaffold sırasında röportajla TODO'ları doldurur. Eklentiler otomatik doldurur (örn., `plugin-supabase` §1'i RLS kurallarıyla doldurur).

### 3. Operasyonel ilkeler — `Docs/produto/PRODUTO.md §Princípios operacionais`

MISSION'dan farklı 3-7 uygulanabilir ilke. Her biri (a) code review'de uygulanabilir olmalı, (b) MISSION'dan farklı (trade-off'u var, gerekçeyle bozulabilir), (c) kısa olmalı.

Örnekler (şablonda yorum satırı — kendinizinkilerle değiştirin): "İnsan kontrolde" · "Varsayılan olarak alıntılanabilir" · "Sesli başarısızlık" · "LGPD-first" · "Tahmin edilebilir maliyet".

### 4. Sözleşmesel değişmezler — `Docs/SPEC.md` (Spec-Driven Development)

Bileşenler arası sözleşmelerin biçimsel spesifikasyonu — `Input → Output → Acceptance → Status`. Durum yaşam döngüsü `[STUB]` / `[DRAFT]` / `[STABLE]`. `[STABLE]`'a yıkıcı değişiklik ADR + migrasyon planı gerektirir.

`code-reviewer` agent, public surface değişikliklerinde SPEC güncellemesi olmadığında **MEDIUM** işaretler; ADR olmadan `[STABLE]`'ı kırarken **HIGH** işaretler. Yöntem [`core/Docs/sdd-guide.md.eta`](core/Docs/sdd-guide.md.eta) içinde.

### 5. Deneyim değişmezleri — `Docs/produto/principios-de-experiencia.md`

Çekirdek IP. İki strateji bir arada:

- **Strateji A (literal varsayılan).** GoParty'nin 4 çapa duyumunu (Confiança, Alívio, Clareza, Comemoração) + 5 operasyonel kuralını kelimesi kelimesine sevk eder — GoParty'ye özgü kısımları kolayca üzerine yazmak için yorumlarla işaretlenmiştir.
- **Strateji C (opt-in framework).** Boş ama tipli scaffold + manifest.yaml ile sevk eder — kendi N duyumunuzu, M kuralınızı tanımlayın; `experience-principles` skill'i dinamik olarak okur.

`experience-principles` skill'i **içerik agnostiktir** — projenizin dosyasında ne varsa onu okur. GoParty bilgisi hardcoded değildir.

## CLI komutları

```bash
# Yeni proje bootstrap
npx create-arthus-harness my-project [--preset=goparty-like|web-supabase|minimal] [--principles=A|C|both]

# arthus-harness'tan bootstrap edilmiş mevcut bir proje içinde:
arthus-harness sync                 # şablonları en son sürüme güncelle, çakışmalarda .rej
arthus-harness sync --interactive   # her çakışma için sor
arthus-harness sync --strict        # herhangi bir çakışmada başarısız (CI için)
arthus-harness doctor               # proje ile mevcut arthus sürümü arasındaki sapmayı kontrol et
arthus-harness add-plugin <name>    # mevcut projeye eklenti ekle
```

## Eklentiler (opt-in)

| Eklenti | Ne sevk eder |
|---|---|
| `design-system-pipeline` | `DESIGN.md → src/index.css` pipeline + `design:check` doğrulayıcı + `/design-check` slash komutu + `design-quality-check.cjs` hook |
| `supabase` | `database-reviewer` agent + `supabase-rls-pattern` ve `supabase-migration` skills + edge-function şablonları |
| `e2e-playwright` | `storageState` deseni + persona fixtures + `AxeBuilder` helper + Playwright yapılandırması |
| `i18n` | JSON tree doğrulayıcı + `i18n-source-of-truth` skill + locale şablonları |
| `payment-asaas` | Asaas webhook HMAC + idempotency middleware + `asaas-integration` skill |
| `journey-mapping` | `Docs/produto/jornadas/` + `journey-touch-reminder` hook |
| `mcp-code-review-graph` | code-review-graph MCP server (Tree-sitter knowledge graph) + 4 helper skill + 2 settingsHooks. `uv` + `uv tool install code-review-graph` gerektirir. |

## Dağıtım

- **Birincil:** npm paketi `create-arthus-harness` (`npx` ile kutudan çıkar çıkmaz çalışır).
- **Kaynak:** `github.com/cristianorj22/arthus-harness` — public, tags = npm sürümleri, release'ler GH Actions aracılığıyla otomatik yayımlanır.

## Sürüm yönetimi

- Snapshot kilit dosyası (`.arthus-harness/lock.json`) + `baseline/` dizini ile generator-style.
- `arthus-harness sync` kayıtlı yanıtlarınızı kullanarak şablonları yeniden render eder, kullanıcı tarafından değiştirilen dosyalarda `node-diff3` aracılığıyla **gerçek 3-way merge** uygular. Varsayılan engellemez (çakışmalarda `.rej` yazar); opt-in interaktif.
- SemVer: major bump'lar şablonu kıran değişiklikleri sinyalize eder; minor eklenti/agent ekler.

## Dokümantasyon

- [PLAN.md](PLAN.md) — master plan (mimari + roadmap)
- [DECISIONS.md](DECISIONS.md) — 13 mimari karar ve gerekçesi
- [PROVENANCE.md](PROVENANCE.md) — `go-party-venue-hub`'dan gelen (disiplin vs toz)
- [RESOLVED-QUESTIONS.md](RESOLVED-QUESTIONS.md) — çözülmüş 5 kritik karar
- [CHANGELOG.md](CHANGELOG.md) — sürüm geçmişi
- [docs/plugin-authoring.md](docs/plugin-authoring.md) — eklenti nasıl yazılır
- [docs/upgrade-guide.md](docs/upgrade-guide.md) — `arthus-harness sync` derinlemesine
- [docs/architecture.md](docs/architecture.md) — klasör yapısı + eklenti sözleşmesi

## Yak-shaving uyarısı

> Asıl proje yerine arthus-harness'ı 2 saatten fazla ayarlıyorsanız, **durun**.

Harness araçtır, amaç değil. Source repo'da issue açın ve devam edin. `init-project` skill'i, sonraki prompt'un harness değil **ürün** hakkında olmasını zorlamak için tasarlanmıştır.

## Lisans

MIT © 2026 Cristiano Moraes

---

> **🌐 Çeviri notu:** Bu çeviri Claude Opus 4.7 tarafından üretilmiştir. Anadili konuşanlar — iyileştirmeler için lütfen PR açın. İngilizce sürüm (`README.md`) gerçeğin kaynağıdır.
