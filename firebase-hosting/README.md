# Actieve JimDesigns-website op Firebase

`public/` bevat de openbare HTML, CSS, JavaScript, beelden en portfolio-demo’s. `free/src/` bevat de Firebase-contact- en dashboardcode. De eerdere app op de repositoryroot blijft als historie bewaard en is niet de Firebase-publicatiebron.

Bouwen vanaf de repositoryroot:

```sh
npm ci --prefix firebase-hosting/free
npm run build --prefix firebase-hosting/free
```

De GitHub-workflow publiceert alleen Hosting bij een wijziging op main. Firestore-regels en gegevens worden niet gepubliceerd door deze workflow. De verbinding gebruikt kortlevende GitHub OIDC-identiteit, beperkt tot deze repository en main. Geen private sleutel in repository of secrets.

Websitepakketten: zakelijk vanaf €750; themawebshop vanaf €1.250; custom vanaf €2.000; Premium richtprijs €3.000. Website-portfolio: zes fictieve concepten, geen klantcases. De demo-aanvragen versturen niets. Foto/video-bronnen staan onder public/website-concepten/credits.html en provenance/.

Privénota’s, klantgegevens, oude migratiebestanden, wachtwoorden en back-ups horen niet in Git. Firebase-webconfiguratie is publiek; Auth, App Check en Firestore-regels beschermen de gegevens.

## Kortingen en accountbeveiliging

Bij een nieuwe nota kan een korting van 0 tot 100% worden ingevuld, met maximaal twee decimalen. Het bedrag vóór korting, percentage, afgeronde kortingsbedrag in centen en te betalen bedrag worden onveranderlijk opgeslagen. Firestore controleert de berekening onafhankelijk van de browser. Bestaande nota’s zonder kortingsvelden blijven leesbaar en oorspronkelijke PDF’s blijven behouden.

Firebase Authentication beheert de wachtwoordhash. Nieuwe of gewijzigde wachtwoorden moeten servermatig 12–72 tekens hebben; bestaande wachtwoorden blijven bruikbaar bij inloggen. E-mailenumeratiebescherming en App Check voor Firestore zijn actief. Accountverwijdering via de browser is uitgeschakeld. Er staan geen wachtwoorden in Firestore, browserbroncode of administratieback-ups. Sessies verlopen na 30 minuten inactiviteit of maximaal 8 uur.

De 13 geautomatiseerde tests controleren onder meer kortingsgrenzen, afronding, gemanipuleerde bedragen, dubbele inzendingen, gelijktijdige nummering, afgesloten privégegevens en sessies. Browsercontroles met synthetische gegevens bevestigen opslaan, PDF-download en de mobiele weergave.
