# Document d'avancement du projet

Document visant à suivre l'avancement du projet de visualisation de données sur les classements des top 50 chansons de Spotify.

## 29/11/2025 

- Point consacré à l'exploration des jeux de données disponibles pour notre projet.

## 7/12/2025

- Revue des esquisses initiales et discussion sur les choix de visualisations.

## 12/12/2025

- Point pour discuter le pré-traitement des données et la fusion des différentes sources pour créer notre dataset final. 

## 16/12/2025

- Début du pré-traitement des données et la fusion des différentes sources pour créer notre dataset final.
- Mise en place d'un jalon pour le 23/01/2026 qui a pour objectif de réaliser : 
  - Collection de donnees complete
  - Debut de clustering des genres des donnees
  - Mise en place de la carte (au moins 1 visualisation)
  - Maquette du site

# Arthur :

## 16/12/2025

V1 de la visualisation de la carte
carte videe sans avec une maquette de l'idee generale :

ajout screenshot ?

## 10/01/2025

Developpent d'une interface de visualisation interactive permettant d’analyser l’évolution de différentes métriques audio Spotify au fil du temps.

- Visualisation des métriques
  - mise en place un graphique temporel qui montre l’évolution annuelle de plusieurs métriques musicales (danceability, energy, loudness, tempo, valence, etc.).
  - Toutes les métriques peuvent être affichées simultanément sur un même graphique, ce qui permet de comparer leurs tendances dans le temps.
- Sélection dynamique des variables
  - L’utilisateur peut choisir quelles métriques afficher via une liste de variables à cocher.
  - Le contenu du graphique s’adapte dynamiquement à la sélection : seules les métriques choisies sont tracées.
- Adaptation automatique de l’axe
  - Comme les métriques n’ont pas le même ordre de grandeur (par exemple loudness vs danceability), j'ai fait en sorte que l’axe des ordonnées s’adapte automatiquement en fonction des variables sélectionnées.
- Ajout des tooltips qui affichent les valeurs exactes lorsqu’on survole un point du graphique.
- Identification des metriques pertinentes.

## 12/01/2025

Visualisation pie chart Comparaison des genres par année

- Comparaison des genres par année avec slider pour la datee
  - deux pie chart pour voir deux annes differentes
- Légende commune
  - légende partagée pour tous les graphiques, évitant les répétitions inutiles
- Les graphiques intègrent des tooltips qui affichent les informations précises (genre, proportion)

# Nathan :

10 janvier 2025

- ✅ réflexion sur le sens et début du développement des cartes interactives
- ✅ Création d'une interface de visualisation avec planisphère interactif
- ✅ Implémentation et analyse des deux datasets utilisés pour les deux cartes :

  - Top 50 de 71 pays (2023-2025)
  - Top 50 mondial par année (2000-2023)


12 janvier 2025
- ✅ dev d'un mapping entre les pays et leurs codes ISO pour l'affichage sur la carte
- ✅ Ajout de tooltips interactifs sur les cartes pour voir les pays
- ✅ Ajout d'un tableau pour recap les top50 par pâys ou top 50 mondial quand on clique sur un pays
- ✅ Ajout d'un slider de taille dynamique qui s'adapte au dataset utilisé pour choisir l'année sur la carte
- ✅ Dev grace a une IA LLM d'un enrichisseur de dataset afin d'obtenir les pays d'origine de certains morceaux non présent dans le dataset de base

13 janvier 2025 (aujourd'hui)
-  restructuration du code et des dossiers pour une meilleure organisation et clareté
-  Résolution de problèmes de déploiement GitHub
-  Debug de l'erreur de syntaxe JavaScript