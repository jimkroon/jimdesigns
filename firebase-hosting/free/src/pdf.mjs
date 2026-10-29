import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';
import {money,numberLabel,dateLabel,invoiceTotals,percentLabel} from './core.mjs';
import {invoiceBrand} from './invoice-brand.mjs';
export async function invoicePdf(invoice) {
  const totals=invoiceTotals(invoice);
  const document=await PDFDocument.create();const page=document.addPage([595.28,841.89]);
  const font=await document.embedFont(StandardFonts.Helvetica);const bold=await document.embedFont(StandardFonts.HelveticaBold);
  const text=(x,top,value,size=11,color=rgb(.14,.14,.14),strong=false)=>page.drawText(value,{x,y:841.89-top,size,font:strong?bold:font,color});
  const width=(value,size)=>font.widthOfTextAtSize(value,size);
  const lines=(value,max,size)=>{
    const result=[];let line='';
    for(const char of value) {if(line&&width(line+char,size)>max){result.push(line.trimEnd());line=char.trimStart();}else line+=char;}
    if(line)result.push(line);return result;
  };
  const wrapped=(x,top,value,max,size=11,height=16)=>{for(const line of lines(value,max,size)){text(x,top,line,size);top+=height;}return top;};
  const right=(edge,top,value,size=11)=>text(edge-width(value,size),top,value,size);
  const rule=top=>page.drawLine({start:{x:50,y:841.89-top},end:{x:545.28,y:841.89-top},thickness:.5,color:rgb(.8,.8,.78)});
  const label=numberLabel(invoice.number);
  const logo=await document.embedPng(invoiceBrand.logoDataUri);
  const logoWidth=40,logoHeight=logoWidth*invoiceBrand.logoHeight/invoiceBrand.logoWidth;
  page.drawImage(logo,{x:50,y:841.89-44-logoHeight,width:logoWidth,height:logoHeight});
  text(101,68,invoiceBrand.name,18);
  right(545.28,61,'NOTA',18);right(545.28,82,label,10);
  let subtitle=invoice.description;
  if(width(subtitle,12)>465){while(width(subtitle+'…',12)>465)subtitle=subtitle.slice(0,-1);subtitle+='…';}
  text(50,109,subtitle,12);rule(145);
  for(const [person,x,heading] of [[invoice.seller,50,'VAN'],[invoice.customer,330,'AAN']]) {
    text(x,178,heading,8,rgb(.45,.45,.45));const max=x===50?240:215;let size=11;
    while(size>6&&['name','company','address','city'].reduce((height,key)=>height+(person[key]?lines(person[key],max,size).length*(size+2)+3:0),0)>110)size-=.5;
    let top=199;for(const key of ['name','company','address','city'])if(person[key])top=wrapped(x,top,person[key],max,size,size+2)+3;
  }
  text(50,324,'Datum',9,rgb(.45,.45,.45));text(50,344,dateLabel(invoice.date));
  page.drawRectangle({x:50,y:422,width:495.28,height:35,color:rgb(.95,.95,.94)});
  text(63,407,'Omschrijving',10);right(532,407,'Bedrag',10);
  const bottom=wrapped(63,446,invoice.description,345);right(532,446,money(totals.subtotal_cents));
  const rowBottom=Math.max(506,bottom+12);rule(rowBottom);
  let totalTop=rowBottom+34;
  if(totals.discount_basis_points>0){
    text(330,rowBottom+24,'Subtotaal',10);right(532,rowBottom+24,money(totals.subtotal_cents),10);
    text(330,rowBottom+44,'Korting ('+percentLabel(totals.discount_basis_points)+')',10);right(532,rowBottom+44,'- '+money(totals.discount_cents),10);
    rule(rowBottom+58);totalTop=rowBottom+82;
  }
  text(330,totalTop,'Te betalen',13);right(532,totalTop,money(totals.amount_cents),13);
  const paymentTop=Math.max(634,totalTop+68);text(50,paymentTop,'Betaling',12);text(50,paymentTop+28,totals.amount_cents===0?'Er hoeft geen bedrag te worden overgemaakt.':'Maak '+money(totals.amount_cents)+' over naar:');
  text(50,paymentTop+54,invoice.seller.iban.match(/.{1,4}/g).join(' '),12);wrapped(50,paymentTop+76,'Ten name van '+invoice.seller.name,480);
  text(50,paymentTop+116,'Vermeld bij de betaling: nota '+label+'.');
  document.setTitle('JimDesigns - Nota '+label);document.setCreator('JimDesigns Notas');return document.save();
}
