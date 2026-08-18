---
name: JimDesigns
description: Persoonlijke premium webstudio met een koele, editoriale werktaal.
colors:
  cobalt: "#1557ff"
  cobalt-deep: "#0b3dcc"
  cool-paper: "#f3f5f7"
  clean-surface: "#fcfcfd"
  silver-soft: "#e4e9f0"
  ink: "#101218"
  graphite: "#59616d"
  rule-silver: "#cbd1d9"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(58px, 6.25vw, 96px)"
    fontWeight: 780
    lineHeight: 0.96
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(46px, 5.9vw, 88px)"
    fontWeight: 760
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(38px, 4vw, 58px)"
    fontWeight: 740
    lineHeight: 1
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "normal"
rounded:
  sharp: "0px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
  section: "96px"
components:
  button-accent:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.sharp}"
    padding: "0 22px"
    height: "48px"
  button-accent-hover:
    backgroundColor: "{colors.cobalt-deep}"
    textColor: "{colors.white}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.sharp}"
    padding: "0 22px"
    height: "48px"
  button-ink-hover:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.white}"
  button-paper:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sharp}"
    padding: "0 22px"
    height: "48px"
  button-paper-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
---

# Design System: JimDesigns

## Overview

**Creative North Star: "The Cobalt Worktable"**

JimDesigns voelt als een precieze werktafel waarop strategie, ontwerp en code zichtbaar bij elkaar komen. Koel papier, zilver, inkt en één kobaltblauw materiaalvlak vormen een persoonlijke premium studio-uitstraling: professioneel en rustig, maar nooit afstandelijk of generiek.

De compositie is editoriaal en asymmetrisch. Grote Manrope-typografie, brede fotografie, scherpe overlappingen en wisselende sectieritmes maken het werk tastbaar zonder fictieve dashboards, klanten of bewijs. Ook het portfolio blijft één open werktafel: losse procesbeelden, één eerlijke case en veel ademruimte vervangen het voorspelbare raster van projectkaarten. De vormgeving blijft vlak en direct; karakter komt uit schaal, uitsnede, ritme en echt materiaalbeeld.

**Key Characteristics:**

- Koel wit, zilver, inkt en functioneel kobalt.
- Grote compacte Manrope-koppen met uitgesproken schaalverschil.
- Scherpe, radiusloze vlakken en dunne constructieve lijnen.
- Editoriale asymmetrie, overlap en per sectie een eigen compositierol.
- Geloofwaardige studiofotografie zonder klantmerken of leesbare nep-interface.
- Eén open portfolio-werktafel met echt procesbeeld en één aantoonbaar project.

## Colors

Het palet leest als een koele fysieke werkplek: lichte papierlagen, technisch zilver, diepe inkt en één krachtig kobaltblauw accent.

### Primary

- **Werktafelkobalt** (`cobalt`): primaire CTA's, actieve interactie, materiaalvlakken en beslissende sectieovergangen.
- **Diep kobalt** (`cobalt-deep`): hoverstaat van de kobaltknop; geen tweede decoratieve accentkleur.

### Neutral

- **Koel papier** (`cool-paper`): standaard pagina-achtergrond en lichte basis achter tekst en fotografie.
- **Schoon oppervlak** (`clean-surface`): verhoogde functionele panelen, zoals het mobiele menu.
- **Zacht zilver** (`silver-soft`): rustige beeldplaceholder en scrollbarbaan.
- **Inkt** (`ink`): primaire tekst, donkere CTA's en de sterkste constructieve lijnen.
- **Grafiet** (`graphite`): ondersteunende tekst met lagere nadruk.
- **Regelzilver** (`rule-silver`): scheidingen, randen en structuur zonder kaartgevoel.
- **Helder wit** (`white`): tekst op kobalt of inkt en de lichte contactknop.

**The Functional Cobalt Rule.** Gebruik kobalt voor actie, materiaalgewicht of overgang; nooit als losse gradient, gloed of willekeurige decoratie.

## Typography

**Display Font:** Manrope (met Arial en sans-serif als fallback)

**Body Font:** Manrope (met Arial en sans-serif als fallback)

**Character:** Eén moderne sans-serif draagt het hele systeem. Gewicht, schaal, compacte regelafstand en negatieve tracking creëren het onderscheid; niet een decoratieve tweede fontfamilie.

### Hierarchy

- **Display** (780, `clamp(58px, 6.25vw, 96px)`, 0.96): de grootste hero-belofte en bovengrens van het systeem; 96px is de vaste desktopcap.
- **Headline** (760, `clamp(46px, 5.9vw, 88px)`, 0.98): kernuitspraken die een nieuwe sectie openen. De portfolio-thesis gebruikt een compacte variant tot 88px met 0.94 regelafstand; het grote projectstatement mag binnen de displaycap tot 96px groeien.
- **Title** (740, `clamp(38px, 4vw, 58px)`, 1): processtappen en belangrijke lokale koppen.
- **Body** (400, 16px, 1.7): uitleg met een compacte leesbreedte van grofweg 500–640px.
- **Label** (800, 13px, 1): navigatie, knoppen, links en procesnummers; behoud normale letterkast.

**The Scale Before Ornament Rule.** Maak hiërarchie met schaal, gewicht en witruimte; voeg geen serif, cursief of uppercase eyebrow toe als snelle premiumtruc.

## Layout

De desktopbasis is een gecentreerde paginaschil van maximaal 1480px met 36px zijruimte. Brede secties gebruiken asymmetrische 7/5- of 8/4-verhoudingen en, waar beeld en tekst overlappen, een twaalfkoloms raster. Verticale sectieruimte schaalt met de viewport en landt op mobiel doorgaans op 96px.

De portfolio opent in een 4/8-verdeling: links een compacte thesis, uitleg en CTA, rechts de echte Berfume-site dominant op een MacBook. Op mobiel stapelt dit naar tekst gevolgd door beeld. Daarna krijgt de enige projectcase de volledige breedte met een grote kop, drie feitelijke inhoudsrijen, een brede echte sitescreenshot en een asymmetrische tekst-beeldverdieping; er is nergens een kunstmatig projectraster.

Bij 1020px verdwijnt de desktopnavigatie en wordt de zijruimte 20px. Bij 760px wordt de zijruimte 16px, worden rastercomposities gestapeld en blijven beeld-tekstoverlappingen als gecontroleerde verschuiving van 16px behouden. Onder 420px mag een primaire hero-actie de volle breedte innemen.

**The Varied Composition Rule.** Geef hero, diensten, proces, over, portfolio en contact ieder een eigen ruimtelijke rol; herhaal geen raster van uniforme kaarten.

**The Open Worktable Rule.** Laat procesbeelden en één echte case vrij over het oppervlak bewegen; vul beperkte portfolio-inhoud nooit op met lege of verzonnen projectkaarten.

## Elevation & Depth

Het systeem is vlak: inhoudsvlakken krijgen geen decoratieve schaduw. Diepte ontstaat door tonale lagen, fotografie, overlap, scherpe kleurwissels en sticky positionering. De huidige mobiele navigatie gebruikt één functionele overlayschaduw (`0 20px 48px rgba(16, 18, 24, 0.16)`) om het tijdelijke paneel van de pagina te scheiden; deze uitzondering wordt niet doorgetrokken naar contentcontainers. Focus op kobalt gebruikt een zichtbare ring en is interactiestatus, geen elevatie.

**The Flat Worktable Rule.** Houd content op het oppervlak; reserveer visuele elevatie uitsluitend voor een tijdelijk functioneel overlaypaneel.

## Shapes

Vlakken, knoppen, menu's en beeldkaders hebben harde hoeken (0px radius). Dunne lijnen van 1px organiseren navigatie, bewijsregels, diensten en processtappen. Overlap wordt rechthoekig uitgesneden; afgeronde kaarten, pills en zachte blobs horen niet bij deze materiaaltaal.

**The Hard Edge Rule.** Als een component een container nodig heeft, gebruik dan een scherpe rechthoek, een constructieve lijn of een kleurvlak—geen afgeronde kaart.

## Components

### Buttons

- **Shape:** scherpe rechthoek (0px radius), minimaal 48px hoog en horizontaal 22px padding.
- **Primary:** wit op werktafelkobalt; bedoeld voor de belangrijkste contactactie.
- **Hover / Focus:** hover verschuift 2px omhoog en verdiept de kleur in 180ms; focus krijgt een contrastrijke 3px-kobaltlijn met 4px offset; active landt 1px lager.
- **Secondary:** wit op inkt; hover wisselt functioneel naar kobalt.
- **Inverse:** inkt op wit binnen een kobaltvlak; hover wordt wit op inkt.

### Cards / Containers

- **Corner Style:** volledig scherp (0px radius).
- **Background:** koel papier, schoon oppervlak, zacht zilver of kobalt afhankelijk van inhoudsgewicht.
- **Shadow Strategy:** geen schaduw voor contentcontainers; gebruik lijn, kleurvlak of overlap.
- **Border:** 1px in regelzilver of inkt wanneer een structuurgrens nodig is.
- **Internal Padding:** responsief en royaal; grote statementvlakken gebruiken ongeveer 34–96px.

### Navigation

De gedeelde header combineert links het transparante SVG-monogram met de woordmarkering, centraal de desktopnavigatie en rechts de vaste contactactie. Desktoplabels zijn compact (13px); hover onderstreept met ruime offset en de huidige pagina wordt semantisch met `aria-current="page"` gemarkeerd en visueel kobalt. Op smallere schermen wordt dit een scherp omlijnde `details`-toggle; dezelfde huidige-paginastatus blijft semantisch aanwezig, het open paneel gebruikt een witte oppervlakte, duidelijke rijlijnen en een volle kobaltactie. Elke link sluit het menu na selectie.

### Brand Lockup

Het monogram is één scherpe, transparante SVG zonder achtergrondplaat. In de lichte header staat het in inkt naast `jimdesigns`; in de donkere footer wordt hetzelfde bestand wit geïnverteerd. Schaal het monogram als beeldmerk en plaats het nooit in een afgeronde badge of extra container.

### Service Rows

Elke dienst is een brede inhoudsrij, geen kaart. De titel en uitleg staan op desktop in een 7/5-verhouding; hover vult de hele rij met kobalt en schuift beide tekstkolommen 18px in dezelfde richting. Op mobiel stapelen titel en uitleg en verkleint de verschuiving naar 10px.

### Proof Rail

Drie feitelijke bewijsregels delen één horizontale rail met dunne scheidingen. Op mobiel worden ze één kolom met horizontale tussenlijnen; de inhoud blijft tekstueel en verzint geen metrics of badges.

### Open Worktable Portfolio

De portfoliohero koppelt een korte thesis en kobaltactie direct aan een brede Higgsfield-presentatie van de echte Berfume-homepage op een MacBook. De volledige presentatie is klikbaar naar berfume.nl. Daarna toont de pagina de echte, volledig geladen sitescreenshot op groot formaat, gevolgd door een compacte feitelijke uitleg en een tweede klikbaar beeld. Eén herkenbare webshopcase krijgt de volledige breedte en voldoende ritme; dit patroon is een showcase, geen herhaalbare kaartcomponent.

### Site Footer

De footer is een substantieel donker merkvlak, niet alleen een smalle juridische afsluiter. Een groot wit SVG-monogram en een statement tot de 96px-typografiecap openen het vlak; daaronder volgen de witte CTA, merkbeschrijving, navigatie, rechtstreeks e-mailadres en basisregel. Op mobiel stapelt de footer tot één kolom, maar behoudt hij dezelfde visuele massa en duidelijke contactactie.

## Do's and Don'ts

### Do:

- **Do** gebruik kobalt voor primaire actie, materiaalvlak of duidelijke sectieovergang.
- **Do** bouw hiërarchie met grote schaalverschillen, compacte kopregels en royale witruimte.
- **Do** varieer de compositie per sectie en ontwerp de mobiele stapeling bewust mee.
- **Do** gebruik geloofwaardige werktafel- en studiofotografie zonder klantmerken of leesbare nep-interface.
- **Do** presenteer het portfolio als één open werktafel met één eerlijke case en echte procesbeelden.
- **Do** gebruik het transparante SVG-monogram rechtstreeks en behoud de huidige-paginastatus in gedeelde navigatie.
- **Do** sluit lange pagina's af met het substantiële donkere merkvlak, de grote markering en rechtstreeks contact.
- **Do** behoud zichtbare toetsenbordfocus en respecteer `prefers-reduced-motion`.

### Don't:

- **Don't** voeg gradients, gloed, decoratieve schaduwen of een tweede accentkleur toe.
- **Don't** rond knoppen, containers of beelden af en gebruik geen pills of zachte blobs.
- **Don't** vervang de editoriale asymmetrie door een gecentreerde standaardhero of drie gelijke featurekaarten.
- **Don't** maak van het portfolio een grid van lege, herhaalde of verzonnen projectkaarten.
- **Don't** plaats het transparante monogram in een gekleurde tegel, afgeronde badge of eigen achtergrondvlak.
- **Don't** introduceer serif, cursief, uppercase eyebrows of agencyclichés als premiumversiering.
- **Don't** verzin klanten, cases, dashboards, cijfers, testimonials of resultaten.
