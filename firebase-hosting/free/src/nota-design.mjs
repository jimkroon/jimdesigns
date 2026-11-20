export const accents = {inkt:'#26332e',bos:'#23583f',klei:'#8f4130',marine:'#23476a'};
export const fonts = {sans:'Modern',serif:'Klassiek'};
export const defaultDesign = {accent:'inkt',font:'sans'};
export function notaDesign(raw) {
  if (!Object.hasOwn(accents,raw.accent) || !Object.hasOwn(fonts,raw.font)) throw new Error('Kies een geldige notastijl.');
  return {accent:raw.accent,font:raw.font};
}
