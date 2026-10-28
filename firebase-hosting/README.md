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
