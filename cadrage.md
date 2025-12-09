# Document de cadrage – Projet Data Visualisation Spotify avec D3.js

Ce projet a pour objectif de réaliser une application de datavisualisation interactive permettant d’explorer l’évolution de différents indicateurs musicaux à partir des données Spotify.
Plus précisément, l’étude portera sur les valeurs de BPM (tempo), le volume d’écoutes, et la danceability des morceaux faisant partie du Top 50 de Spotify, déclinés par pays, 
par continents et par grandes régions du monde. L’enjeu est de mettre en évidence des tendances culturelles, géographiques ou temporelles, en offrant une visualisation claire, 
esthétique et manipulable par l’utilisateur grâce à la librairie D3.js.

Les données nécessaires seront récupérées via l’API Spotify ou via des jeux de données déjà disponibles 
en ligne (par exemple sur Kaggle ou via des archives publiques du Top 50). Une première étape consistera donc à vérifier la disponibilité des 
données, ainsi que leur granularité : fréquence de mise à jour, présence ou non des métriques recherchées (bpm, danceability, streams), 
couverture géographique, etc. En fonction de la qualité de l’accès aux données, une phase d’extraction, de nettoyage et de normalisation sera prévue 
afin de garantir leur cohérence et leur compatibilité avec les visualisations.

L’approche méthodologique reposera sur plusieurs étapes successives : collecte et préparation des données, choix d’un 
modèle de données adapté à la visualisation, conception des prototypes graphiques, développement progressif des visualisations avec D3.js, puis intégration
finale dans une interface Web. Les visualisations envisagées incluent des courbes temporelles comparatives, des cartes interactives, des diagrammes radar ou 
encore des bar charts animés permettant de suivre des évolutions dans le temps. Un soin particulier sera accordé à l’interactivité (sélection de pays, filtrage
par période, transitions animées, etc.) afin de rendre l’exploration la plus fluide et informative possible.
