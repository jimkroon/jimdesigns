export const OWNER = 'jimdesigns-owner';
export const money = cents => new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(cents/100);
export const numberLabel = number => String(number).padStart(3,'0');
export const today = () => new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Amsterdam'}).format(new Date());
export const dateLabel = value => new Intl.DateTimeFormat('nl-NL',{dateStyle:'long',timeZone:'Europe/Amsterdam'}).format(new Date(value+'T12:00:00+01:00'));
export const requestKey = () => crypto.randomUUID().replaceAll('-','');
export function amountCents(raw) {
  let value=String(raw).trim();
  if (/^[0-9]{1,3}(?:\.[0-9]{3})+(?:,[0-9]{1,2})?$/.test(value)) value=value.replaceAll('.','');
  const match=/^([0-9]{1,7})(?:[,.]([0-9]{1,2}))?$/.exec(value);
  if(!match) throw new Error('Vul een bedrag in, bijvoorbeeld 300 of 300,50.');
  const cents=Number(match[1])*100+Number((match[2]||'').padEnd(2,'0'));
  if(cents<1||cents>99999999) throw new Error('Het bedrag moet tussen €0,01 en €999.999,99 liggen.');
  return cents;
}
export function discountBasisPoints(raw='0') {
  const value=String(raw??'').trim().replace(/\s*%$/,'').trim();
  if(!value)return 0;
  const match=/^([0-9]{1,3})(?:[,.]([0-9]{1,2}))?$/.exec(value);
  if(!match)throw new Error('Vul een korting van 0 tot en met 100% in, met maximaal twee decimalen.');
  const points=Number(match[1])*100+Number((match[2]||'').padEnd(2,'0'));
  if(points>10000)throw new Error('De korting moet tussen 0 en 100% liggen.');
  return points;
}
export const percentLabel=points=>new Intl.NumberFormat('nl-NL',{maximumFractionDigits:2}).format(points/100)+'%';
export function discountedAmount(amount,percent='0') {
  const subtotal_cents=amountCents(amount),discount_basis_points=discountBasisPoints(percent);
  const discount_cents=Math.floor((subtotal_cents*discount_basis_points+5000)/10000);
  return {subtotal_cents,discount_basis_points,discount_cents,amount_cents:subtotal_cents-discount_cents};
}
export function invoiceTotals(invoice) {
  return {subtotal_cents:invoice.subtotal_cents??invoice.amount_cents,discount_basis_points:invoice.discount_basis_points??0,discount_cents:invoice.discount_cents??0,amount_cents:invoice.amount_cents};
}
export function validDate(value) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||value<'2000-01-01'||value>'2100-12-31') return false;
  const date=new Date(value+'T12:00:00Z');return !Number.isNaN(+date)&&date.toISOString().slice(0,10)===value;
}
export function text(value,label,max,required=true) {
  value=String(value||'').trim();
  if((required&&!value)||value.length>max||/[\x00-\x1f\x7f]/.test(value)) throw new Error(label+' ontbreekt of is te lang.');
  if(!/^[\x20-\x7e\xa0-\xff€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]*$/.test(value)) throw new Error('Gebruik bij '+label+' letters en tekens uit het West-Europese alfabet.');
  return value;
}
export function party(input,seller=false) {
  const result={name:text(input.name,'Naam',80),company:text(input.company,'Bedrijfsnaam',80,false),address:text(input.address,'Adres',100,false),city:text(input.city,'Postcode en plaats',80,false)};
  if(seller) {
    result.iban=text(input.iban,'IBAN',42).replaceAll(' ','').toUpperCase();
    if(!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(result.iban)) throw new Error('Vul een geldig IBAN in.');
    const rearranged=(result.iban.slice(4)+result.iban.slice(0,4)).replace(/[A-Z]/g,c=>String(c.charCodeAt(0)-55));
    let remainder=0;for(const digit of rearranged) remainder=(remainder*10+Number(digit))%97;
    if(remainder!==1) throw new Error('Controleer het IBAN; het controlegetal klopt niet.');
  }
  return result;
}
export function invoiceInput(input) {
  if(!/^[a-f0-9]{32}$/.test(input.request_key)) throw new Error('Vernieuw de pagina en probeer opnieuw.');
  if(!validDate(input.date)) throw new Error('Kies een geldige datum.');
  const customer_id=Number(input.customer_id);
  if(!Number.isInteger(customer_id)||customer_id<1) throw new Error('Selecteer een opgeslagen klant.');
  return {request_key:input.request_key,customer_id,...discountedAmount(input.amount,input.discount_percent),description:text(input.description,'Omschrijving',180),date:input.date};
}
export function errorMessage(error) {
  const code=error?.code||'';
  if(['auth/invalid-credential','auth/user-not-found','auth/wrong-password','auth/invalid-email'].includes(code)) return 'E-mailadres of wachtwoord klopt niet. Controleer beide en probeer opnieuw.';
  if(code==='auth/too-many-requests') return 'Te veel inlogpogingen. Wacht even en probeer opnieuw.';
  if(['auth/weak-password','auth/password-does-not-meet-requirements'].includes(code))return 'Kies een wachtwoordzin van 12 tot 72 tekens.';
  if(code==='auth/network-request-failed'||code==='unavailable') return 'Geen verbinding. Je invoer staat er nog. Controleer je internet en probeer opnieuw.';
  if(code==='permission-denied') return 'Je sessie is verlopen of deze actie is niet toegestaan. Log opnieuw in en probeer het nog eens.';
  if(code==='resource-exhausted') return 'De gratis daglimiet is bereikt. Probeer het later opnieuw of mail info@jimdesigns.nl.';
  return code ? 'Dit is niet gelukt. Je invoer is bewaard; probeer het opnieuw.' : (error?.message||'Dit is niet gelukt. Probeer het opnieuw.');
}
