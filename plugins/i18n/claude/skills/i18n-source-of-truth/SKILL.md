---
name: i18n-source-of-truth
description: Multi-locale invariants — single source-of-truth file, strict parity, glossary discipline, no string concatenation. Use when adding any user-facing string or modifying locale files.
allowed-tools: ["Read", "Grep", "Glob"]
paths: ["src/locales/**", "src/components/**/*.{ts,tsx}", "src/pages/**/*.{ts,tsx}", "src/app/**/*.{ts,tsx}"]
version: 1.0
priority: HIGH
---

# i18n — source-of-truth pattern

> Generic version of the invariants behind any multi-locale product. Adapt the source locale and glossary terms to your domain.

## The five rules

1. **One file is the source of truth.** Convention: the locale that ships first (commonly `en.json` or your product's primary language). Every new key starts there.
2. **Strict parity.** Every key in the source must exist in every other locale. No orphan keys anywhere.
3. **No partial translations.** Adding a key only to 2 of 3 locales breaks the invariant. All locales or none.
4. **Pre-commit validator.** `scripts/check_i18n.mjs` (run via `npm run i18n:check`) compares key trees and fails on drift. Without this, parity won't survive a sprint.
5. **No string concatenation.** Use ICU placeholders: `t('msg', { count })`, never `t('a') + count + t('b')`. Word order varies by language.

## Source-of-truth file

The default source is `pt-BR.json`. Override via:

- `harness.config.json`:
  ```json
  { "i18n": { "source": "en.json" } }
  ```
- Or env var: `I18N_SOURCE=en.json npm run i18n:check`

## Key naming

Flat with dots — `<domain>.<surface>.<element>[.<modifier>]`:

```
auth.login.button.submit
auth.login.error.invalidCredentials
dashboard.metric.totalRevenue
checkout.review.headline
```

Don't use:

- camelCase keys (`loginSubmit`) — keep flat with dots.
- generic keys (`error1`, `text2`) — must be domain-tagged.

## ICU pluralization

Use `{count, plural, ...}`:

```json
{
  "cart.items": "{count, plural, =0 {your cart is empty} one {# item} other {# items}}",
  "results.count": "{count, plural, =0 {no results} one {# result} other {# results}}"
}
```

Each language has its own plural categories. Brazilian Portuguese uses `one` for 1 and `other` for everything else; languages like Russian or Polish have additional categories. The translator handles that — your job is to provide ICU placeholders, not English-shaped strings.

## Intl formatting

Numbers, currencies, dates — never hardcode. Always `Intl`:

```typescript
new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(850);
new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date);
```

Always pass the **detected locale**, not a hardcoded one:

```typescript
const locale = i18n.language || navigator.language || DEFAULT_LOCALE;
```

## Component contract

```tsx
import { useTranslation } from 'react-i18next';

function ProductCard({ product }: { product: Product }) {
  const { t, i18n } = useTranslation();
  const formatPrice = new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <article>
      <h3>{product.title}</h3>                                {/* dynamic data — not translated */}
      <p>{t('product.price', { price: formatPrice.format(product.price) })}</p>
      <p>{t('product.stock', { count: product.stock })}</p>   {/* ICU plural */}
    </article>
  );
}
```

User-generated content (titles, names, descriptions) is **NOT** translated — only the static UI shell.

## Glossary

Domain jargon must be documented and followed verbatim. Google-translate-style literal renderings break trust ("Anfitrião" → "host owner" reads alien to a Brazilian Portuguese user).

> TODO(arthus-harness): document your glossary here. Example structure below.

| Concept | en | pt-BR | es |
|---|---|---|---|
| (your term) | (en form) | (pt-BR form) | (es form) |

Source it once — typically in `Docs/design-system/brand/glossary.md` — and reference from this skill.

## Common mistakes

- ❌ `t('prefix') + ' ' + count + ' ' + t('suffix')`. Use ICU placeholders.
- ❌ Adding a key only to the source locale (when wired). The validator catches; better to mirror immediately.
- ❌ Hardcoding currency prefix (`"$"`, `"R$"`) in JSX. Use `Intl.NumberFormat`.
- ❌ Translating user-generated content. Don't — that breaks correctness.
- ❌ Paraphrasing glossary terms. The glossary IS the contract.

## Validator

Run before commit:

```bash
npm run i18n:check
```

Skips silently when `src/locales/` doesn't exist. When wired, fails on:

- Missing keys in non-source locales.
- Orphan keys (in non-source but not in source).

## See also

- `Docs/design-system/patterns/i18n.md` — full pattern + library setup
- `~/.claude/rules/i18n-source-of-truth.md` — user's global rule (if applicable)
