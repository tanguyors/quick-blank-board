/**
 * Envoi via l’API HTTP/2 Apple Push Notification service (APNs).
 * @see https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns
 */
import { SignJWT, importPKCS8 } from 'npm:jose@5.2.3'

const APNS_PROD = 'https://api.push.apple.com'
const APNS_SANDBOX = 'https://api.sandbox.push.apple.com'

function getPem(): string | null {
  const raw = Deno.env.get('APNS_PRIVATE_KEY')
  if (!raw) return null
  return raw.replace(/\\n/g, '\n').trim()
}

export function apnsConfigured(): boolean {
  return Boolean(
    Deno.env.get('APNS_KEY_ID') &&
      Deno.env.get('APNS_TEAM_ID') &&
      getPem(),
  )
}

async function signApnsJwt(): Promise<string> {
  const keyId = Deno.env.get('APNS_KEY_ID')!
  const teamId = Deno.env.get('APNS_TEAM_ID')!
  const pem = getPem()!
  const key = await importPKCS8(pem, 'ES256')
  return await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt()
    .sign(key)
}

export type ApnsSendResult =
  | { ok: true; status: number; apnsId?: string }
  | { ok: false; status: number; reason: string; raw: string }

/**
 * @param deviceToken — jeton hex renvoyé par Capacitor sur iOS (sans espaces)
 */
export async function sendApnsAlert(args: {
  deviceToken: string
  title: string
  body: string
  bundleId?: string
  customData?: Record<string, unknown>
}): Promise<ApnsSendResult> {
  const bundleId = args.bundleId ?? Deno.env.get('APNS_BUNDLE_ID') ?? 'com.somagate.app'
  const useSandbox = Deno.env.get('APNS_USE_SANDBOX') === 'true'
  const base = useSandbox ? APNS_SANDBOX : APNS_PROD
  const token = args.deviceToken.replace(/\s/g, '')
  const url = `${base}/3/device/${token}`

  const jwt = await signApnsJwt()

  const payload: Record<string, unknown> = {
    aps: {
      alert: { title: args.title, body: args.body },
      sound: 'default',
    },
  }
  if (args.customData) {
    Object.assign(payload, args.customData)
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `bearer ${jwt}`,
      'apns-topic': bundleId,
      'apns-push-type': 'alert',
      'apns-priority': '10',
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  let reason = text
  try {
    const j = JSON.parse(text) as { reason?: string }
    if (j.reason) reason = j.reason
  } catch {
    /* ignore */
  }

  const apnsId = res.headers.get('apns-id') ?? undefined

  if (res.ok) {
    return { ok: true, status: res.status, apnsId }
  }
  return { ok: false, status: res.status, reason, raw: text }
}
