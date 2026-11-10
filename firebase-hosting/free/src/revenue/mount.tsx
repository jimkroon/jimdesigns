import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {getToken} from 'firebase/app-check';
import type {User} from 'firebase/auth';
import {development,appCheck} from '../firebase.mjs';
import EmailRevenue from './EmailRevenue';
import configuration from './config.json';
type Connection = {state: 'checking' | 'connected' | 'unconfigured' | 'error'; message?: string; flowCount?: number};
async function headers(user: User): Promise<Record<string, string>> {
  const result: Record<string, string> = {Authorization: `Bearer ${await user.getIdToken()}`};
  if (!development) result['X-Firebase-AppCheck'] = (await getToken(appCheck, false)).token;
  return result;
}
function Dashboard({user}: {user: User}) {
  const [connection, setConnection] = useState<Connection>({state: 'checking'});
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    setConnection({state: 'checking'});
    (async () => {
      if (!configuration.endpoint) {setConnection({state: 'unconfigured'}); return;}
      const response = await fetch(configuration.endpoint + '?part=status', {headers: await headers(user), signal: abort.signal});
      const value = await response.json();
      if (!response.ok) throw new Error(value.error || 'De verbinding kon niet worden gecontroleerd. Probeer het opnieuw.');
      if (!abort.signal.aborted) setConnection(value.connected === true ? {state:'connected',flowCount:value.flowCount} : {state:'unconfigured'});
    })().catch(error => {if (!abort.signal.aborted) setConnection({state:'error',message:error instanceof TypeError ? 'De verbinding is tijdelijk niet bereikbaar. Probeer het opnieuw.' : error.message});});
    return () => abort.abort();
  }, [user, attempt]);
  const {state}=connection;
  return <>
    <section className="revenue-connection" data-state={state} aria-label="Klaviyo-verbinding">
      <div><strong><span aria-hidden="true"/>{state==='connected'?'Verbonden met Klaviyo':state==='checking'?'Klaviyo controleren…':state==='error'?'Verbinding tijdelijk niet beschikbaar':'Klaviyo instellen'}</strong>
      <p>{state==='connected' ? `${connection.flowCount ?? ''} flows beschikbaar · E-mailrapportages` : state==='checking' ? 'Je account en rapportagerechten worden gecontroleerd.' : state==='error' ? connection.message : 'De beveiligde rapportagekoppeling moet nog worden ingesteld.'}</p></div>
      {state==='error'||state==='unconfigured'?<button type="button" onClick={()=>setAttempt(value=>value+1)}>Opnieuw controleren</button>:<span className="revenue-private">Alleen voor jou</span>}
    </section>
    {state==='connected' && <EmailRevenue connected endpoint={configuration.endpoint} authorize={() => headers(user)} autoLoad/>}
    {state==='checking' && <div className="revenue-skeleton" aria-hidden="true"><span/><span/><span/></div>}
    {state==='unconfigured' && <div className="revenue-unconfigured"><h2>Je rapportagekoppeling is nog niet ingesteld.</h2><p>Er is nog geen werkende Klaviyo-koppeling beschikbaar. Je omzet verschijnt zodra deze is aangesloten.</p></div>}
  </>;
}
export function mountRevenue(element: HTMLElement, user: User) {
  const root = createRoot(element); root.render(<Dashboard user={user}/>); return () => root.unmount();
}
