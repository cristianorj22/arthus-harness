/**
 * Asaas webhook handler — token validation + idempotency + log redaction.
 *
 * Treat this as security-critical. A bypass here means anyone with the
 * function URL can post fake "payment received" events.
 *
 * See `.claude/skills/asaas-integration/SKILL.md` for the full invariants.
 *
 * Project: <%= projectName %>
 */

import { isReplay, markProcessed } from './idempotency';

interface AsaasWebhookPayload {
  event: string;
  payment?: {
    id: string;
    status: string;
    value: number;
    customer?: {
      name?: string;
      cpfCnpj?: string;
      email?: string;
    };
    creditCard?: {
      creditCardNumber?: string;
      creditCardBrand?: string;
    };
  };
  [key: string]: unknown;
}

const ASAAS_WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN || '';

/**
 * Validates the request and returns the parsed payload, or `null` if the
 * request is unauthenticated. Caller is responsible for the HTTP response.
 */
export async function validateAsaasWebhook(req: Request): Promise<AsaasWebhookPayload | null> {
  const signature = req.headers.get('asaas-access-token') || '';
  if (!signature || !ASAAS_WEBHOOK_TOKEN || signature !== ASAAS_WEBHOOK_TOKEN) {
    return null;
  }

  // When Asaas adopts HMAC signing, swap the token check for:
  //
  //   const body = await req.text();
  //   const sig = req.headers.get('x-asaas-signature') || '';
  //   const computed = createHmac('sha256', secret).update(body).digest('hex');
  //   if (!timingSafeEqual(Buffer.from(sig), Buffer.from(computed))) return null;

  const payload = (await req.json()) as AsaasWebhookPayload;
  return payload;
}

/**
 * Top-level handler. Wire this into your edge function / route.
 *
 * Returns 200 on success and on idempotent replays (so Asaas stops retrying).
 * Returns 401 on missing/wrong token, 5xx only for transient failures.
 */
export async function handleAsaasWebhook(req: Request): Promise<Response> {
  const payload = await validateAsaasWebhook(req);
  if (!payload) {
    return new Response('Unauthorised', { status: 401 });
  }

  // eslint-disable-next-line no-console
  console.log('[asaas-webhook]', JSON.stringify(redactForLog(payload)));

  const paymentId = payload.payment?.id;
  if (!paymentId) {
    // Event without a payment ID — ack and move on.
    return new Response('ok', { status: 200 });
  }

  if (await isReplay(paymentId, payload.event)) {
    return new Response('ok (replay)', { status: 200 });
  }

  try {
    // TODO(arthus-harness): dispatch to your domain handler.
    //   - PAYMENT_CONFIRMED → mark booking confirmed
    //   - PAYMENT_RECEIVED → release escrow on event date
    //   - PAYMENT_REFUNDED → mark refunded
    await markProcessed(paymentId, payload.event);
    return new Response('ok', { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[asaas-webhook] handler error', err);
    return new Response('error', { status: 500 });
  }
}

/**
 * Redact PII before logging. Card number, CPF, email all get scrubbed.
 */
function redactForLog(payload: AsaasWebhookPayload): unknown {
  const customer = payload.payment?.customer;
  const creditCard = payload.payment?.creditCard;
  return {
    event: payload.event,
    paymentId: payload.payment?.id,
    status: payload.payment?.status,
    value: payload.payment?.value,
    customer: customer
      ? {
          name: customer.name,
          cpfCnpj: redactCpf(customer.cpfCnpj),
          email: redactEmail(customer.email),
        }
      : undefined,
    creditCard: creditCard
      ? {
          lastFour: creditCard.creditCardNumber?.slice(-4),
          brand: creditCard.creditCardBrand,
        }
      : undefined,
  };
}

function redactCpf(cpf?: string): string | undefined {
  if (!cpf) return undefined;
  if (cpf.length < 5) return '***';
  return `${cpf.slice(0, 3)}***${cpf.slice(-2)}`;
}

function redactEmail(email?: string): string | undefined {
  if (!email) return undefined;
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 2)}***@${domain}`;
}
