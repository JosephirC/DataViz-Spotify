# DataViz Spotify — Visualisations interactives avec D3.js (M2 Lyon 1)

Projet réalisé dans le cadre du cours **Visualisation Interactive de Données** (Master 2, Université Lyon 1, 2025–2026).  
Page du cours / suivi des projets : https://lyondataviz.github.io/teaching/lyon1-m2/2025/projets.html

## Objectif

Spotify publie des classements **Top 50** par pays, mais ces listes restent difficiles à comparer et ne permettent pas d’observer simplement les tendances globales (géographie, évolution temporelle, caractéristiques musicales).

Ce projet propose un site de visualisation interactive permettant :
- d’explorer la répartition géographique des titres populaires (par pays et par période),
- de comparer la répartition des **genres musicaux** entre différentes années,
- d’analyser l’évolution des **métriques audio** (tempo, danceability, energy, etc.) au fil du temps,
- d’étudier des **familles de morceaux** assimilables à des genres via un clustering sur les caractéristiques audio.

(Contexte et tâches détaillées dans le document de cadrage.)  

## Fonctionnalités principales

- **Carte interactive (choroplèthe / planisphère)**
  - Deux modes selon le dataset sélectionné (Top 50 par pays récent / Top 50 mondial par année).
  - Tooltips et interactions (sélection d’un pays, filtre par année, etc.).
  - Affichage d’un tableau récapitulatif Top 50 en contexte avec lecteur audio.

- **Comparaison des genres**
  - Comparaison interactive entre deux années via sliders.
  - Légende commune + tooltips.
 
- **Évolution des métriques audio**
  - Courbes temporelles multi-variables (sélection dynamique des métriques).
  - Tooltips au survol.

- **Clustering**
  - Heatmap des profils audio moyens par cluster (comparaison relative entre clusters pour chaque caractéristique).
  - Projection PCA des morceaux pour visualiser les groupes.
  - Radar chart interactif pour explorer le profil audio détaillé d’un cluster.
  - Interactions croisées entre les visualisations (hover, sélection).
  
- **Sources des données**
  - Une page dédiée détaille l'origine des datasets (Kaggle) et le processus d'enrichissement via **MusicBrainz**.

## Données utilisées

Sources Kaggle :
- Top Spotify Songs in 73 Countries (daily updated)  
  https://www.kaggle.com/datasets/asaniczka/top-spotify-songs-in-73-countries-daily-updated
- Best Songs on Spotify for Every Year (2000–2023)  
  https://www.kaggle.com/datasets/conorvaneden/best-songs-on-spotify-for-every-year-2000-2023
- Top Hits Spotify (2000–2019)  
  https://www.kaggle.com/datasets/paradisejoy/top-hits-spotify-from-20002019

Enrichissement :
- L’API Spotify ne permet pas de récupérer de façon fiable le **pays d’origine** d’un titre.
- Un enrichissement a donc été réalisé avec **MusicBrainz** pour compléter certaines informations manquantes (pays associés aux artistes/enregistrements).  
  https://musicbrainz.org/doc/MusicBrainz_API

## Structure du projet

- `index.html` : page d’accueil
- `404.html` : page d’erreur (GitHub Pages)
- `src/pages/` : pages de visualisation (HTML)
  - `map.html`, `pie-charts.html`, `time-series.html`, `clustering.html`, `data-sources.html`
- `src/scripts/` : scripts D3.js correspondant aux visualisations (JS)
- `src/css/` : feuilles de style (style global `style.css` et styles spécifiques par page)
- `data/` : datasets finaux utilisés par les visualisations (CSV/JSON)
- `assets/` : ressources statiques (polices, images, favicon)
- `data_processing/` : notebooks et scripts de préparation/enrichissement des données (Python)
- `docs/` : documentation du projet (Cadrage, Suivi)

## Installation et lancement en local

### 1) Prérequis
- Node.js (v23.4) + npm (v11.0)
- Python 3.12.3 (si vous souhaitez exécuter les notebooks / scripts de traitement)

### 2) Installer les dépendances front-end
À la racine du projet :

```bash
npm install
```
### 3) Lancer un serveur local(site statique)

```bash
npm run dev
```

Ouvrez ensuite votre navigateur à l'adresse indiquée (généralement `http://localhost:8080` ou similaire).

### 4) Environnement Python (optionnel, pour le traitement des données)
Créer un environnement virtuel et installer les dépendances :

```bash
python -m venv .venv
```

Activer :

- Linux/macOS :

```bash
source .venv/bin/activate
```

- Windows (PowerShell) :

```bash
.venv\Scripts\Activate.ps1
```

Installer les dépendances Python :

```bash
pip install -r requirements.txt
```

## Déploiement

Le site est déployé via GitHub Pages à partir de la branche `main`.
En cas de route invalide, `404.html` est servi automatiquement (attention aux chemins relatifs).

**Équipe du projet** : Youssef ABIDA, Nathan CORROLLER, Arthur YVARS 