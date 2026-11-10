import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {getToken} from 'firebase/app-check';
import type {User} from 'firebase/auth';
import {development,appCheck} from '../firebase.mjs';
import EmailRevenue from './EmailRevenue';
import configuration from './config.json';
async function headers(user: User): Promise<Record<string, string>> {
  const result: Record<string, string> = {Authorization: `Bearer ${await user.getIdToken()}`};
  if (!development) result['X-Firebase-AppCheck'] = (await getToken(appCheck, false)).token;
  return result;
}
function Dashboard({user}: {user: User}) {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState(configuration.endpoint ? 'Klaviyo-koppeling controleren…' : 'De gratis koppeling moet nog worden aangesloten.');
  useEffect(() => {
    if (!configuration.endpoint) return;
    const abort = new AbortController();
    (async () => {
      const response = await fetch(configuration.endpoint + '?part=status', {headers: await headers(user), signal: abort.signal});
      const value = await response.json();
      if (!response.ok) throw new Error(value.error || 'De koppeling kon niet worden gecontroleerd.');
      if (!abort.signal.aborted) {setConnected(value.connected === true); setStatus(value.connected ? '' : 'Een Klaviyo-sleutel met rapportagerechten ontbreekt nog.');}
    })().catch(error => {if (!abort.signal.aborted) setStatus(error.message);});
    return () => abort.abort();
  }, [user]);
  return <>{status && <p role="status" className="revenue-status">{status}</p>}<EmailRevenue connected={connected} endpoint={configuration.endpoint} authorize={() => headers(user)}/></>;
}
export function mountRevenue(element: HTMLElement, user: User) {
  const root = createRoot(element); root.render(<Dashboard user={user}/>); return () => root.unmount();
}
