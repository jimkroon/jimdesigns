'use strict';

function setPreview(name, value) {
  document.querySelectorAll(`[data-preview="${name}"]`).forEach(element => { element.textContent = value; });
}

const invoiceForm = document.querySelector('#invoice-form');
if (invoiceForm) {
  const amount = invoiceForm.elements.amount;
  const customer = invoiceForm.elements.customer_id;
  const description = invoiceForm.elements.description;
  const date = invoiceForm.elements.date;
  const euro = new Intl.NumberFormat('nl-NL', {style: 'currency', currency: 'EUR'});
  const dateFormat = new Intl.DateTimeFormat('nl-NL', {day: 'numeric', month: 'long', year: 'numeric'});
  function preview() {
    let raw = amount.value.trim();
    if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(raw)) raw = raw.replaceAll('.', '');
    const valid = /^\d{1,7}(?:[,.]\d{1,2})?$/.test(raw);
    const value = Number(raw.replace(',', '.'));
    const legal = valid && value > 0 && value <= 999999.99;
    amount.setCustomValidity(raw && !legal ? 'Vul een bedrag in tussen €0,01 en €999.999,99, bijvoorbeeld 300,50.' : '');
    setPreview('amount', legal ? euro.format(value) : '€ —');
    setPreview('description', description.value || 'E-mailmarketing');
    if (/^\d{4}-\d{2}-\d{2}$/.test(date.value)) {
      const d = new Date(`${date.value}T12:00:00`);
      if (!Number.isNaN(d.getTime())) setPreview('date', dateFormat.format(d));
    }
    const client = JSON.parse(customer.selectedOptions[0].dataset.customer);
    for (const target of [document.querySelector('#preview-customer'), document.querySelector('#customer-summary')]) {
      target.replaceChildren();
      for (const field of ['name', 'company', 'address', 'city']) {
        if (!client[field]) continue;
        const span = document.createElement('span');
        span.dataset.party = field;
        span.textContent = client[field];
        target.append(span);
      }
    }
  }
  invoiceForm.addEventListener('input', preview);
  customer.addEventListener('change', preview);
  preview();
}

for (const form of document.querySelectorAll('form')) {
  form.addEventListener('submit', () => {
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    if (button.dataset.busy) {
      button.dataset.originalText = button.textContent;
      button.textContent = button.dataset.busy;
    }
  });
}
window.addEventListener('pageshow', () => {
  for (const button of document.querySelectorAll('button[aria-busy="true"]')) {
    button.disabled = false;
    button.removeAttribute('aria-busy');
    if (button.dataset.originalText) button.textContent = button.dataset.originalText;
  }
});

// Exchange the one-time fragment for a short-lived server-side grant. The
// fragment never enters HTTP logs; reloading the form keeps activation working.
const activationToken = new URLSearchParams(location.hash.slice(1)).get('activate');
if (activationToken && document.querySelector('#activate-form')) {
  history.replaceState(null, '', location.pathname);
  const error = document.querySelector('#activation-error');
  const loginForm = document.querySelector('#login-form');
  const activateForm = document.querySelector('#activate-form');
  const csrf = activateForm.elements.csrf.value;
  loginForm.hidden = true;
  activateForm.hidden = true;
  document.querySelector('#login-heading').textContent = 'Activatielink controleren…';
  document.querySelector('#login-description').textContent = 'Een ogenblik.';
  fetch('./', {method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: new URLSearchParams({action: 'activation_exchange', token: activationToken, csrf})})
    .then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Activeren lukt nu niet. Open je activatielink opnieuw.');
      document.querySelector('#login-heading').textContent = 'Kies je wachtwoord';
      document.querySelector('#login-description').textContent = 'Met dit wachtwoord log je voortaan in bij je nota’s.';
      activateForm.hidden = false;
      activateForm.elements.password.focus();
    })
    .catch(problem => {
      document.querySelector('#login-heading').textContent = 'Inloggen';
      document.querySelector('#login-description').textContent = 'Gebruik je bestaande account of open je activatielink opnieuw.';
      error.textContent = problem.message;
      error.hidden = false;
      loginForm.hidden = false;
    });
}
const serverError = document.querySelector('.workspace .notice.error');
if (serverError) serverError.focus();
