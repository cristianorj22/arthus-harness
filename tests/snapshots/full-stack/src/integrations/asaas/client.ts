/**
 * Asaas client — env-driven, with timeout + error propagation.
 *
 * Invariants enforced (see `.claude/skills/asaas-integration/SKILL.md`):
 *   - Outbound calls have a 5s timeout (no hangs on Asaas slowness).
 *   - Errors propagate — never swallowed.
 *   - Amount is computed by callers, never trusted from a client request.
 *
 * Project: <%= projectName %>
 */

const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';

if (!ASAAS_API_KEY) {
  // Don't throw at module load — let the first call surface a clear error.
  // eslint-disable-next-line no-console
  console.warn('[asaas] ASAAS_API_KEY missing — calls will fail.');
}

const DEFAULT_TIMEOUT_MS = 5000;

export interface AsaasRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  timeoutMs?: number;
}

export class AsaasError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly raw?: unknown,
  ) {
    super(message);
    this.name = 'AsaasError';
  }
}

export async function asaasRequest<T = unknown>(
  endpoint: string,
  opts: AsaasRequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, timeoutMs = DEFAULT_TIMEOUT_MS } = opts;
  const url = `${ASAAS_API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        access_token: ASAAS_API_KEY,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    const parsed = text ? safeJsonParse(text) : null;

    if (!res.ok) {
      const code =
        (parsed as { errors?: { code?: string }[] })?.errors?.[0]?.code ||
        `HTTP_${res.status}`;
      const description =
        (parsed as { errors?: { description?: string }[] })?.errors?.[0]?.description ||
        text.slice(0, 500);
      throw new AsaasError(description, res.status, code, parsed);
    }

    return parsed as T;
  } catch (err) {
    if (err instanceof AsaasError) throw err;
    if ((err as { name?: string }).name === 'AbortError') {
      throw new AsaasError('Asaas request timed out', 408, 'TIMEOUT');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

function safeJsonParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

/**
 * Map Asaas error codes to user-facing pt-BR copy.
 * Never expose raw codes to the user — log them server-side instead.
 */
const ASAAS_ERRORS: Record<string, string> = {
  INSUFFICIENT_FUNDS: 'Cartão sem saldo. Tente outro?',
  INVALID_CARD_NUMBER: 'Número do cartão parece inválido. Confira os dígitos.',
  CARD_DECLINED: 'Banco recusou o pagamento. Tente outro cartão ou PIX.',
  EXPIRED_CARD: 'Esse cartão venceu. Use outro?',
  INVALID_CVV: 'Confira o código de segurança do cartão.',
  INVALID_HOLDER_NAME: 'Nome no cartão precisa bater com o cadastro.',
  BLOCKED_CARD: 'O banco bloqueou esse cartão. Tente PIX ou outro cartão.',
  INVALID_CPF: 'CPF inválido. Confira os dígitos.',
  TIMEOUT: 'Asaas demorou demais. Tenta de novo?',
};

export function mapAsaasError(code: string | undefined): string {
  if (!code) return 'Não rolou. Tente novamente em alguns instantes.';
  return ASAAS_ERRORS[code] ?? 'Não rolou. Tente novamente em alguns instantes.';
}
