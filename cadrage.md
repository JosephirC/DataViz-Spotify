# Document de cadrage – Projet Data Visualisation Spotify avec D3.js

Université Lyon 1 - Master 2 - Visualisation Interactive de Données (2025-2026)

nom1

nom2

Arthur YVARS p2006219

--- 

### 1. Contexte

Ce projet a pour objectif de réaliser une application de datavisualisation interactive permettant d’explorer l’évolution de différents indicateurs musicaux à partir des données Spotify.
Plus précisément, l’étude portera sur les valeurs de BPM (tempo), le volume d’écoutes, et la danceability des morceaux faisant partie du Top 50 de Spotify, déclinés par pays, 
par continents et par grandes régions du monde. L’enjeu est de mettre en évidence des tendances culturelles, géographiques ou temporelles, en offrant une visualisation claire, 
esthétique et manipulable par l’utilisateur grâce à la librairie D3.js.

### 2. Public cible et Tâches

La visualisation s’adresse à un public varié composé de passionnés de musique, d’étudiants, de chercheurs et de professionnels souhaitant analyser les tendances musicales à travers le monde. Elle vise également un public plus large, curieux de comprendre comment les préférences musicales évoluent selon les pays, les régions ou les périodes. L’interface interactive permettra ainsi d’explorer facilement différents indicateurs tels que le BPM, la danceability ou le volume d’écoutes, en offrant une lecture intuitive des variations culturelles et géographiques observées dans les données du Top 50 Spotify.

Les utilisateurs pourront réaliser plusieurs tâches essentielles : comparer les pays entre eux, analyser l’évolution des indicateurs musicaux dans le temps, ou encore approfondir des tendances locales grâce à des filtres et interactions spécifiques.

### 3. Sources de données

Les données nécessaires seront récupérées via [l’API Spotify](https://developer.spotify.com/documentation/web-api) ou via des jeux de données déjà disponibles 
en ligne (par exemple sur Kaggle ou via des archives publiques du Top 50). Une première étape consistera donc à vérifier la disponibilité des 
données, ainsi que leur granularité : fréquence de mise à jour, présence ou non des métriques recherchées (bpm, danceability, streams), 
couverture géographique, etc. En fonction de la qualité de l’accès aux données, une phase d’extraction, de nettoyage et de normalisation sera prévue 
afin de garantir leur cohérence et leur compatibilité avec les visualisations.

L’approche méthodologique reposera sur plusieurs étapes successives : collecte et préparation des données, choix d’un 
modèle de données adapté à la visualisation, conception des prototypes graphiques, développement progressif des visualisations avec D3.js, puis intégration
finale dans une interface Web. Les visualisations envisagées incluent des courbes temporelles comparatives, des cartes interactives, des diagrammes radar ou 
encore des bar charts animés permettant de suivre des évolutions dans le temps. Un soin particulier sera accordé à l’interactivité (sélection de pays, filtrage
par période, transitions animées, etc.) afin de rendre l’exploration la plus fluide et informative possible.

### 4. État de l'art :

todo

### 5. Organisation du groupe :

- Communication : Nous utilisons principalement Discord pour communiquer dans le groupe car nous y sommes familier. 
- Code :  Notre projet est disponible sur github à l’adresse suivante : https://github.com/JosephirC/DataViz-Spotify
- Documentation : Le Wiki GitHub du projet sera utilisé comme documentation pour le rendu du document de cadrage ainsi que le livrable final.

Nous travaillerons la plupart du temps à distance tout en se tenant informés des changements et améliorations.

### 6. Esquisses et Maquettes :

#### Comparaison entre pays :
![1](/pics/1.png)
#### Comparaison des métriques retenues :
![2](/pics/2.png)
#### Comparaison des genres les plus écoutés selon les années :
![3](/pics/3.png)
