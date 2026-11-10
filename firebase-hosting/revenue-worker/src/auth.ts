const PROJECT = 'jimdesigns';
const OWNER = 'jimdesigns-owner';
const ISSUER = `https://securetoken.google.com/${PROJECT}`;
const JWKS = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
let keyCache: {expires: number; keys: JsonWebKey[]} | undefined;
export class AccessError extends Error { constructor(public status = 401) { super('Log opnieuw in op je privéaccount.'); } }
function decode(part: string) {
  try { return Uint8Array.from(atob(part.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)); }
  catch { throw new AccessError(); }
}
export async function authorize(request: Request, upstream: typeof fetch = fetch, now = Date.now()) {
  const raw = request.headers.get('Authorization') || '';
  if (!/^Bearer [A-Za-z0-9._-]{1,8192}$/.test(raw)) throw new AccessError();
  const token = raw.slice(7), parts = token.split('.');
  if (parts.length !== 3) throw new AccessError();
  let header, claims;
  try { header = JSON.parse(new TextDecoder().decode(decode(parts[0]))); claims = JSON.parse(new TextDecoder().decode(decode(parts[1]))); } catch { throw new AccessError(); }
  const seconds = Math.floor(now / 1000);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string' || claims.iss !== ISSUER || claims.aud !== PROJECT || claims.sub !== OWNER ||
      !Number.isInteger(claims.exp) || claims.exp <= seconds || !Number.isInteger(claims.iat) || claims.iat > seconds + 30 ||
      !Number.isInteger(claims.auth_time) || claims.auth_time > seconds + 30 || seconds - claims.auth_time >= 28800) throw new AccessError();
  if (!keyCache || keyCache.expires <= now) {
    const response = await upstream(JWKS, {signal: AbortSignal.timeout(8000), redirect: 'error'});
    if (!response.ok) throw new AccessError(503);
    const body = await response.json() as {keys: JsonWebKey[]};
    if (!Array.isArray(body.keys)) throw new AccessError(503);
    keyCache = {keys: body.keys, expires: now + 3600000};
  }
  const jwk = keyCache.keys.find(key => (key as JsonWebKey & {kid: string}).kid === header.kid);
  if (!jwk) throw new AccessError();
  let valid = false;
  try {
    const key = await crypto.subtle.importKey('jwk', jwk, {name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256'}, false, ['verify']);
    valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decode(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
  } catch { throw new AccessError(); }
  if (!valid) throw new AccessError();
  // Firestore applies the existing owner rules. Check its session heartbeat before every cache hit too.
  const headers: Record<string, string> = {Authorization: raw};
  const appCheck = request.headers.get('X-Firebase-AppCheck');
  if (appCheck) headers['X-Firebase-AppCheck'] = appCheck;
  const response = await upstream(`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/sessions/${OWNER}-${claims.auth_time}`, {headers, signal: AbortSignal.timeout(8000), redirect: 'error'});
  if (!response.ok) throw new AccessError(response.status >= 500 ? 503 : 401);
  const session = await response.json() as {fields?: {auth_time?: {integerValue?: string}; last_seen?: {timestampValue?: string}}};
  const seen = Date.parse(session.fields?.last_seen?.timestampValue || '');
  if (Number(session.fields?.auth_time?.integerValue) !== claims.auth_time || !Number.isFinite(seen) || seen > now + 30000 || now - seen >= 1800000) throw new AccessError();
  return OWNER;
}
