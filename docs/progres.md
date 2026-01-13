# Document d’avancement du projet

Ce document retrace l’évolution du projet de visualisation de données portant sur les classements *Top 50 Spotify*, depuis la phase d’exploration jusqu’au développement des visualisations interactives finales.

---

## 29/11/2025 — Exploration initiale

- Exploration des jeux de données disponibles autour des classements Spotify.
- Identification de plusieurs sources pertinentes sur Kaggle, couvrant :
  - les classements par pays récents,
  - les classements mondiaux par année,
  - les genres musicaux et caractéristiques audio.
- Premières réflexions sur la faisabilité des visualisations à différentes échelles (temporelle et géographique).

---

## 07/12/2025 — Choix de conception

- Revue des premières esquisses de visualisations.
- Discussion autour des choix graphiques (cartes, graphiques temporels, diagrammes circulaires).
- Définition des grandes fonctionnalités attendues pour le site final.

---

## 12/12/2025 — Pré-traitement des données

- Discussion sur les étapes de nettoyage et de fusion des différentes sources de données.
- Réflexion sur la création de jeux de données intermédiaires adaptés aux visualisations prévues.

---

## 16/12/2025 — Lancement du développement

- Début effectif du pré-traitement des données et de la fusion des sources.
- Mise en place d’un jalon pour le rendu intermédiaire avec les objectifs suivants :
  - constitution d’une collection de données complète,
  - début du clustering des musiques,
  - mise en place d’au moins une visualisation cartographique,
  - réalisation d’une première maquette du site.

---

## 29/12/2025 — Tentative d’enrichissement via l’API Spotify

- Tentative d’utilisation de l’API Spotify pour récupérer les pays d’origine des chansons manquantes.
- Constat d’une limitation de l’API : absence d’information fiable sur le pays d’origine des titres.

---

## 10/01/2025 — Développement des visualisations principales

- Développement d’une interface de visualisation temporelle permettant d’analyser l’évolution de plusieurs métriques audio Spotify (danceability, energy, loudness, tempo, valence, etc.).
- Mise en place d’un graphique temporel multi-variables :
  - affichage simultané de plusieurs métriques,
  - sélection dynamique des variables via des cases à cocher,
  - adaptation automatique de l’axe des ordonnées selon les métriques sélectionnées.
- Ajout de tooltips interactifs pour afficher les valeurs précises au survol.
- Développement d’une première version de la carte interactive basée sur un planisphère mondial.
- Intégration et analyse de deux jeux de données distincts :
  - Top 50 de 71 pays (2023–2025),
  - Top 50 mondial par année (2000–2023).
- Recherche d'exemples de clustering de données audio pour guider le développement puisqu'un clustering par genre n'était pas si pertinent.

---

## 12/01/2025 — Enrichissement et nouvelles visualisations

- Mise en place d’un mapping entre les pays et leurs codes ISO pour l’affichage cartographique.
- Ajout de tooltips interactifs sur la carte pour afficher les informations par pays.
- Ajout d’un tableau récapitulatif affichant le Top 50 par pays ou le Top 50 mondial lors de la sélection d’un pays.
- Implémentation d’un slider temporel dynamique s’adaptant au jeu de données sélectionné.
- Développement d’un outil d’enrichissement du dataset à l’aide de l’API MusicBrainz grace a un LLM afin d’ajouter les pays d’origine des chansons lorsque l’information était absente.
- Développement d’une visualisation par diagrammes circulaires permettant de comparer la répartition des genres musicaux entre différentes années :
  - comparaison de deux années via des sliders,
  - légende commune partagée entre les graphiques,
  - tooltips affichant les proportions par genre.
- Finalisation du clustering des musiques à partir de leurs caractéristiques audio.
- Début du développement de la visualisation des clusters à l’aide :
  - d’un scatter plot interactif,
  - d’un radar chart associé pour représenter les profils audio moyens.

---

## 13/01/2025 — Finalisation et structuration du projet

- Amélioration de l’interactivité entre le scatter plot et le radar chart.
- Ajout de tooltips détaillés et d’une légende pour faciliter la compréhension des clusters.
- Restructuration complète du dépôt :
  - clarification de l’arborescence des fichiers,
  - séparation claire entre pages, scripts, styles, données et ressources.
- Harmonisation du site (navigation, styles, typographie).
- Résolution de problèmes liés au déploiement sur GitHub Pages.
- Correction de bugs JavaScript et amélioration de la robustesse du code.

---

## État actuel du projet

À ce stade, le projet dispose :
- de plusieurs visualisations interactives fonctionnelles (cartes, graphiques, diagrammes circulaires, etc.),
- d’un site structuré et cohérent,
- de jeux de données nettoyés, enrichis et adaptés aux besoins des visualisations,