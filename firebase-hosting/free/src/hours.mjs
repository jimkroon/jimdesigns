import {amountCents, money, text, validDate} from './core.mjs';

export function workEntry(values) {
  const hours = String(values.hours).trim();
  if (!/^\d{1,4}([.,]\d{1,2})?$/.test(hours)) throw new Error('Vul je uren in, bijvoorbeeld 2,5.');
  const units = Math.round(Number(hours.replace(',', '.')) * 100);
  const rate = amountCents(values.rate);
  const amount = Math.round(units * rate / 100);
  if (units < 1 || amount < 1 || amount > 99999999) throw new Error('Controleer de uren en het totaalbedrag.');
  if (!validDate(values.date)) throw new Error('Kies een geldige werkdatum.');
  const customer = Number(values.customer_id);
  if (!Number.isInteger(customer) || customer < 1) throw new Error('Kies een klant.');
  return {customer_id:customer, date:values.date, description:text(values.description,'Omschrijving',110),
    hour_units:units, rate_cents:rate, amount_cents:amount, invoice_number:null};
}
export const hoursLabel = units => (units / 100).toLocaleString('nl-NL') + ' uur';
export const workDescription = entry => entry.description + ' (' + hoursLabel(entry.hour_units) + ' × ' + money(entry.rate_cents) + ')';
