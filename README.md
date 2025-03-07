# Calistrack

Calistrack est une application de suivi des performances sportives. Elle permet aux utilisateurs d'enregistrer leurs exercices, de suivre leurs progrès et d'analyser leurs statistiques d'entraînement.

## Fonctionnalités

- Gestion des entraînements (création, modification, suppression)
- Suivi des répétitions, séries et temps de repos
- Analyse des performances et statistiques détaillées
- Téléchargement des contrats et documents liés aux activités sportives
- Interface intuitive et responsive

## Technologies utilisées

### Frontend
- React Native
- TypeScript
- Tailwind CSS

### Backend
- Java (Spring Boot)
- PostgreSQL
- Gradle

## Installation

### Prérequis
- Node.js et npm
- Java 17+
- PostgreSQL

### Backend

1. Cloner le projet :
   ```sh
   git clone https://github.com/ton-github/calistrack.git
   ```
2. Aller dans le dossier backend :
   ```sh
   cd calistrack/backend
   ```
3. Configurer la base de données PostgreSQL dans `application.properties`.
4. Lancer l'application :
   ```sh
   ./gradlew bootRun
   ```

### Frontend

1. Aller dans le dossier frontend :
   ```sh
   cd ../frontend
   ```
2. Installer les dépendances :
   ```sh
   npm install
   ```
3. Lancer l'application :
   ```sh
   npx expo start
   ```
4. Scanner le QR code avec l'application Expo Go ou lancer l'émulateur.

## Tests

### Backend
Exécuter les tests avec :
```sh
./gradlew test
```

### Frontend
Exécuter les tests avec :
```sh
npm test
```

## Contribuer
Les contributions sont les bienvenues ! Pour proposer une amélioration :
1. Fork le dépôt
2. Crée une branche (`feature/amélioration`)
3. Effectue tes modifications
4. Ouvre une Pull Request

## Licence
Projet sous licence MIT.

