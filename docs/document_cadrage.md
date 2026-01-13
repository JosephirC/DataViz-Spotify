# Document de cadrage – Projet Data Visualisation Spotify avec D3.js

Université Lyon 1 - Master 2 - Visualisation Interactive de Données (2025-2026)

Youssef ABIDA p2024398

Nathan CORROLLER p2208035

Arthur YVARS p2006219

--- 

## Problème abordé et besoin

Les plateformes de streaming comme Spotify publient des classements de type « Top 50 » par pays, mais ces listes sont difficiles à comparer entre elles et ne permettent pas de comprendre facilement les grandes tendances musicales mondiales. Un utilisateur curieux ne voit qu’un classement local, sans savoir comment se situent les autres pays, ni comment les caractéristiques musicales des hits évoluent dans le temps.

Notre projet vise à répondre à ce besoin en proposant une visualisation interactive des titres du Top 50 Spotify par pays, continents et grandes régions du monde. Nous nous concentrons sur quelques indicateurs musicaux clés – BPM (tempo), danceability et volume d’écoutes – afin de mettre en évidence des tendances culturelles, géographiques et temporelles. L’objectif est d’offrir un outil simple à manipuler qui permette de passer d’une vue d’ensemble mondiale à des analyses plus fines par pays ou période.

## Public cible et tâches

La visualisation s’adresse en priorité à des personnes intéressées par la musique et les données : étudiants et étudiantes en data/data-visualisation, amateurs de musique curieux de comparer les pays, ainsi qu’à des journalistes ou créateurs de contenu cherchant à illustrer des tendances musicales globales. Le projet reste accessible à un public plus large, grâce à des interactions simples et à des représentations visuelles familières.

Nous identifions trois tâches principales que notre visualisation doit permettre de réaliser :

### Tâche 1 – Comparer la place des pays dans les tops Spotify.
Permettre à l’utilisateur de voir quels pays contribuent le plus aux écoutes des titres du Top 50 mondial, et de comparer plusieurs pays ou régions entre eux. Cette tâche est centrale pour répondre à la question « où écoute-t-on le plus ces titres ? » et visualiser les déséquilibres géographiques.

### Tâche 2 – Analyser l’évolution des caractéristiques des hits dans le temps.
Offrir une vue temporelle de l’évolution des métriques musicales (BPM, danceability, volume d’écoutes) entre plusieurs années, à l’échelle mondiale ou pour un pays donné. Cette tâche permet de comprendre si, par exemple, les hits deviennent plus rapides, plus “dansables” ou plus écoutés au fil des années.

### Tâche 3 – Étudier les familles de morceaux assimilables à des genres musicaux.
Visualiser comment la part des principales “familles” de morceaux évolue selon les années et/ou les régions. Ces familles seront obtenues par un clustering sur les caractéristiques audio Spotify (tempo, danceability, energy, loudness, etc.), que nous interpréterons comme des genres ou sous-genres musicaux. Cette tâche répond à la question : « quels types de morceaux dominent les tops à un moment donné ? » et complète les métriques audio en donnant une lecture plus claire des tendances.

## Sources de données

Nous prévoyons d’utiliser deux grandes familles de sources :  
1. un ou plusieurs jeux de données publics (par exemple sur Kaggle) contenant des classements Spotify par pays ;  
2. l’API officielle de Spotify, pour compléter ces données avec des caractéristiques audio détaillées.

### Jeux de données existants (Kaggle, archives publiques)

Nous utiliserons un ou plusieurs jeux de données publiés par la communauté, qui contiennent des classements de type *Top 50* ou *Top 200* par pays et par date (position dans le classement, pays, titre, artiste, nombre de streams, etc.).

- **Intérêt principal :**
  - accès direct à l’historique des tops par pays, sans devoir tout reconstruire via l’API ;
  - possibilité de couvrir plusieurs années et un grand nombre de pays ;
  - base solide pour nos tâches de comparaison géographique et d’évolution temporelle (Tâches 1 et 2).

- **Limites potentielles :**
  - formats hétérogènes d’un dataset à l’autre (nom des colonnes, structure, encodage) ;
  - couverture temporelle variable (certaines années / certains pays peuvent être manquants ou peu renseignés) ;
  - données volumineuses si l’on conserve tous les jours et tous les pays (nécessité d’agréger par semaine, mois ou année) ;
  - présence possible de doublons ou d’incohérences (changements de titre, variantes locales, etc.).

- **Usage prévu :**
  - construire une table “tops par pays et par date” avec au minimum : identifiant du morceau, pays, date, position et nombre de streams ;
  - servir de base pour les cartes (répartition géographique des streams) et les courbes temporelles (évolution des indicateurs dans le temps).

La liste précise des jeux de données utilisés (nom, lien, période couverte) sera documentée dans le wiki du projet une fois le choix final effectué.

### API Spotify

Nous utiliserons également l’[API Spotify](https://developer.spotify.com/documentation/web-api) pour enrichir les morceaux présents dans nos tops avec des caractéristiques audio et des métadonnées supplémentaires.

- **Intérêt principal :**
  - récupérer les audio-features nécessaires à notre analyse et au clustering (tempo/BPM, danceability, energy, loudness, etc.) ;
  - disposer d’identifiants Spotify cohérents pour relier les différentes sources entre elles ;
  - compléter ponctuellement certaines informations manquantes côté datasets publics.

- **Limites potentielles :**
  - quotas et limites de taux, qui imposent de réaliser la collecte hors-ligne et de stocker les résultats ;
  - certains indicateurs (par exemple le nombre exact de streams) ne sont pas accessibles via l’API publique et devront rester ceux fournis par les jeux de données Kaggle ;
  - risque de changements d’API ou de restrictions supplémentaires pendant la durée du projet.

- **Usage prévu :**
  - à partir des identifiants de morceaux présents dans les tops, interroger l’API pour récupérer un vecteur complet d’audio-features ;
  - utiliser ces vecteurs comme base pour le clustering en “familles de morceaux” et pour les visualisations liées aux caractéristiques musicales (Tâches 2 et 3).

### Plan de secours en cas de problème sur les données

Afin de sécuriser le projet, nous anticipons plusieurs scénarios de repli :

- **Si les jeux de données de tops par pays sont trop incomplets ou difficiles à exploiter :**
  - réduire la période étudiée (par exemple se concentrer sur quelques années récentes) ;
  - limiter le périmètre géographique à un sous-ensemble de pays ou à des grandes régions (Europe, Amériques, etc.) ;
  - à défaut, basculer sur des tops “globaux” plutôt que par pays tout en conservant l’analyse temporelle.

- **Si l’accès à l’API Spotify est trop restreint (quotas, problèmes d’authentification, etc.) :**
  - nous appuyer davantage sur les jeux de données qui contiennent déjà des audio-features ;
  - réduire le nombre de métriques utilisées pour le clustering et les visualisations, en ne conservant que celles disponibles de façon fiable (par exemple tempo et danceability).

- **Si le croisement de plusieurs sources s’avère trop complexe :**
  - privilégier un plus petit nombre de sources bien maîtrisées ;
  - simplifier le modèle de données (moins de niveaux de détail, agrégation plus forte) afin de garantir un résultat stable et interprétable.

L’objectif est de maintenir les trois tâches principales du projet même en cas de données partielles, quitte à ajuster le niveau de détail ou le nombre de métriques utilisées.

## Travaux important liés au projet 

Pour cadrer notre approche et identifier notre valeur ajoutée, nous avons analysé trois projets de visualisation qui s'attaquent à des problématiques similaires sur les données musicales.

**1. Every Noise at Once (Paul Lamere)**

*Site* : https://everynoise.com/

Ce projet est une tentative algorithmique d'une carte interactive de l'espace des genres musicaux. Il positionne plus de 6 291 genres dans un scatter-plot bidimensionnel, où les axes représentent les caractéristiques audio agrégées (densité/atmosphère en X ; organicité/mécanique en Y).

- **Intérêt pour notre projet** : Il valide l'utilisation de caractéristiques audio complexes de Spotify pour la classification (similaire à notre Tâche 3 : Analyse des genres). Les nombreuses fonctionnalités annexes (History of Music, Genres by Country) confirment l'intérêt des utilisateurs à lier genre, temps et géographie.

- **Point d'amélioration / Notre Plus-Value** : La carte principale est statique et sa représentation est principalement textuelle. Notre projet proposera une agrégation plus visuelle (ex : bulles ou diagrammes D3.js) et se concentrera sur la comparaison directe entre les pays sur un ensemble de genres définis, offrant une lecture plus simple et moins dense du paysage musical global.

**2. Soundscape : Interactive Data Visualisations of Spotify’s Top Songs**

*Référence* : [Article académique décrivant l’application.](https://ojs.victoria.ac.nz/wfes/article/view/8399/7456)

Ce projet, réalisé avec D3.js et React, se concentre sur l'exploration des caractéristiques audio (dançabilité, énergie, valence, etc.) des 2 000 morceaux les plus populaires de Spotify entre 1999 et 2019, sur un ensemble de pays divers.

- **Intérêt pour notre projet** : Il confirme la faisabilité technique de visualiser l'évolution des caractéristiques musicales avec D3.js, qui est au cœur de notre Tâche 2 : Analyse des tendances temporelles. L'approche de l'article sur la corrélation des métriques est une source d'inspiration pour la présentation de nos résultats.

- **Point d'amélioration / Notre Plus-Value** : Bien que les données soient mondiales, l'article se focalise sur l'analyse globale et n'utilise pas la géographie comme un outil d'exploration primaire. Notre visualisation intégrera la comparaison inter-pays et inter-continents (Tâche 1), permettant de dégager des contrastes culturels qui ne sont pas l'objet principal de cette étude.

**3. Music Galaxy (Casey Primozic)**

*Site de démonstration* : https://galaxy.spotifytrack.net/

Cette visualisation utilise un graphe de force tridimensionnel pour cartographier les relations entre plus de 70 000 artistes. Le positionnement des artistes est calculé de manière à placer les artistes similaires proches les uns des autres.

- **Intérêt pour notre projet** : Ce projet démontre une méthode efficace pour visualiser des relations complexes entre entités (ici les artistes, applicable aux genres) et propose une expérience interactive et fluide, y compris la possibilité d'écouter un extrait musical directement (ce qui nous inspire pour l'interactivité de notre Tâche 1 et Tâche 3).

- **Point d'amélioration / Notre Plus-Value** : La densité de données et la nature du graphe de force ne facilitent pas l'extraction d'une analyse quantitative comparative (e.g. : « Quel pays a les artistes les plus similaires à tel genre ? »). Nous privilégierons une cartographie 2D et des graphiques agrégés pour répondre directement aux questions de comparaison géographique et d'évolution des tendances mondiales.

## Organisation

- **Communication**
  
  - Nous utilisons principalement Discord pour les échanges quotidiens et l'urgence. Nous travaillerons la plupart du temps à distance tout en se tenant informés des changements et améliorations.
  
  - Le Wiki GitHub sert de support pour la documentation formelle (Cadrage, Avancement).

- **Code** : Notre projet est disponible sur GitHub à l’adresse suivante : https://github.com/JosephirC/DataViz-Spotify

- **Rôles et Responsabilités** :
  
  - Gestion des Données et API (Preprocessing) : Youssef ABIDA, Nathan CORROLLER, Arthur YVARS
  
  - Développement Front-end et D3.js : Nathan CORROLLER, Arthur YVARS, Youssef ABIDA
 
  - Coordination et Documentation (Wiki, Rendu final) : Arthur YVARS, Youssef ABIDA, Nathan CORROLLER
  
- **Sessions de travail planifiées (Hors cours)** :

  - **29 novembre** : Point consacré à l'exploration des jeux de données disponibles pour notre projet.

  - **7 décembre** : Revue des esquisses initiales et discussion sur les choix de visualisations.

  - **12 décembre** : Point pour discuter le pré-traitement des données et la fusion des différentes sources pour créer notre dataset final. 

## Scan des esquisses finales

#### Comparaison entre pays :

![Esquisse carte choroplèthe et évolution temporelle des Top 50](https://raw.githubusercontent.com/JosephirC/DataViz-Spotify/main/pics/1.png)

#### Comparaison des métriques retenues :

![Esquisse des graphiques d'évolution des métriques audio (Danceability, BPM)](https://raw.githubusercontent.com/JosephirC/DataViz-Spotify/main/pics/2.png)

#### Comparaison des genres les plus écoutés selon les années :

![Esquisse pour l'analyse par genre / clustering](https://raw.githubusercontent.com/JosephirC/DataViz-Spotify/main/pics/3.png)
