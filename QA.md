# Informe de verificació — v2.0.0

Data: 2026-10-01. Aquest informe separa les proves executades de les comprovacions pendents en un allotjament real. No s’ha substituït cap resultat fallit per una afirmació de compatibilitat.

## Resultats executats

| Bloc | Resultat | Què s’ha executat |
|---|---:|---|
| Motor, dades i generadors | **339 aprovades, 0 fallides** | Codi JavaScript real amb Node.js, sense dependències |
| Service worker i manifest | **24 aprovades, 0 fallides** | Script real `sw.js` amb CacheStorage simulat i bytes reals dels fitxers |
| Interfície | **246 comprovacions aprovades** | Chromium real, DOM i canvas reals; càlcul en un Blob Worker real; entrada de dades i clics amb Playwright |

Les xifres són comprovacions automatitzades, no 609 demostracions matemàtiques independents ni una garantia d’absència d’errors. Fitxers de resultats: `tests/results/unit-results.txt` i `tests/results/ui-results.json`.

### Motor i continguts

Parser amb llista blanca; entrades invàlides; potències negatives; derivades i comprovacions de primitives; arrels polinòmiques; bisecció; límits racionals; integració i rebuig de singularitats detectades; matrius i Gauss per a sistemes compatibles determinats, indeterminats i incompatibles; casos paramètrics; Bayes; binomial gran sense factorials; normal; intervals; estadística; geometria; model financer; 8 generadors reproduïbles; integritat dels 31 temes, 12 proves, 64 registres, 14 fragments i 4 plans.

Es contrasten valors de fragments oficials: sistema de setembre 2024 (m=0: -11, -3, 7; casos m=1 i m=2); àrea 9; binomial 0,5904; posterior negatiu 0,01/0,806; àrea geomètrica 16 el setembre 2026; punts estacionaris del model de seguidors a x=3 i x=5; normalització z=1,96 sense correcció a CCSS juny 2026; interval aproximat [2,9351; 2,9649]; producte de matrius [1333, 533, 134]; sistema de beques [830, 103, 103]. Aquests contrastos no s’estenen a una correcció automàtica integral de totes les proves.

### Interfície i representació

S’han recorregut les 8 seccions i els 31 temes; provat les 13 eines amb les dades de mostra; carregat els 14 fragments PAU; verificat cerques, anys, matèries, convocatòries, preferits, notes, estat, dossier, generadors, exercici propi, reordenació del pla, canvi de trimestre i sessions; comprovat exportació/importació JSON i rebuig d’importació invàlida; restaurat una instància de l’app amb l’estat desat; comprovat text HTML escapat; mode projecció; tema fosc; controls de gràfica; i CSS d’impressió amb resolucions obertes.

Verificació d’absència de desbordament horitzontal a **320, 390, 768 i 1024 px**, sobre 8 vistes. Revisió visual de captures d’escriptori, mòbil, laboratori clar/fosc i vista d’impressió. No s’ha fet una auditoria formal WCAG ni una revisió de totes les combinacions possibles de dades.

### Adaptació necessària del banc de proves

El navegador gestionat de l’entorn bloqueja la navegació a URL, inclosa localhost. No s’han modificat aquestes polítiques. Per provar la interfície s’ha injectat el contingut real de l’app en una pàgina `about:blank`: CSS i codi locals, respostes `fetch` dels JSON reals i un magatzem `localStorage` en memòria. Els imports es combinen per a aquest escenari; el motor s’executa en un Worker de Blob real. La política CSP original es comprova al codi, però no forma part d’aquesta prova injectada.

Això prova la lògica, el renderitzat i les interaccions descrites; **no prova la persistència real del navegador, la càrrega nativa de tots els mòduls a GitHub Pages, el cicle real del service worker ni la instal·lació del sistema operatiu**. La prova del service worker és una simulació separada i s’etiqueta explícitament així.

## Errors detectats i corregits durant les proves

S’ha corregit la derivació d’exponents enters negatius; la classificació de sistemes amb files a escales molt diferents; el tractament de coeficients quadràtics petits; la comprovació de singularitats trigonomètriques elementals; el càlcul financer amb tipus molt petits; tres etiquetes `option` incompletes; desbordaments de la capçalera i del dossier a 320 px; contrast de botons secundaris en mode fosc; i la distribució inicial de sessions, ara diferenciada per curs.

## Comprovacions pendents després de publicar

1. Obrir l’URL real de GitHub Pages; comprovar que no hi hagi errors de càrrega de `js/`, `data/` o `sw.js` i que les 5 opcions de curs estiguin disponibles.
2. Instal·lar des de Chrome/Edge en un portàtil, Safari en iPhone/iPad i Chrome en Android. Verificar la icona, l’arrencada i la mida de la finestra.
3. Un cop preparada la còpia local, tancar l’app, desconnectar la xarxa i tornar a obrir-la. Comprovar temes, càlculs i PDF curriculars locals. Els PDF PAU externs no estan previstos per funcionar offline.
4. Desar una nota, tancar i obrir el navegador; exportar i importar el JSON en un segon dispositiu. Confirmar el comportament real d’emmagatzematge i permisos.
5. Publicar un canvi de versió de prova i verificar l’avís d’actualització, la conservació de notes i la neteja només de les memòries cau de l’app.
6. Fer una impressió A4 / Desa com a PDF en el navegador d’ús. Les captures CSS d’impressió no equivalen a totes les combinacions de paginació, impressora i escala.

## Límits que es mantenen

No és un CAS universal. No resol qualsevol enunciat ni fotografia; no integra qualsevol funció; no certifica el domini global; no implementa tots els possibles tipus de geometria, discussió paramètrica o inferència; i no incorpora un solucionari automàtic complet de les 64 preguntes. Els resultats numèrics requereixen interpretar hipòtesis i toleràncies. Els documents oficials externs no estan desats dins el paquet. Cap prova local substitueix la revisió del docent abans d’utilitzar una resolució a classe.
