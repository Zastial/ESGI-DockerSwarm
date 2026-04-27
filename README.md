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

# Partie C — Registry d’images

## Questions

### Quelle stratégie de tags adoptez-vous : latest, SHA, semver ?

On tag chaque image avec latest pour la commodité et avec le SHA Git pour garantir que chaque déploiement est traçable et reproductible jusqu'au commit exact.

### Pourquoi un tag immuable est préférable pour un déploiement fiable ?

Un tag immuable garantit que l'image déployée est exactement celle qui a été testée et validée.

# Partie D — Accès distant au cluster Swarm

### Architecture
<pre>
    GitHub Actions
        │
        │ SSH
        ▼
    VM Manager Swarm
        │
        │ docker service update
        ▼
    docker-swarm-api (container)
        │
        │ :8080
        ▼
    Application Node.js
</pre>

### Mécanisme d'authentification

Mon implémentation est **Docker context via SSH** :

- Un user dédié `devopsci` est créé sur mon manager/ma VM, membre du groupe `docker`
- Une paire de clés ed25519 est générée spécifiquement pour la CI
- La clé privée est stockée dans les secrets GitHub (SWARM_SSH_KEY)
- La CI crée un contexte Docker pointant sur ssh://devopsci@<SWARM_IP> et contrôle Swarm à distance

### Ports exposés

| Port | Protocole | Usage |
|------|-----------|-------|
| 22 | TCP | SSH — accès CI au manager |
| 8080 | TCP | HTTP — application Node.js |

### Risques & Mitigations

| Risque | Mitigation |
|--------|------------|
| Clé SSH compromise | Clé dédiée CI, révocable indépendamment sans impacter les autres accès |
| Accès trop large au manager | `devopsci` limité au groupe `docker`, pas de sudo |
| Image compromise sur Docker Hub | Tags SHA Git — chaque déploiement est traçable |
| Container instable en prod | Healthcheck|

## Questions

### Pourquoi exposer Docker en TCP sans TLS est dangereux ?
N'importe quelle personne qui peut joindre le port 2376 a un accès root complet à ma machine.

### Quelle différence entre “le runner atteint le manager” et “le manager atteint le runner” ?

**Le runner atteint le manager (implémentation actuelle)**

La CI initie la connexion vers le manager. Le manager doit exposer un port (22). \
Si la clé SSH est compromise → accès au manager


**Le manager atteint le runner (Watchtower, webhook inversé)**

C'est le manager qui initie la connexion vers l'extérieur, aucun port n'est exposé sur le manager.
La CI ne peut pas push quoi que ce soit.