import test from 'node:test';
import assert from 'node:assert/strict';
import {PDFDocument} from 'pdf-lib';
import {amountCents,validDate,party,invoiceInput} from '../src/core.mjs';
import {invoicePdf} from '../src/pdf.mjs';
test('Dutch amounts remain integer cents with all supported separators',()=>{
  for(const [value,cents] of [['300',30000],['300,50',30050],['300.5',30050],['1.234,56',123456],['0,01',1],['999.999,99',99999999]])assert.equal(amountCents(value),cents);
  for(const value of ['0','-1','1000000','1,234','1e3','NaN'])assert.throws(()=>amountCents(value));
});
test('Dates, character support and IBAN checks preserve document constraints',()=>{
  assert.equal(validDate('2028-02-29'),true);for(const value of ['2026-02-29','2026-13-01','1999-12-31','2101-01-01'])assert.equal(validDate(value),false);
  assert.throws(()=>party({name:'Test 🧪'}));
  assert.throws(()=>party({name:'Test',iban:'NL00ABNA0417164300'},true));
  assert.equal(party({name:'Test',iban:'nl91 abna 0417 1643 00'},true).iban,'NL91ABNA0417164300');
  assert.throws(()=>invoiceInput({request_key:'x',customer_id:'1',amount:'5',date:'2026-10-28',description:'Test'}));
});
test('Exported invoice is a valid single-page A4 PDF with long supported data',async()=>{
  const seller=party({name:'Voorbeeldbedrijf '+ 'W'.repeat(50),company:'','address':'Teststraat 1','city':'1234 AB Teststad',iban:'NL91ABNA0417164300'},true);
  const bytes=await invoicePdf({number:5,seller,customer:{...seller,name:'Één testklant'},date:'2026-10-28',description:'W'.repeat(180),amount_cents:30050});
  const pdf=await PDFDocument.load(bytes);assert.equal(pdf.getPageCount(),1);assert.equal(pdf.getTitle(),'JimDesigns - Nota 005');assert.equal(pdf.getPages()[0].getWidth(),595.28);
});
