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

> **Önceki projede aylarca ayarladığınız disiplin, bir sonraki projeye 30 saniyede yüklenir.**

[![npm version](https://img.shields.io/npm/v/create-arthus-harness.svg)](https://www.npmjs.com/package/create-arthus-harness)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`arthus-harness`, **5 koruma katmanı** (agents, skills, hooks, slash commands, doküman şablonları, operasyonel ilkeler ve duygusal değişmezler) önceden yüklenmiş yeni projeleri başlatan bir Claude Code scaffolder'ıdır. Stack boilerplate değildir. SaaS starter kit değildir. Bu sizin **Claude Code işletim biçiminiz**, bir kez çalışan, projeyi disiplinle çalışmaya hazır hale getiren ve kaybolan tek bir `npx` komutuna paketlenmiştir. Bir sonraki projeye, bir önceki projenin bittiği yerin **üstünden** başlarsınız — sıfırdan değil.

## Hızlı başlangıç

```bash
npx create-arthus-harness my-project
cd my-project
```

Göreceğiniz şey:

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

## Neden var

Bir projede Claude Code'unuzu ayarlamak için üç ay harcarsınız. Sessiz bug yakalayan bir agent yazarsınız. Claude'un lint'i geçirmek için `tsconfig`'i "düzeltmesini" engelleyen bir hook yapılandırırsınız. Reviewer'ın uygulamayı öğrendiği UX kurallarını belgeleyiniz. Her commit'ten önce 3 reviewer'ı paralel çalıştıran bir slash command oluşturursunuz. Güzel çalışıyor. Her parçanın ne yaptığını ve neden orada olduğunu biliyorsunuz.

Sonra yeni bir proje açarsınız.

Ve orada Claude Code yine fabrika ayarlarında. Agents yok. Hooks yok. Sizi aynı RLS hatasını 4 kez yapmaktan koruyan `MISSION.md` yok. Her hata mesajının kullanıcıyı suçlamak yerine bir sonraki adımı söylemesini sağlayan ilkeler dosyası yok. Bakıyorsunuz, iç çekiyorsunuz ve eski projeden manuel olarak `.claude/` kopyalamaya başlıyorsunuz — içeriğin yarısının o domain'e özgü olduğunu ve yenisini kirleteceğini, diğer yarısının evrensel olduğunu ama ayırmak için enerjiniz olmadığını biliyorsunuz.

Sorun bu. Claude Code **projeleri hızlı oluşturmanıza** olanak tanır, ancak disiplin sizinle birlikte yolculuk etmez. Her yeni proje dünya ortalamasına geriler. Her projede daha iyi olmanın bileşik etkisi gerçekleşmez — veya **tek bir proje içinde** gerçekleşir ve o öldüğünde ölür.

`arthus-harness`, bunun evrensel kısmını (**biçimler**: agents, hooks, skills, şablonlar) çıkarır ve domain'e özgü içeriği opt-in olarak bırakır (eklentiler aracılığıyla **içerik**). `npx create-arthus-harness`'i bir kez çalıştırırsınız, 3 soruyu yanıtlarsınız ve yeni proje 9 agents, 4 skills, 3 hooks, 5 slash commands ve 5 katmanlı doküman yığını zaten yüklenmiş olarak doğar. Sabit bir şablon değildir: lockfile, baseline, gerçek 3-way merge vardır — harness geliştiğinde, çalışmanızı kaybetmeden iyileştirmeleri çekersiniz.

İçgörü basit: her yeni proje, bir öncekinin bittiği yerin **üstünden** başlamalıdır. Panik içinde dosyaları kopyalayarak değil. Aynı dersleri yeniden öğrenerek değil. Disiplin, bileşik olan tek şeydir — ve sadece sizinle birlikte yolculuk eden bir yere paketlerseniz bileşik olur.

## Çözdüğü sorunlar

### 🔥 Her yeni projede tekrarlanan kurulum

> **Tanıdık geliyor mu?**
>
> "Yeni bir projeye başladım ve eski projeden `.claude/agents/`'i manuel kopyalamak için 4 saat harcadım, dosya bazında neyin evrensel olduğuna ve neyin o domain'e özgü olduğuna karar verdim. Bittiğinde, gerçek özelliği başlatacak enerjim kalmamıştı."

**`arthus-harness` nasıl çözer:** `npx create-arthus-harness my-project` + 3 soru. 30 saniye sonra 9 agents, 4 skills, 3 hooks, 5 slash commands yüklü — sadece evrensel olanlar. Domain'e özgü içerik eklentiler aracılığıyla opt-in.

### 🔥 Yapılandırmayı gevşeterek hatayı susturan Agent

> **Tanıdık geliyor mu?**
>
> "Claude build'i geçirmekte zorlanıyordu. Diff'i incelediğimde, `tsconfig.json`'a girdiğini ve `strictNullChecks`'i kapattığını fark ettim. Build geçti, evet. 200 sessiz hatayla birlikte. Production'da 2 hafta sonra keşfettim."

**`arthus-harness` nasıl çözer:** `config-protection.cjs` hook PreToolUse ve **engelleyici** — `tsconfig`, `eslint`, `package.json`, `MISSION.md`, migrations'a herhangi bir Edit/Write açık yetki isteğiyle kesilir. Claude, yapılandırmayı gevşeterek hataları görmeden susturamaz.

### 🔥 Oturumlar arası bellek yokluğu

> **Tanıdık geliyor mu?**
>
> "Her yeni oturumda Claude'a mevcut durumu açıklamak için 10 dakika kaybediyorum: hangi özellikteyim, Cuma günü ne karar verdik, neden bariz yaklaşımı kullanmadık. Haftada üç oturum, bu yarım saat israf — ve Claude hâlâ zaten elediğimiz bir yola gidiyor."

**`arthus-harness` nasıl çözer:** `post-edit-accumulator` hook, oturum başına düzenlenen dosyaları auto-memory'ye kaydeder. Slash command `/save-session`, durum anlık görüntüsünü (branch, son commit, kararlar, sonraki adım) kaydeder ve sonraki oturumun başında okunur. Doküman şablonları (ADR, RUNBOOK, SPEC), mimari kararların yalnızca kafanızda yaşamaması için bir yer sağlar.

### 🔥 Tutarlı checklist olmayan PR

> **Tanıdık geliyor mu?**
>
> "Bugün merge etmeden önce PR'ımı review ettim ve 3 şey yakaladım. Geçen hafta aynı boyutta başka bir PR'ı review ettim ve hiçbir şey görmeden merge ettim. Kötü niyet değildi — kriter ruh halime göre değişti. Ne kadar dinlendiğime bağlı olan bir review'a güvenemezsiniz."

**`arthus-harness` nasıl çözer:** `/code-review` slash command birden fazla reviewer'ı paralel çağırır (`code-reviewer`, `silent-failure-hunter`, `security-reviewer`, `typescript-reviewer`, `a11y-architect`) — her biri kendi checklist'ine sahip. Ruh halinize bağlı değil. Reviewer'lar her PR'da daha keskin hale gelerek proje başına memory'ye desenler biriktirir.

### 🔥 Her projede tekrarlanan UX hataları

> **Tanıdık geliyor mu?**
>
> "Tekrar bir hata mesajının geçmesine izin verdim 'Bir şeyler ters gitti. Tekrar deneyin.' — neyin yanlış gittiğini, sonraki adımı, kullanıcının mı sistemin mi hatası olduğunu söylemeden. Bu yıl 4. kez bunu yalnızca son review'da hatırlıyorum, her şey zaten production'da."

**`arthus-harness` nasıl çözer:** Layer 5 — `principios-de-experiencia.md` 4 çapa duyumu + 5 operasyonel kuralla sevk eder. `experience-principles` skill içerik agnostiktir ve UI/copy dosyalarında otomatik tetiklenir. Kurallarınızı tanımlarsınız; skill uygulanmasını garanti eder.

### 🔥 Kaybolan mimari kararlar

> **Tanıdık geliyor mu?**
>
> "Üç ay sonra, biri PR'da soruyor: 'Neden X kullanmadın?'. Kimse hatırlamıyor. O zamanlar hatırladım, kafamda yazdım, bariz olduğunu düşündüm. Eylemsizlikteydim, kaydetmedim. Şimdi her şeyi tekrar tartışacağız."

**`arthus-harness` nasıl çözer:** `ADR.md` şablonu varsayılan olarak sevk edilir. Layer 4 (Spec-Driven Development), `Docs/SPEC.md`'yi bileşen sözleşmeleri için resmi yer yapar. Biri ADR olmadan `[STABLE]`'ı kırarsa, `code-reviewer` HIGH olarak işaretler.

### 🔥 Kod ve doküman arası sapma

> **Tanıdık geliyor mu?**
>
> "Ödeme modülünü refactor ettim, `Docs/arquitetura/`'yi güncellemeyi unuttum. Altı hafta sonra yeni bir dev katıldı, dokümanı okudu, takip etti ve değişen kodda kayboldu. Farkına varmadan onboarding darboğazı oldum."

**`arthus-harness` nasıl çözer:** Layer 4 (SPEC) + `code-reviewer` agent, public surface SPEC güncellemesi olmadan değiştiğinde **MEDIUM** işaretler. `spec-keeper` skill `Docs/SPEC.md`'yi canlı tutar ve sözleşme başına durum (`[STUB]` / `[DRAFT]` / `[STABLE]`) gerektirir. Güncel olmayan dokümanlar review'dan geçemez — memory leak değil, commit sınırı olur.

## Bunun size açtıkları

### 📈 Projeler arası bileşik

**Önce:** Proje A'da öğrenilen dersler orada öldü.
**Şimdi:** Harness iyileştirmeleri olurlar. `arthus-harness sync`, çalışmanızı kaybetmeden güncellemeleri canlı bir projeye çeker. Her yeni proje önceki projenin **üstünden** başlar.

### 📈 Disiplin gerilemesi olmadan multi-project

**Önce:** 3 paralel proje = 3 farklı disiplin seviyesi.
**Şimdi:** Hepsi aynı doküman yığını, aynı engelleyici hook'lar, aynı reviewer'larla doğar. Solo dev "gerileme vergisi" olmadan N projeye ölçeklenir.

### 📈 Ağır araç olmadan Spec-Driven Development

**Önce:** SDD, OpenAPI generators, Stoplight, özel QA ekipleri olan kurumsal bir şey gibi görünüyordu.
**Şimdi:** `Docs/SPEC.md`, `Input → Output → Acceptance → Status` tablosu olan Markdown'dur. 3 seviyeli durum yaşam döngüsü. SDD nihayet solo projeye sığar.

### 📈 Tören değil korkuluk olarak sözleşmeler

**Önce:** "Sözleşmeyi formalleştirelim" kimsenin okumadığı bir Notion dokümanı + toplantı oldu.
**Şimdi:** Sözleşme kodla birlikte, aynı PR'da yaşar. `[STABLE]`'ı kırmak ADR gerektirir. `[DRAFT]`'ı kırmak ücretsiz. Formalite olgunlukla orantılı.

### 📈 Şişirilmiş starter kit yerine opt-in eklentiler

**Önce:** SaaS şablonu, sadece yarısını kullansanız bile her şeyle birlikte sevk ederdi.
**Şimdi:** Core 9 evrensel agent sevk eder. 7 eklenti opt-in. İnce ayak izi, Claude için temiz bağlam.

### 📈 UX ekibi olmadan tutarlı UX

**Önce:** Temel UX kuralları yalnızca kafanızda yaşardı.
**Şimdi:** Layer 5, otomatik tetiklenen skill aracılığıyla kurallarınızı otomatik code review'a dönüştürür. UX ekibi olmadan UX ekibi kalitesi.

## Bu kim için

### ✅ Aşağıdaki gibiyseniz `arthus-harness` kullanın

- Claude Code'u, varsayılan kurulumda neyin eksik olduğu hakkında görüş sahibi olacak kadar işlettiniz — kendi agents'ınız, engelleyici hooks'lar, `paths:` scoping ile skills'ler, özel slash commands.
- Solo dev veya ayrı QA / UX / DevOps olmayan küçük ekipsiniz (≤5 kişi) ve bu disiplinleri projede kod olarak yüklemek istiyorsunuz.
- Birden fazla paralel projeye dokunuyorsunuz ve her birinin ortalama seviyeye gerilemesinden bıktınız.
- Teknik disiplin ve UX/UI özeninin farklı türde değişmezler olduğuna inanıyorsunuz — ve bu ayrımı (ayrı katmanlar, ayrı şiddetler) onurlandıran bir araç istiyorsunuz.
- Mimari kararların ADR'ye, sözleşmelerin SPEC'e ve ilkelerin otomatik reviewer'a dönüşmesini istiyorsunuz — yalnızca kafanızda yaşamak yerine.

### ❌ Aşağıdaki gibiyseniz KULLANMAYIN

- auth + landing + dashboard hazır React/Next/Vite şablonu arıyorsunuz. `arthus-harness` stack-agnostiktir — stack'i siz getirirsiniz.
- agent, hook, skill, slash command'in ne olduğunu anlama çabası göstermeden "Claude Code ile vibe etmeye başlamak" istiyorsunuz. Harness 1. günkü kişi için aşırıdır; önce Claude Code'da üretken olun, sonra disiplininizi paketlemeye gelin.
- Özel QA/SRE/DevRel olan büyük bir ekipte çalışıyorsunuz — bu insanlar harness'in kod olarak kapsadığı şeyleri zaten dışarıdan sağlıyor.
- Minimum törene tahammül edemezsiniz. 5 katman `MISSION` / `SPEC` / ilkeleri güncel tutma alışkanlığı gerektirir. "Her şeyi merge etmek için 0 sürtünme" istiyorsanız, harness sizi rahatsız eder — kasıtlı olarak.

## 5 koruma katmanı

| # | Katman | Doküman | İhlalin şiddeti |
|---|---|---|---|
| 1 | **Süreç** | hooks `.cjs` + slash commands | Engelleyici (exit 2) |
| 2 | **Teknik** (pazarlık edilemez) | `MISSION.md` | Olay seviyesi (anahtar rotasyonu, post-mortem) |
| 3 | **Operasyonel ilkeler** | `PRODUTO.md §Princípios` | Tartışma (PR'da alıntıla) |
| 4 | **Sözleşmesel (SDD)** | `SPEC.md` + `sdd-guide.md` | Review (PR reddedildi) |
| 5 | **Duygusal** | `principios-de-experiencia.md` | UI/copy'de skill otomatik tetikleme |

Her katmanın farklı şiddeti ve sıklığı vardır — birleştirmeyin. Detaylar [`docs/architecture.md`](docs/architecture.md) içinde.

## CLI komutları

```bash
# Yeni proje bootstrap
npx create-arthus-harness my-project
# → 30 saniye, 3 soru, Claude Code'u disiplinle kullanmaya hazır proje

# Harness geliştiğinde mevcut projeyi güncelle
arthus-harness sync
# → 3-way merge: dokunulmayan dosyalar otomatik güncellenir; değiştirilenler .rej alır

# Sapmayı teşhis et
arthus-harness doctor
# → mevcut vs yüklü sürüm + eklentiler + eksik dosyalar raporu

# Mevcut projeye eklenti ekle
arthus-harness add-plugin supabase
# → eklenti katkıları .claude/ + package.json + .env.example'a merged
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

## Karşılaştırma

| | `arthus-harness` | `create-t3-app` | `cookiecutter` | manuel `cp -r` |
|---|---|---|---|---|
| `.claude/` scaffold | ✅ | ❌ | ❌ | ✅ (manual) |
| Ürün kodu scaffold | ❌ | ✅ | ✅ | ✅ |
| 3-way merge ile güncellenebilir (`sync`) | ✅ | ❌ | ❌ | ❌ |
| Opt-in eklentiler | ✅ | ⚠️ via opts | ⚠️ via hooks | ❌ |
| Stack-agnostic | ✅ | ❌ (Next-only) | ✅ | ✅ |
| 5 katmanlı doküman yığını | ✅ | ❌ | ❌ | ❌ |

## Devlerin omuzlarında

- [`create-t3-app`](https://create.t3.gg) — CLI scaffolder deseni + opinionated felsefe
- [`cookiecutter`](https://cookiecutter.readthedocs.io) — şablon yaşam döngüsü + hook sistemi ilhamı
- [Anthropic Skills](https://github.com/anthropics/skills) — skill format spesifikasyonu
- [`PRPs-agentic-eng`](https://github.com/Wirasm/PRPs-agentic-eng) by Wirasm — uyarlanan slash komut desenleri (`/code-review`, `/plan`, `/feature-dev`)
- [`everything-claude-code`](https://github.com/affaan-m/everything-claude-code) — çok dilli README deseni
- 6 ay gerçek production marketplace'i çalıştırma — agents/skills/hooks harness olmadan önce gerçek savaş testinden geçti

## Dokümantasyon

- [PLAN.md](PLAN.md) — master plan (mimari + roadmap)
- [DECISIONS.md](DECISIONS.md) — 13 mimari karar ve gerekçesi
- [PROVENANCE.md](PROVENANCE.md) — disiplin vs toz denetimi
- [CHANGELOG.md](CHANGELOG.md) — sürüm geçmişi
- [docs/plugin-authoring.md](docs/plugin-authoring.md) — eklenti nasıl yazılır
- [docs/upgrade-guide.md](docs/upgrade-guide.md) — `arthus-harness sync` derinlemesine
- [docs/architecture.md](docs/architecture.md) — klasör yapısı + eklenti sözleşmesi

## Yak-shaving uyarısı

> Asıl proje yerine arthus-harness'ı 2 saatten fazla ayarlıyorsanız, **durun**.

Harness araçtır, amaç değil. issue açın ve devam edin. `init-project` skill, sonraki prompt'un harness değil **ürün** hakkında olmasını zorlamak için tasarlanmıştır.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cristianorj22/arthus-harness&type=Date)](https://star-history.com/#cristianorj22/arthus-harness&Date)

## Lisans

MIT © 2026 Cristiano Moraes

---

> **🌐 Çeviri notu:** Bu çeviri Claude Opus 4.7 tarafından üretilmiştir. Anadili konuşanlar — iyileştirmeler için lütfen PR açın. İngilizce sürüm (`README.md`) gerçeğin kaynağıdır.
