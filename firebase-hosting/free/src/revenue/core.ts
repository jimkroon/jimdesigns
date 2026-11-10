export type RevenueRow = {id: string; type: 'campaign' | 'flow'; name: string; cents: number; orders: number};
export type RevenueSelection = {campaigns: boolean; flows: boolean; welcome: boolean; welcomeIds: string[]; excluded: string[]};
export type RevenueMetadata = {accountId: string; timezone: string; currency: string; metricId: string; welcomeIds: string[]; welcomeConfigured: boolean; flows: {id: string; name: string}[]};
export type RevenueReport = {start: string; end: string; fetchedAt: string; metadata: RevenueMetadata; rows: RevenueRow[]};
export type RevenueResult = {groupings: Record<string, string>; statistics: {conversion_value: number; conversions: number}};
export function validRevenueDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function nextRevenueDate(value: string, amount = 1) {
  const date = new Date(value + 'T12:00:00Z'); date.setUTCDate(date.getUTCDate() + amount); return date.toISOString().slice(0, 10);
}
export function validateRevenueRange(start: string, end: string) {
  if (!validRevenueDate(start) || !validRevenueDate(end) || start > end) throw new Error('Kies een geldige begin- en einddatum.');
  if ((Date.parse(end) - Date.parse(start)) / 86400000 > 3660) throw new Error('Kies maximaal tien jaar tegelijk.');
}
function localInstant(date: string, time: string, timezone: string) {
  const target = Date.parse(`${date}T${time}Z`); let guess = target;
  const formatter = new Intl.DateTimeFormat('en-CA', {timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'});
  for (let i = 0; i < 4; i++) {
    const p = Object.fromEntries(formatter.formatToParts(new Date(guess)).map(part => [part.type, part.value]));
    const delta = target - Date.parse(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`); guess += delta; if (!delta) break;
  }
  return new Date(guess).toISOString();
}
export function revenueTimeframes(start: string, end: string, timezone: string) {
  validateRevenueRange(start, end); const chunks: {start: string; end: string}[] = [];
  for (let cursor = start; cursor <= end;) {
    const last = nextRevenueDate(cursor, 363) < end ? nextRevenueDate(cursor, 363) : end;
    chunks.push({start: localInstant(cursor, '00:00:00', timezone), end: localInstant(last, '23:59:59', timezone)}); cursor = nextRevenueDate(last);
  }
  return chunks;
}
export function aggregateRevenue(results: RevenueResult[], type: RevenueRow['type'], names: Record<string, string> = {}): RevenueRow[] {
  const rows = new Map<string, RevenueRow>(); const seen = new Set<string>();
  for (const result of results) {
    const g = result.groupings, s = result.statistics;
    if (!g || g.send_channel !== 'email' || !g[`${type}_id`] || !g[`${type}_message_id`]) throw new Error('Klaviyo gaf onvolledige berichtgegevens terug.');
    const id = g[`${type}_id`], message = `${id}:${g[`${type}_message_id`]}`;
    if (seen.has(message)) throw new Error('Een bericht staat dubbel in het rapport. Het totaal is niet berekend.'); seen.add(message);
    if (!s || !Number.isFinite(s.conversion_value) || !Number.isInteger(s.conversions) || s.conversions < 0) throw new Error('Klaviyo gaf onvolledige omzet terug. Probeer opnieuw.');
    const row = rows.get(id) || {id, type, name: names[id] || g.flow_name || g.campaign_message_name || id, cents: 0, orders: 0};
    row.cents += Math.round(s.conversion_value * 100); row.orders += s.conversions; rows.set(id, row);
  }
  return [...rows.values()];
}
export function mergeRevenue(groups: RevenueRow[][]) {
  const rows = new Map<string, RevenueRow>();
  for (const row of groups.flat()) { const key = `${row.type}:${row.id}`; const previous = rows.get(key); rows.set(key, previous ? {...previous, cents: previous.cents + row.cents, orders: previous.orders + row.orders} : {...row}); }
  return [...rows.values()];
}
export function selectRevenue(rows: RevenueRow[], selection: RevenueSelection) {
  return rows.filter(row => !selection.excluded.includes(`${row.type}:${row.id}`) && (row.type === 'campaign' ? selection.campaigns : selection.flows && (selection.welcome || !selection.welcomeIds.includes(row.id))));
}
export function revenueTotal(rows: RevenueRow[]) { return rows.reduce((sum, r) => ({cents: sum.cents + r.cents, orders: sum.orders + r.orders}), {cents: 0, orders: 0}); }
export type CutScope = 'selection' | 'campaign' | 'flow' | 'custom';
export type RevenueCut = {basisPoints: number; baseCents: number; cents: number; rows: RevenueRow[]; scope: CutScope};
export function calculateRevenueCut(rows: RevenueRow[], percentage: string, scope: CutScope = 'selection', ids: string[] = []): RevenueCut {
  const match = /^(\d{1,3})(?:[.,](\d{1,2}))?$/.exec(percentage.trim());
  if (!match) throw new Error('Vul een percentage van 0 tot 100 in, met maximaal twee decimalen.');
  const basisPoints = Number(match[1]) * 100 + Number((match[2] || '').padEnd(2, '0'));
  if (basisPoints > 10000) throw new Error('Je percentage moet tussen 0 en 100 liggen.');
  const included = rows.filter(row => scope === 'selection' || (scope === 'custom' ? ids.includes(`${row.type}:${row.id}`) : row.type === scope));
  const baseCents = revenueTotal(included).cents, product = baseCents * basisPoints;
  if (!Number.isSafeInteger(baseCents) || !Number.isSafeInteger(product)) throw new Error('Dit bedrag is te groot om je cut nauwkeurig te berekenen.');
  // Round once on the selected total, to whole cents, including negative adjustments.
  const cents = Math.sign(product) * Math.floor((Math.abs(product) + 5000) / 10000);
  return {basisPoints, baseCents, cents: cents || 0, rows: included, scope};
}
export function revenueCsv(report: RevenueReport, rows: RevenueRow[], cut?: RevenueCut) {
  const cell = (value: unknown) => '"' + String(value ?? '').replace(/^[=+\-@\t\r]/, "'$&").replaceAll('"', '""') + '"';
  const sum = revenueTotal(rows);
  return '\uFEFF' + [
    ['Bron', 'Klaviyo Reporting API'], ['Van', report.start], ['Tot en met', report.end], ['Datumbasis', 'Verzenddatum'], ['Tijdzone', report.metadata.timezone], ['Valuta', report.metadata.currency], ['Opgehaald', report.fetchedAt], [],
    ['Naam', 'Type', 'ID', 'Omzet', 'Bestellingen'], ...rows.map(r => [r.name, r.type === 'flow' ? 'Flow' : 'Campagne', r.id, (r.cents / 100).toFixed(2).replace('.', ','), r.orders]), ['Totaal', '', '', (sum.cents / 100).toFixed(2).replace('.', ','), sum.orders],
    ...(cut ? [[], ['Jouw cut (%)', (cut.basisPoints / 100).toFixed(2).replace('.', ',')], ['Cut berekend over', (cut.baseCents / 100).toFixed(2).replace('.', ',')], ['Onderdelen voor cut', cut.rows.map(row => `${row.type}:${row.id}`).join(', ')], ['Jouw cut', (cut.cents / 100).toFixed(2).replace('.', ',')]] : []),
  ].map(row => row.map(cell).join(';')).join('\r\n');
}
