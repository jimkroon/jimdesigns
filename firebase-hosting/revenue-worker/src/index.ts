import {authorize, AccessError} from './auth';
import {RevenueApi, RevenueApiError, type RevenueEnv} from './klaviyo';
import {revenueTimeframes} from '../../free/src/revenue/core';
const origins = new Set(['https://jimdesigns.nl', 'https://www.jimdesigns.nl', 'https://jimdesigns.web.app']);
export async function handle(request: Request, env: RevenueEnv, upstream: typeof fetch = fetch, cache?: Cache) {
  const origin = request.headers.get('Origin') || '';
  const headers: Record<string, string> = {'Cache-Control': 'private, no-store', 'CDN-Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', Vary: 'Origin'};
  if (origins.has(origin)) Object.assign(headers, {'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization, X-Firebase-AppCheck, Accept', 'Access-Control-Max-Age': '600'});
  const reply = (body: unknown, status = 200) => Response.json(body, {status, headers});
  if (origin && !origins.has(origin)) return reply({error: 'Geen toegang.'}, 403);
  if (request.method === 'OPTIONS') return new Response(null, {status: 204, headers});
  if (request.method !== 'GET') return reply({error: 'Methode niet toegestaan.'}, 405);
  try {
    await authorize(request, upstream);
    const url = new URL(request.url);
    if (url.pathname !== '/revenue') return reply({error: 'Pagina niet gevonden.'}, 404);
    if (url.search.length > 4096) return reply({error: 'Ongeldige aanvraag.'}, 400);
    if (url.searchParams.get('part') === 'status') return reply({connected: !!env.KLAVIYO_REPORTING_KEY});
    const api = new RevenueApi(env, cache, upstream);
    const metadata = await api.metadata();
    if (url.searchParams.get('part') === 'metadata') return reply({metadata});
    const type = url.searchParams.get('part');
    if (type !== 'campaign' && type !== 'flow') return reply({error: 'Ongeldig rapporttype.'}, 400);
    const chunks = revenueTimeframes(url.searchParams.get('start') || '', url.searchParams.get('end') || '', metadata.timezone);
    const index = Number(url.searchParams.get('chunk') || 0);
    if (!Number.isInteger(index) || !chunks[index]) return reply({error: 'Ongeldige rapportperiode.'}, 400);
    const result = await api.reportPage(type, chunks[index].start, chunks[index].end, metadata.metricId, url.searchParams.get('cursor') || '');
    return reply({...result.value, fetchedAt: result.fetchedAt, requestDelayMs: result.cached ? 0 : 31000});
  } catch (error) {
    if (error instanceof AccessError) return reply({error: error.status === 503 ? 'Inloggen kon tijdelijk niet worden gecontroleerd.' : error.message}, error.status);
    if (error instanceof RevenueApiError) return reply({error: error.message, retryAfter: error.retryAfter}, error.status);
    if (error instanceof Error && error.message.startsWith('Kies')) return reply({error: error.message}, 400);
    return reply({error: 'Ophalen is tijdelijk niet gelukt. Er is geen totaal berekend.'}, 502);
  }
}
export default {fetch(request: Request, env: RevenueEnv) { return handle(request, env, fetch, (caches as unknown as {default: Cache}).default); }};
