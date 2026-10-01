# Matemàtiques Batxillerat · Guia docent
## Versió 2.0.0 — candidata d’ús docent

Eina en català per preparar classes de Matemàtiques I i II i de Matemàtiques Aplicades a les Ciències Socials I i II. Aquesta versió substitueix la base anterior; no és només un paquet d’icones.

**Primer pas:** descomprimeix el ZIP i puja **els fitxers i les carpetes que conté, directament a l’arrel del repositori**. No pugis el ZIP com un fitxer únic. `index.html`, `sw.js` i `manifest.json` han de quedar junts a l’arrel; conserva `js/`, `data/`, `icons/` i `docs/`.

### Publicar a GitHub Pages

1. Al repositori, substitueix la versió anterior pels fitxers d’aquesta entrega i confirma els canvis.
2. A **Settings → Pages**, selecciona **Deploy from a branch → main → /(root)**. Si la branca principal té un altre nom, selecciona-la.
3. Obre l’adreça HTTPS que mostri GitHub Pages quan s’hagi completat la publicació. No obris l’adreça d’un fitxer dins de github.com ni facis doble clic a l’HTML.
4. Si encara veus l’app antiga, tanca totes les finestres i pestanyes d’aquesta app i torna-la a obrir. El service worker anterior pot mantenir la versió vella mentre hi hagi finestres obertes. A partir de la v2, la mateixa app mostrarà un avís quan hi hagi una actualització preparada.
5. A **Dades, fonts i ajuda**, comprova que la còpia local estigui preparada. Després utilitza **Instal·la l’app**, o el menú d’instal·lació del navegador.

No cal cap API, clau, subscripció, servidor d’aplicació, npm ni procés de compilació per publicar-la. L’app usa rutes relatives i admet un repositori de projecte, no només el domini principal.

**iPhone/iPad:** Safari → Compartir → Afegeix a la pantalla d’inici. **Android:** Chrome → menú → Instal·la l’aplicació / Afegeix a la pantalla d’inici. **Portàtil:** Chrome/Edge, icona o menú d’instal·lació; en Safari de macOS, Afegeix al Dock quan estigui disponible. El nom exacte del menú depèn del sistema i del navegador.

### Provar-la localment

Dins la carpeta que conté `index.html`, executa:

```sh
python3 -m http.server 8080
```

A Windows, amb Python instal·lat, també pots utilitzar `py -m http.server 8080`. Obre `http://localhost:8080/`. El doble clic sobre `index.html` no és compatible amb la càrrega de mòduls, el JSON i la instal·lació PWA.

## Què inclou

- **31 temes** amb idea central, prerequisits, formulari comentat, guió d’explicació, errors, pregunta de sortida i referència a les pàgines del currículum. **39 exemples propis resolts**.
- **12 exàmens oficials**: Matemàtiques II i CCSS II; juny i setembre de **2024, 2025 i 2026**. **64 registres** de pregunta/opció i enllaços als 12 enunciats i als 12 criteris oficials. Les opcions 4A i 4B s’indexen per separat. No s’inclouen tribunals especials o d’incidències.
- Comparativa curricular per matèria i any, amb recompte **per prova**, no per puntuació. Una etiqueta no detectada no vol dir que el saber quedi exclòs del curs.
- **14 fragments matemàtics de preguntes oficials carregables** al laboratori: la procedència, el que es calcula i les ampliacions didàctiques estan explicitats. No s’afirma que el motor resolgui automàticament les 64 preguntes completes.
- **13 eines de càlcul**; gràfiques, derivades, tangent, secant, curvatura, primitives admeses, quadratura, equacions, límits, sistemes, matrius, probabilitat, estadística, geometria i un model financer escolar.
- Quatre plans de curs editables. Propostes de **108, 106, 98 i 96 sessions de contingut**, respectivament per a Matemàtiques I, CCSS I, Matemàtiques II i CCSS II. El pressupost orientatiu de 128 sessions a I i 112 a II és un escenari de treball, **no una dotació ni un calendari oficial**. La resta queda com a reserva per a avaluació, retorn, projectes i imprevistos.
- Preferits, notes, estat de preparació, dossier, **8 famílies de variants resoltes** amb llavor reproduïble, exercicis propis, exportació/importació JSON, exportació PNG de gràfiques, impressió de la vista i mode projecció.

## Un primer recorregut útil

Selecciona **Matemàtiques II** a la capçalera. Obre **Temari → Derivada** i prepara l’explicació; afegeix-hi les notes. Passa al **Laboratori**, calcula `x^3-3*x` i activa f′, f′′, tangent i secant. Des del **Banc PAU**, filtra **2026 → CCSS → Juny** i obre els fragments de la pregunta 3: compara la binomial amb l’aproximació normal sense correcció de continuïtat, i comprova l’interval de confiança. Afegeix referències i exemples al **Dossier**. Finalment, exporta la còpia de seguretat a **Dades i ajuda**.

## Abast matemàtic: llegeix-lo abans d’utilitzar resultats

Les derivades es calculen simbòlicament per regles. Les primitives cobreixen polinomis, sumes, factors constants i algunes funcions elementals amb argument afí; no inclouen qualsevol substitució ni integració per parts. Quan no hi ha una primitiva implementada, l’app ho diu, i pot calcular una integral definida numèrica quan les comprovacions d’interval ho permeten.

El domini de l’expressió original preval sobre el d’una simplificació. La gràfica es mostreja: no prova continuïtat, no detecta tots els forats i no certifica un domini simbòlic complet. Les funcions a trossos es treballen tram a tram. No hi ha reconeixement de fotografies ni interpretació d’enunciats lliures.

Arrels, límits racionals, rangs, integrals i probabilitats utilitzen nombres en coma flotant. Es mostren aproximacions i restriccions. No s’admeten integrals impròpies; l’estimació d’error de Simpson no és una cota rigorosa. El solucionador de límits no prova límits transcendents: hi ofereix una taula. La discussió de sistemes paramètrics és per a matrius 2×3 o 3×4 amb coeficients polinòmics en m. Si el determinant és idènticament nul, no substitueix una discussió simbòlica completa dels rangs.

La distribució normal acumulada s’aproxima numèricament. Els intervals implementats són normals, amb controls de mida mostral i d’aplicabilitat; no inclouen t de Student. La regressió automàtica és lineal, no quadràtica. Els sistemes gairebé singulars, arrels múltiples mal condicionades, cues extremes i funcions molt oscil·latòries requereixen comprovació addicional.

## Offline, dades i privacitat

El temari, la classificació PAU, les eines, les icones essencials i els dos currículums es precarreuen en una memòria cau del service worker. Cal haver completat el primer accés a través d’HTTPS o localhost. **Els enunciats i les correccions PAU són enllaços oficials externs i necessiten connexió.** No s’han inclòs les seves còpies PDF al ZIP.

Les dades personals de treball es desen en `localStorage`, clau `mates-batx-docent-v2`, dins aquest navegador i origen. No se sincronitzen entre ordinador i mòbil. Netejar dades, navegar en mode privat o canviar d’origen pot fer-les desaparèixer. **Exporta JSON sovint.** La importació valida el format i demana confirmació abans de substituir les dades. No pugis aquestes còpies personals a un repositori públic.

No hi ha analítica, comptes ni enviament de notes a una API. Obrir una font oficial externa crea una connexió amb aquell domini. No introdueixis dades personals d’alumnes: l’app està dissenyada per a preparació docent, no per gestionar qualificacions.

## Codi i manteniment

`js/engine.mjs` conté el parser matemàtic i els algorismes; `solver.mjs`, els resultats estructurats; `worker.mjs`, el fil de càlcul; `generator.mjs`, els exemples reproduïbles; `app.mjs`, la interfície. `data/topics.json`, `exams.json`, `presets.json` i `plans.json` separen contingut i programa. Cada tema pot definir `sessions` per curs. No hi ha dependències JavaScript externes ni `eval` d’entrades.

Per publicar una modificació futura, incrementa `VERSION` de `sw.js` i les etiquetes de versió; publica tot el conjunt de fitxers de manera coherent. La versió nova resta pendent fins que el docent accepta actualitzar o es tanquen totes les finestres anteriors. La memòria cau s’identifica per l’abast del repositori; no s’eliminen les memòries d’altres aplicacions.

```sh
npm test
```

Aquesta ordre requereix Node.js i executa les comprovacions sense instal·lar paquets. La prova visual opcional `tests/ui_smoke.py` requereix Python, Playwright i Chromium; consulta `QA.md` per entendre les adaptacions del banc de proves i allò que **no** ha quedat provat.

## Fonts, autoria i lectura de la comparativa

Consulta `ANALISI_PAU_2024_2026.md` i la secció **Currículum × PAU**. Els dos currículums inclosos són els PDF aportats en la conversa, corresponents al Decret 171/2022. El desplegament en 31 temes, la seqüenciació, les associacions amb criteris d’avaluació i els exemples propis són propostes didàctiques; no s’atribueixen al Departament. Els documents PAU i els seus criteris conserven la seva autoria oficial. Les icones provenen del paquet anterior del mateix projecte.

Revisió de les fonts: **1 d’octubre de 2026**. No s’ha publicat aquesta entrega al teu compte de GitHub ni s’ha provat la instal·lació en dispositius físics. És una candidata funcional amb proves documentades, no una garantia d’absència de qualsevol error.

Documentació tècnica de referència: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) i [instal·lació PWA, MDN](https://developer.mozilla.org/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).
