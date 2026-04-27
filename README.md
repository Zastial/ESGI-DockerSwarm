# docker_swarm_ci_cd_project

Author: Alexandre CAROL

# Partie A — API Node.js

## Questions

### Comment récupérez-vous le hostname dans Node.js ?

En Node.js, on peut utiliser le module `os` natif :

```javascript
const os = require('os');
const hostname = os.hostname();
```

Avec Docker :
```javascript
const hostname = process.env.HOSTNAME;
```

### Quelle différence entre “listening on [localhost](http://localhost)” et “0.0.0.0” dans un conteneur ?

Avec **localhost (127.0.0.1)**, on écoute uniquement sur l'interface interne du conteneur. L'application est inaccessible depuis l'extérieur du conteneur.


Avec **0.0.0.0**, on écoute sur toutes les interfaces réseau du conteneur, y compris celles exposées par Docker/Kubernetes. Cela permet à l'application d'être accessible depuis l'extérieur du conteneur.

# Partie B — Conteneurisation Docker

## Questions

### Quels fichiers doivent absolument être ignorés ? Pourquoi ?

- **node_modules/** : Les dépendances sont réinstallées dans l'image Docker, donc on n'a pas besoin de les copier. Cela réduit la taille de l'image et évite les problèmes de compatibilité.

- **.git/**, **.vscode/**, **.idea/** : Ces dossiers contiennent des fichiers de configuration spécifiques au développement local et ne sont pas nécessaires dans l'image de production.

- **.env**, **.env.local** : Ces fichiers contiennent des secrets et des configurations spécifiques à l'environnement de développement. Ils ne doivent pas être inclus dans l'image pour des raisons de sécurité.

### Comment valider que votre image finale ne contient pas d’artefacts de dev ?

1. Explorer le filesystem à la main :
   ```bash
   docker run --rm -it <image_name> sh
   ```
   Puis vérifier que les dossiers/fichiers ignorés ne sont pas présents.

2. Dive — inspection layer par layer
    ```bash
    dive <image_name>
    ```
    Permet de voir le contenu de chaque couche de l'image et de vérifier que les fichiers ignorés ne sont pas inclus.

3. docker inspect pour les métadonnées
    ```bash
    docker inspect <image_name>
    ```
    Permet de vérifier les variables d'environnement, les ports exposés, etc...

