export const accents = {inkt:'#26332e',bos:'#23583f',klei:'#8f4130',marine:'#23476a'};
export const fonts = {sans:'Modern',serif:'Klassiek'};
export const defaultDesign = {accent:'inkt',font:'sans'};
export function notaDesign(raw) {
  if (!Object.hasOwn(accents,raw.accent) || !Object.hasOwn(fonts,raw.font)) throw new Error('Kies een geldige notastijl.');
  if(raw.logo && (typeof raw.logo!=='string' || raw.logo.length>48000 || !/^data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/]+=*$/.test(raw.logo)))throw new Error('Kies een geldig logo.');
  return {...(raw.logo?{logo:raw.logo}:{}),accent:raw.accent,font:raw.font};
}
