import {useEffect, useRef, useState} from 'react';
import {aggregateRevenue, mergeRevenue, nextRevenueDate, revenueCsv, revenueTimeframes, revenueTotal, selectRevenue, validateRevenueRange} from './core';
import type {RevenueMetadata, RevenueReport, RevenueResult, RevenueRow} from './core';
import styles from './EmailRevenue.module.css';

type Props = {connected: boolean; autoLoad?: boolean; endpoint?: string; authorize?: () => Promise<Record<string, string>>};
type ApiReply = {metadata?: RevenueMetadata; results?: RevenueResult[]; next?: string; fetchedAt?: string; requestDelayMs?: number; error?: string; retryAfter?: number};
function currentDate() { return new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date()); }
function initialDates() { const last = nextRevenueDate(currentDate().slice(0, 7) + '-01', -1); return {start: last.slice(0, 7) + '-01', end: last}; }
function labelDate(value: string) { return new Intl.DateTimeFormat('nl-NL', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'}).format(new Date(value + 'T12:00:00Z')); }
function DownloadIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M10 2v10m-4-4 4 4 4-4M3 13v4h14v-4" /></svg>; }
export default function EmailRevenue({connected, autoLoad = false, endpoint = '', authorize = async () => ({})}: Props) {
  const [dates, setDates] = useState(initialDates);
  const [activePeriod, setActivePeriod] = useState('last-month');
  const [metadata, setMetadata] = useState<RevenueMetadata | null>(null);
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [mode, setMode] = useState<'all' | 'campaign' | 'flow'>('all');
  const [includeWelcome, setIncludeWelcome] = useState(true);
  const [welcomeIds, setWelcomeIds] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('revenue');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  const operation = useRef(0);
  useEffect(() => () => { operation.current++; controller.current?.abort(); }, []);

  useEffect(() => {if (connected && autoLoad) void load();}, [connected, autoLoad]);

  async function load() {
    controller.current?.abort(); const abort = new AbortController(); controller.current = abort;
    const mine = ++operation.current;
    setError(''); setReport(null); setBusy(true); setProgress('Je Klaviyo-account en flows controleren…');
    async function pause(ms: number) { if (abort.signal.aborted) throw new DOMException('Aborted', 'AbortError'); if (ms <= 0) return; await new Promise<void>((resolve, reject) => { const done = () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }; const timer = setTimeout(() => { abort.signal.removeEventListener('abort', done); resolve(); }, ms); abort.signal.addEventListener('abort', done, {once: true}); }); }
    async function request(params: Record<string, string>) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const response = await fetch(`${endpoint}?${new URLSearchParams(params)}`, {signal: abort.signal, headers: {Accept: 'application/json', ...await authorize()}});
        if (response.status === 401 || response.status === 404) throw new Error('Je sessie is verlopen of je account heeft geen toegang. Log opnieuw in.');
        let value: ApiReply;
        try { value = await response.json() as ApiReply; if (!value || typeof value !== 'object') throw new Error(); } catch { throw new Error('Je sessie is verlopen. Log opnieuw in en probeer het nog eens.'); }
        if (response.status === 429 && attempt < 2) { setProgress('Klaviyo verwerkt een ander rapport. We wachten even en proberen opnieuw…'); await pause((value.retryAfter || 31) * 1000); continue; }
        if (!response.ok) throw new Error(value.error || 'Het rapport kon niet worden opgehaald.');
        return value;
      }
      throw new Error('Klaviyo is druk. Probeer het over een paar minuten opnieuw.');
    }
    try {
      validateRevenueRange(dates.start, dates.end);
      const {metadata: meta} = await request({part: 'metadata'});
      if (!meta) throw new Error('De Klaviyo-accountgegevens ontbreken.');
      if (mine !== operation.current) return;
      setMetadata(meta); if (!metadata || metadata.accountId !== meta.accountId) setWelcomeIds(meta.welcomeIds);
      const chunks = revenueTimeframes(dates.start, dates.end, meta.timezone);
      const groups: RevenueRow[][] = []; let nextAllowed = 0; let fetchedAt = new Date().toISOString();
      for (let chunk = 0; chunk < chunks.length; chunk++) {
        for (const type of ['campaign', 'flow'] as const) {
          const results: RevenueResult[] = []; const seen = new Set<string>(); let cursor = '';
          do {
            if (seen.has(cursor) || seen.size >= 100) throw new Error('Klaviyo gaf ongeldige rapportpagina’s terug. Het totaal is niet berekend.');
            seen.add(cursor);
            const remaining = nextAllowed - Date.now();
            setProgress(remaining > 0 ? `${type === 'flow' ? 'Flows' : 'Campagnes'} laden zodra Klaviyo de volgende aanvraag toestaat…` : `${type === 'flow' ? 'Flows' : 'Campagnes'} ophalen${chunks.length > 1 ? ` · periode ${chunk + 1} van ${chunks.length}` : ''}…`);
            await pause(remaining);
            const value = await request({part: type, start: dates.start, end: dates.end, chunk: String(chunk), cursor});
            if (!Array.isArray(value.results)) throw new Error('Het Klaviyo-rapport is onvolledig.');
            results.push(...value.results); cursor = value.next || ''; nextAllowed = Date.now() + (value.requestDelayMs || 0);
            // Display the oldest page timestamp, never make a partially cached report look newer.
            if (!value.fetchedAt) throw new Error('De ophaaltijd van het rapport ontbreekt.');
            if (value.fetchedAt < fetchedAt) fetchedAt = value.fetchedAt;
          } while (cursor);
          groups.push(aggregateRevenue(results, type, Object.fromEntries(meta.flows.map(f => [f.id, f.name]))));
        }
      }
      if (mine !== operation.current) return;
      setReport({start: dates.start, end: dates.end, fetchedAt, metadata: meta, rows: mergeRevenue(groups)});
    } catch (reason) { if (mine === operation.current && !abort.signal.aborted) setError(reason instanceof Error ? reason.message : 'Ophalen is niet gelukt. Probeer opnieuw.'); }
    finally { if (mine === operation.current) { setBusy(false); setProgress(''); } }
  }
  const selection = {campaigns: mode !== 'flow', flows: mode !== 'campaign', welcome: includeWelcome, welcomeIds, excluded};
  const selected = report ? selectRevenue(report.rows, selection) : [];
  const included = new Set(selected.map(r => `${r.type}:${r.id}`));
  const sum = revenueTotal(selected), campaigns = revenueTotal(selected.filter(r => r.type === 'campaign')), flows = revenueTotal(selected.filter(r => r.type === 'flow'));
  const money = (cents: number) => new Intl.NumberFormat('nl-NL', {style: 'currency', currency: report?.metadata.currency || metadata?.currency || 'EUR'}).format(cents / 100);
  const visible = (report?.rows || []).filter(r => r.name.toLocaleLowerCase('nl-NL').includes(query.toLocaleLowerCase('nl-NL'))).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name, 'nl') : sort === 'orders' ? b.orders - a.orders : b.cents - a.cents);
  function changeDates(next: {start: string; end: string}, period = '') { operation.current++; controller.current?.abort(); setBusy(false); setProgress(''); setReport(null); setError(''); setDates(next); setActivePeriod(period); }
  function preset(value: string) {
    const current = currentDate(); let next = {start: current.slice(0, 7) + '-01', end: current};
    if (value === 'last-month') next = initialDates();
    if (value === '30') next.start = nextRevenueDate(current, -29);
    if (value === 'year') next.start = current.slice(0, 4) + '-01-01';
    changeDates(next, value);
  }
  function exclude(id: string, checked: boolean) { setExcluded(previous => checked ? previous.filter(value => value !== id) : [...new Set([...previous, id])]); }
  function exportCsv() {
    if (!report) return;
    const url = URL.createObjectURL(new Blob([revenueCsv(report, selected)], {type: 'text/csv;charset=utf-8;'}));
    const link = document.createElement('a'); link.href = url; link.download = `emailomzet-${report.start}-${report.end}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className={styles.dashboard}>
    <section className={styles.period} aria-label="Rapportperiode">
      <div className={styles.presets}>{[['this-month', 'Deze maand'], ['last-month', 'Vorige maand'], ['30', '30 dagen'], ['year', 'Dit jaar']].map(([value, label]) => <button key={value} className={activePeriod === value ? styles.active : ''} aria-pressed={activePeriod === value} onClick={() => preset(value)}>{label}</button>)}</div>
      <form onSubmit={event => { event.preventDefault(); void load(); }} className={styles.dateForm}>
        <label>Van<input type="date" value={dates.start} required onChange={event => changeDates({...dates, start: event.target.value})}/></label><label>Tot en met<input type="date" value={dates.end} required onChange={event => changeDates({...dates, end: event.target.value})}/></label>
        <button className={styles.primary} disabled={!connected || busy}>{busy ? 'Rapport ophalen…' : 'Rapport bekijken'}<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 10h13m-5-5 5 5-5 5"/></svg></button>
      </form>
    </section>
    {!connected && <section className={styles.emptyState} aria-labelledby="revenue-connect"><svg className={styles.emptyIcon} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M10 12h28v25H10zM10 19h28M17 27h5m4 0h5m-14 5h5"/><path d="M17 8v8m14-8v8"/></svg><h2 id="revenue-connect">Je echte cijfers beginnen hier.</h2><p>De beveiligde plek voor je omzet is klaar. De Klaviyo-rapportagekoppeling moet nog worden aangesloten.</p><span className={styles.connectionStatus}>Klaviyo nog niet gekoppeld</span><p className={styles.small}>Je ziet hier pas bedragen en flows als ze uit jouw Klaviyo-account zijn opgehaald. Er worden geen voorbeeldbedragen getoond.</p></section>}
    {connected && !report && !busy && !error && <div className={styles.startState}><h2>Kies je rapportperiode</h2><p>Kies hierboven je datums en haal je rapport op. Daarna bepaal je welke campagnes en flows meetellen.</p></div>}
    {error && <div className={styles.error} role="alert"><strong>Rapport niet beschikbaar</strong><p>{error}</p><button onClick={() => void load()}>Opnieuw proberen</button></div>}
    {busy && <div className={styles.loading} role="status"><span className={styles.spinner}/><div><strong>Even je cijfers erbij pakken.</strong><p>{progress}</p><small>We tonen het totaal zodra alle campagne- en flowpagina’s compleet zijn.</small></div></div>}
    {report && <>
      <div className={styles.reportTop}><p>{labelDate(report.start)} <span>tot en met</span> {labelDate(report.end)}</p><button className={styles.export} onClick={exportCsv}><DownloadIcon/>Exporteren</button></div>
      <section className={styles.summary} aria-label="Geselecteerde omzet"><div className={styles.mainTotal}><span>Toegeschreven e-mailomzet</span><strong data-testid="revenue-total" aria-live="polite">{money(sum.cents)}</strong><small>{sum.orders} {sum.orders === 1 ? 'bestelling' : 'bestellingen'} · {selected.length} onderdelen geselecteerd</small></div><dl><div><dt><i className={styles.campaignDot}/>Campagnes</dt><dd>{money(campaigns.cents)}</dd></div><div><dt><i className={styles.flowDot}/>Flows</dt><dd>{money(flows.cents)}</dd></div></dl></section>
      <section className={styles.selection} aria-labelledby="selection-title"><div className={styles.selectionHeading}><h2 id="selection-title">Welke omzet telt mee?</h2><button className={styles.reset} onClick={() => { setMode('all'); setIncludeWelcome(true); setExcluded([]); }}>Selectie herstellen</button></div>
        <div className={styles.selectionControls}><div className={styles.segments} aria-label="Rapportselectie">{[['all', 'Alles'], ['campaign', 'Campagnes'], ['flow', 'Flows']].map(([value, label]) => <button key={value} aria-pressed={mode === value} className={mode === value ? styles.active : ''} onClick={() => setMode(value as typeof mode)}>{label}</button>)}</div><label className={styles.welcomeControl}><input type="checkbox" checked={includeWelcome && mode !== 'campaign'} disabled={!welcomeIds.length || mode === 'campaign'} onChange={event => setIncludeWelcome(event.target.checked)}/>Welkomstflow meetellen{welcomeIds.length > 0 && <span>{welcomeIds.length}</span>}</label></div>
        <details className={styles.flowMapping}><summary>{welcomeIds.length ? 'Welkomstflows controleren' : 'Welke flow is je welkomstflow?'}</summary><p>Selecteer alle versies die je als welkomstflow wilt kunnen uitsluiten. Dit verandert alleen jouw rapport.</p><div>{metadata?.flows.map(flow => <label key={flow.id}><input type="checkbox" checked={welcomeIds.includes(flow.id)} onChange={event => setWelcomeIds(previous => event.target.checked ? [...previous, flow.id] : previous.filter(id => id !== flow.id))}/><span>{flow.name}<small>{flow.id}</small></span></label>)}</div></details>
      </section>
      <div className={styles.listHeading}><h2>Campagnes & flows <span>{report.rows.length}</span></h2><label><span className={styles.srOnly}>Zoeken op naam</span><input type="search" placeholder="Zoek op naam…" value={query} onChange={event => setQuery(event.target.value)}/></label><label><span className={styles.srOnly}>Sorteren</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="revenue">Hoogste omzet</option><option value="name">Naam A–Z</option><option value="orders">Meeste bestellingen</option></select></label></div>
      <p className={styles.tableHint}>Vink een regel uit om hem uit je totaal te halen. Zoeken verandert alleen de lijst.</p>
      <div className={styles.tableWrap}><table><thead><tr><th><span className={styles.srOnly}>Meetellen</span></th><th>Naam</th><th>Bestellingen</th><th>Omzet</th></tr></thead><tbody>{visible.map(row => {
        const key = `${row.type}:${row.id}`, checked = included.has(key);
        const eligible = row.type === 'campaign' ? mode !== 'flow' : mode !== 'campaign' && (includeWelcome || !welcomeIds.includes(row.id));
        return <tr key={key} data-excluded={!checked}><td><input type="checkbox" aria-label={`${row.name} meetellen`} checked={checked} disabled={!eligible} onChange={event => exclude(key, event.target.checked)}/></td><td><strong>{row.name}</strong><small><span className={row.type === 'flow' ? styles.flowTag : styles.campaignTag}>{row.type === 'flow' ? 'Flow' : 'Campagne'}</span>{welcomeIds.includes(row.id) && row.type === 'flow' && <span>Welkomstflow</span>}{!checked && <span className={styles.excludedLabel}>Telt niet mee</span>}</small></td><td>{row.orders}</td><td>{money(row.cents)}</td></tr>;
      })}</tbody></table></div>
      {visible.length === 0 && <p className={styles.noResults}>{query ? 'Geen namen gevonden. Probeer een andere zoekterm.' : 'Geen e-mailresultaten voor deze periode. Kies een andere periode.'}</p>}
      <p className={styles.updated}>Opgehaald {new Intl.DateTimeFormat('nl-NL', {dateStyle: 'short', timeStyle: 'short', timeZone: report.metadata.timezone}).format(new Date(report.fetchedAt))} · {report.metadata.timezone} · {report.metadata.currency}</p>
    </>}
    <details className={styles.explanation}><summary>Hoe wordt de omzet berekend?</summary><p>Dit is omzet die Klaviyo aan e-mails toeschrijft, op verzenddatum en volgens je accountinstellingen. De einddag telt volledig mee. Een aankoop kan later zijn gedaan. Welkomstflows uitsluiten trekt hun omzet uit je selectie; het verdeelt die omzet niet opnieuw.</p><p>We gebruiken de Shopify Placed Order-meetwaarde. Dit is geen winst- of netto-omzetberekening. Recente cijfers kunnen nog wijzigen. Complete rapportpagina’s worden maximaal 15 minuten bewaard.</p></details>
  </div>;
}
