import {initializeApp} from 'firebase/app';
import {initializeAuth,browserSessionPersistence,connectAuthEmulator} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator} from 'firebase/firestore';
import {initializeAppCheck,ReCaptchaEnterpriseProvider} from 'firebase/app-check';
import configuration from './firebase-config.json';
export const development = __DEV__;
export async function foreground(){
  if(document.visibilityState==='visible')return;
  await new Promise(resolve=>{const resume=()=>{if(document.visibilityState==='visible'){document.removeEventListener('visibilitychange',resume);resolve();}};document.addEventListener('visibilitychange',resume);});
}
export function connect(name) {
  const config=development?{...configuration,projectId:'demo-jimdesigns',apiKey:'synthetic-emulator-key'}:configuration;
  const app=initializeApp(config,name);
  if(!development) initializeAppCheck(app,{provider:new ReCaptchaEnterpriseProvider('6LeTqAUuAAAAAKYANnA7WR8Gk9918i55qFM_QtYG'),isTokenAutoRefreshEnabled:true});
  const auth=initializeAuth(app,{persistence:browserSessionPersistence});const db=getFirestore(app);
  if(development){connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});connectFirestoreEmulator(db,'127.0.0.1',8383);}
  auth.languageCode='nl';return {app,auth,db};
}
