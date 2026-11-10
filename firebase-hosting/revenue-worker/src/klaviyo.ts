import {validRevenueDate} from '../../free/src/revenue/core';
import type {RevenueMetadata, RevenueResult} from '../../free/src/revenue/core';
export type RevenueEnv = {KLAVIYO_REPORTING_KEY?: string; KLAVIYO_ORDER_METRIC_ID?: string; KLAVIYO_WELCOME_FLOW_IDS?: string};
export class RevenueApiError extends Error {
  constructor(message: string, public status = 502, public retryAfter = 0) { super(message); }
}
type ApiItem = {id: string; attributes: Record<string, unknown>};
type ApiPage = {data: ApiItem[] | {attributes: {results: RevenueResult[]}}; links?: {next?: string | null}};
const memory = new Map<string, {expires: number; value: unknown}>();
const pending = new Map<string, Promise<unknown>>();
export class RevenueApi {
  constructor(private env: RevenueEnv, private cache?: Cache, private request: typeof fetch = fetch) {}
  async call(route: string, payload?: unknown): Promise<ApiPage> {
    if (!this.env.KLAVIYO_REPORTING_KEY) throw new RevenueApiError('De Klaviyo-koppeling is nog niet ingesteld.', 503);
    const url = new URL(route, 'https://a.klaviyo.com/api/');
    if (url.origin !== 'https://a.klaviyo.com' || !url.pathname.startsWith('/api/')) throw new RevenueApiError('Ongeldige rapportverwijzing.');
    let response: Response;
    try { response = await this.request(url, {method: payload ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(25000), headers: {Authorization: `Klaviyo-API-Key ${this.env.KLAVIYO_REPORTING_KEY}`, revision: '2026-10-15', Accept: 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json'}, ...(payload ? {body: JSON.stringify(payload)} : {})}); }
    catch { throw new RevenueApiError('Klaviyo is tijdelijk niet bereikbaar. Probeer opnieuw.'); }
    if (response.status === 401 || response.status === 403) throw new RevenueApiError('De Klaviyo-koppeling mist geldige leesrechten voor rapportages.', 503);
    if (response.status === 429) { const retry = Number(response.headers.get('Retry-After')); throw new RevenueApiError('Klaviyo verwerkt al een rapport. We proberen het zo opnieuw.', 429, Number.isFinite(retry) ? Math.min(120, Math.max(31, retry)) : 31); }
    if (!response.ok) throw new RevenueApiError('Klaviyo kon het rapport niet ophalen. Probeer opnieuw.');
    try { return await response.json() as ApiPage; } catch { throw new RevenueApiError('Klaviyo gaf een onvolledig antwoord terug.'); }
  }
  async cached<T>(identity: string, operation: () => Promise<T>): Promise<{value: T; cached: boolean; fetchedAt: string}> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify([this.env.KLAVIYO_REPORTING_KEY, this.env.KLAVIYO_ORDER_METRIC_ID, identity])));
    const key = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
    const request = new Request(`https://jimdesigns.internal/email-revenue/v1/${key}`);
    let stored = memory.get(key);
    if (!stored && this.cache) { try { const response = await this.cache.match(request); if (response) stored = await response.json() as typeof stored; } catch { /* Upstream remains the source if the private cache is unavailable. */ } }
    if (stored && stored.expires > Date.now()) return {value: stored.value as T, cached: true, fetchedAt: new Date(stored.expires - 900000).toISOString()};
    let work = pending.get(key);
    if (!work) {
      work = operation().then(async value => {
        const entry = {expires: Date.now() + 900000, value}; memory.set(key, entry);
        if (memory.size > 100) memory.delete(memory.keys().next().value!);
        if (this.cache) { try { await this.cache.put(request, new Response(JSON.stringify(entry), {headers: {'Cache-Control': 'max-age=900'}})); } catch { /* Cache failure must not turn a complete report into an error. */ } }
        return value;
      }).finally(() => pending.delete(key));
      pending.set(key, work);
    }
    return {value: await work as T, cached: false, fetchedAt: new Date().toISOString()};
  }
  async list(route: string) {
    const all: ApiItem[] = [], seen = new Set<string>();
    while (route) {
      if (seen.has(route) || seen.size >= 8) throw new RevenueApiError('Klaviyo gaf ongeldige paginering terug.'); seen.add(route);
      const page = await this.call(route); if (!Array.isArray(page.data)) throw new RevenueApiError('Klaviyo gaf een onvolledige lijst terug.');
      all.push(...page.data); route = page.links?.next || '';
    }
    return all;
  }
  async metadata(): Promise<RevenueMetadata> {
    const {value} = await this.cached('metadata', async () => {
      const accounts = await this.list('accounts/');
      if (accounts.length !== 1) throw new RevenueApiError('Het Klaviyo-account kon niet worden vastgesteld.');
      const timezone = accounts[0].attributes.timezone, currency = accounts[0].attributes.preferred_currency;
      if (typeof timezone !== 'string' || typeof currency !== 'string') throw new RevenueApiError('Het Klaviyo-account mist tijdzone of valuta.');
      try { new Intl.DateTimeFormat('nl-NL', {timeZone: timezone}); new Intl.NumberFormat('nl-NL', {style: 'currency', currency}); } catch { throw new RevenueApiError('Het account heeft een onbekende tijdzone of valuta.'); }
      const metrics = await this.list('metrics/');
      const candidates = metrics.filter(m => m.attributes.name === 'Placed Order' && (m.attributes.integration as {name?: string})?.name === 'Shopify');
      const metric = this.env.KLAVIYO_ORDER_METRIC_ID ? metrics.find(m => m.id === this.env.KLAVIYO_ORDER_METRIC_ID && m.attributes.name === 'Placed Order') : candidates.length === 1 ? candidates[0] : null;
      if (!metric) throw new RevenueApiError('De juiste Shopify Placed Order-meetwaarde moet nog worden ingesteld.', 503);
      const flows = [...await this.list('flows/?filter=equals(archived,false)'), ...await this.list('flows/?filter=equals(archived,true)')];
      return {accountId: accounts[0].id, timezone, currency, metricId: metric.id, flows: [...new Map(flows.map(f => [f.id, {id: f.id, name: String(f.attributes.name)}])).values()]};
    });
    const welcomeIds = (this.env.KLAVIYO_WELCOME_FLOW_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (welcomeIds.some(id => !value.flows.some(flow => flow.id === id))) throw new RevenueApiError('Een ingestelde welkomstflow bestaat niet in dit Klaviyo-account.', 503);
    return {...value, welcomeIds, welcomeConfigured: !!this.env.KLAVIYO_WELCOME_FLOW_IDS?.trim()};
  }
  async reportPage(type: 'campaign' | 'flow', start: string, end: string, metricId: string, cursor = '') {
    if (!validRevenueDate(start.slice(0, 10)) || !validRevenueDate(end.slice(0, 10)) || Number.isNaN(Date.parse(start)) || Number.isNaN(Date.parse(end)) || start > end || Date.parse(end) - Date.parse(start) > 365 * 86400000) throw new RevenueApiError('Ongeldige rapportperiode.', 400);
    if (cursor.length > 2048) throw new RevenueApiError('Ongeldige rapportpagina.', 400);
    return this.cached(JSON.stringify(['report', type, start, end, metricId, cursor]), async () => {
      const endpoint = `${type}-values-reports/`;
      const page = await this.call(endpoint + (cursor ? `?page_cursor=${encodeURIComponent(cursor)}` : ''), {data: {type: `${type}-values-report`, attributes: {
        statistics: ['conversion_value', 'conversions'], timeframe: {start, end}, conversion_metric_id: metricId,
        filter: 'equals(send_channel,"email")', group_by: type === 'flow' ? ['flow_id', 'flow_message_id', 'flow_name', 'send_channel'] : ['campaign_id', 'campaign_message_id', 'campaign_message_name', 'send_channel'],
      }}});
      if (Array.isArray(page.data) || !Array.isArray(page.data?.attributes?.results)) throw new RevenueApiError('Het rapport is onvolledig. Er is geen totaal berekend.');
      let next = '';
      if (page.links?.next) {
        const url = new URL(page.links.next);
        if (url.origin !== 'https://a.klaviyo.com' || url.pathname.replace(/\/$/, '') !== `/api/${type}-values-reports`) throw new RevenueApiError('Ongeldige rapportpaginering.');
        next = url.searchParams.get('page_cursor') || '';
        if (!next) throw new RevenueApiError('De volgende rapportpagina ontbreekt.');
      }
      return {results: page.data.attributes.results, next};
    });
  }
}
