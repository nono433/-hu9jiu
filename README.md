# 🥔 Potato vs. Zombies — Vacances en danger

Jeu de défense en HTML, CSS et JavaScript natif. Aucun framework, aucune bibliothèque et aucune connexion Internet ne sont nécessaires.

## Lancer le jeu

Ouvre `index.html` dans un navigateur. Garde `style.css` et `script.js` dans le même dossier.

## Préparation et commandes

Avant chaque partie, compose ton équipe de **5 patates parmi 11**, puis choisis le mode Classique, Histoire ou Infini Fusion. Pendant la partie, clique une carte (ou presse **1 à 5**) puis une case libre. Pour déplacer une patate sans frais, clique-la puis clique une case vide. La fusion n'est possible qu'en mode Infini Fusion : clique une patate puis une autre. Clique la patate dorée ✨ pour récupérer son soleil. Le bouton **Règles** met le jeu en pause; **Recommencer** relance la partie.

## Les patates

| Patate | Coût | Pouvoir |
|---|---:|---|
| Solaire | 75 ☀ | Produit 20 ☀ toutes les 8,5 secondes. |
| Gardienne | 75 ☀ | Résiste longtemps et arrête les zombies. |
| Hérisson | 90 ☀ | Blesse les zombies qui la mordent. |
| Mineuse | 100 ☀ | Explose à l'approche d'un zombie et touche les voisins proches. |
| Tireuse | 100 ☀ | Tire sur les zombies de sa ligne. |
| Givrée | 110 ☀ | Ralentit la cible pendant 3 secondes ; plusieurs impacts cumulent le ralentissement. |
| Soigneuse | 125 ☀ | Se soigne et répare la patate la plus blessée dans son rang ou un rang voisin. |
| Pétarade | 125 ☀ | Explose et touche les ennemis proches. |
| Boomerang | 135 ☀ | Son projectile traverse plusieurs zombies. |
| Électrique | 145 ☀ | Son éclair rebondit jusqu'à trois fois sur les zombies voisins, y compris sur un rang proche. |
| Jumelle | 160 ☀ | Tire une rafale de deux projectiles. |

## Modes de jeu et mécaniques

- **Classique** : défends le stock contre 7 vagues de difficulté croissante. Les fusions sont désactivées dans ce mode ; tu peux toujours déplacer tes patates.
- **Histoire** : traverse cinq mondes de quatre vagues. Plage des frites : crabes blindés et surfeurs rapides ; Jardin crépusculaire : fantômes esquiveurs et chauves-souris véloces ; Volcan Patator : magma brûlant et golems résistants ; Forêt des racines : spores soigneuses et lianes blindées ; Glacier des patates : yétis qui gèlent les défenseurs et patineurs rapides. Chaque monde se termine par son propre boss et décor. La fusion est désactivée ; tu peux déplacer tes patates.
- **Infini Fusion** : les vagues continuent sans fin. Fusionne deux patates même si elles sont de types différents pour créer une hybride qui combine leurs pouvoirs. Seules les patates capables d'attaquer apportent des dégâts à l'hybride; une soigneuse ou une productrice n'ajoute aucun dégât. Chaque hybride a un corps bicolore, ses deux emblèmes et des détails propres à certaines combinaisons. Les unités peuvent atteindre au maximum **2 étoiles**. Pour fusionner, clique une patate puis l’autre; les unités compatibles brillent.
- **Patate dorée (catalogue 01)** : bonus rare, +100 ☀. Elle apparaît moins souvent.
- **Niveaux de difficulté (catalogue 12)** : les vagues ajoutent plus de zombies, de résistance et de vitesse. La première vague contient 14 zombies, et chaque vague ajoute 5 ennemis.
- **Cible à protéger (catalogue 24)** : si un zombie atteint le stock à gauche, la partie se termine.
- **Patate solaire (mécanique personnelle)** : produit automatiquement le soleil utilisé pour acheter les défenseurs.

## Organisation du code

- `index.html` : menus, préparation de l’équipe, règles, grille et écrans de fin.
- `style.css` : jardin, interface, animations, cadres des personnages et affichage mobile.
- `script.js` : unités, illustrations SVG locales, choix d’équipe, modes, fusions, vagues, combats et conditions de fin.

Les coûts et caractéristiques sont dans le tableau `DEFENSEURS` en haut de `script.js`.

## Checklist de test avec un camarade

À effectuer après le développement :

- [ ] Choisir cinq patates différentes, retirer une sélection et en choisir une autre.
- [ ] Vérifier que le bouton de démarrage reste désactivé si l’équipe n’a pas exactement cinq patates.
- [ ] Jouer au mode Classique et vérifier la victoire après la vague 7.
- [ ] Jouer au mode Histoire et vérifier les cinq décors, les monstres exclusifs de chaque monde et les cinq boss.
- [ ] Vérifier les pouvoirs ennemis : armure et esquive, brûlure, soin des alliés par les spores, gel des défenseurs.
- [ ] Jouer au mode Infini Fusion et vérifier que la vague 8 commence après la 7.
- [ ] Déplacer une patate dans une case libre et vérifier que le déplacement ne coûte pas de soleil.
- [ ] Vérifier que les fusions sont indisponibles en Classique et en Histoire, mais restent actives en Infini Fusion.
- [ ] Fusionner deux types différents en Infini Fusion et vérifier que la nouvelle hybride combine leurs pouvoirs.
- [ ] Fusionner jusqu’à deux étoiles et vérifier qu’une fusion supplémentaire est refusée.
- [ ] Vérifier les pouvoirs de soin, d’épines et de boomerang.
- [ ] Tester le soleil, le stock, la patate dorée, le bouton Recommencer et un écran étroit.
