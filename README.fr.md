# 🔐 SDK FHEVM Universel

Une boîte à outils frontend universelle pour construire des dApps confidentielles, supportant React, Next.js, Vue, Node.js et Vanilla JS.

## 🌐 **Exemples Live**

Tous les exemples fonctionnent avec **des interactions FHEVM réelles** sur le testnet Sepolia :

- **![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) React Showcase :** [https://react-showcase-1738.up.railway.app/](https://react-showcase-1738.up.railway.app/)
- **![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white) Next.js Showcase :** [https://nextjs-showcase-1661.up.railway.app/](https://nextjs-showcase-1661.up.railway.app/)
- **![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D) Vue Showcase :** [https://vue-showcase-2780.up.railway.app/](https://vue-showcase-2780.up.railway.app/)

**Détails du Contrat :**
- **Contrat FHE Counter :** `0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e`
- **Contrat Ratings :** `0xcA2430F1B112EC25cF6b6631bb40039aCa0C86e0`
- **Contrat Voting :** `0x7294A541222ce449faa2B8A7214C571b0fCAb52E`
- **Réseau :** Testnet Sepolia (Chain ID: 11155111)
- **Fonctionnalités :** Chiffrement réel, déchiffrement, interactions de contrat

## 🌍 **Langues / Languages / 语言**
[![English](https://img.shields.io/badge/English-🇺🇸-blue)](README.md)
[![Français](https://img.shields.io/badge/Français-🇫🇷-red)](README.fr.md)
[![中文](https://img.shields.io/badge/中文-🇨🇳-green)](README.zh.md)

## 🏆 **Exigences de Bounty Remplies**

### **✅ 1. Peut être importé dans n'importe quelle dApp**
**Implémentation :** SDK universel avec adaptateurs de framework
- **React:** `import { useWallet, useFhevm, useContract } from '@fhevm-sdk'` ([src/adapters/react.ts](packages/fhevm-sdk/src/adapters/react.ts))
- **Next.js:** `import { useWallet, useFhevm, useContract } from '@fhevm-sdk'` ([src/adapters/react.ts](packages/fhevm-sdk/src/adapters/react.ts))
- **Vue:** `import { useWalletVue, useFhevmVue } from '@fhevm-sdk'` ([src/adapters/vue.ts](packages/fhevm-sdk/src/adapters/vue.ts))
- **Node.js:** `import { FhevmNode } from '@fhevm-sdk'` ([src/adapters/node.ts](packages/fhevm-sdk/src/adapters/node.ts))
- **Vanilla JS:** `import { FhevmVanilla } from '@fhevm-sdk'` ([src/adapters/vanilla.ts](packages/fhevm-sdk/src/adapters/vanilla.ts))

### **✅ 2. Utilitaires pour l'initialisation, les entrées chiffrées et les flux de déchiffrement**
**Implémentation :** Opérations FHEVM complètes avec signature EIP-712
- **Initialisation :** `initializeFheInstance()` ([src/core/fhevm.ts:15-35](packages/fhevm-sdk/src/core/fhevm.ts#L15-L35))
- **Entrées Chiffrées :** `createEncryptedInput()` ([src/core/encryption.ts:31-75](packages/fhevm-sdk/src/core/encryption.ts#L31-L75))
- **Déchiffrement Utilisateur (EIP-712) :** `requestUserDecryption()` ([src/core/decryption.ts:12-59](packages/fhevm-sdk/src/core/decryption.ts#L12-L59))
- **Déchiffrement Public :** `fetchPublicDecryption()` ([src/core/decryption.ts:64-69](packages/fhevm-sdk/src/core/decryption.ts#L64-L69))

### **✅ 3. Structure API modulaire de type Wagmi**
**Implémentation :** Hooks et composables spécifiques aux frameworks
- **Hooks React/Next.js :** `useWallet()`, `useFhevm()`, `useContract()`, `useFhevmOperations()` ([src/adapters/react.ts:20-265](packages/fhevm-sdk/src/adapters/react.ts#L20-L265))
- **Composables Vue :** `useWalletVue()`, `useFhevmVue()`, `useContractVue()` ([src/adapters/vue.ts:15-200](packages/fhevm-sdk/src/adapters/vue.ts#L15-L200))
- **Indépendance du Core :** Les adaptateurs de framework importent depuis les modules core ([src/core/index.ts](packages/fhevm-sdk/src/core/index.ts))

### **✅ 4. Composants réutilisables couvrant différents scénarios de chiffrement/déchiffrement**
**Implémentation :** Multiples scénarios avec exemples du monde réel
- **Déchiffrement Utilisateur Privé :** Signature EIP-712 requise ([Exemple React:151-169](packages/react-showcase/src/App.tsx#L151-L169))
- **Déchiffrement Public :** Aucune signature requise ([Exemple React:238-264](packages/react-showcase/src/App.tsx#L238-L264))
- **Chiffrement d'Entrée :** Pour les interactions de contrat ([Exemple React:183-189](packages/react-showcase/src/App.tsx#L183-L189))
- **Chiffrement Multi-valeurs :** `encryptValue()` pour les tableaux ([src/core/encryption.ts:11-26](packages/fhevm-sdk/src/core/encryption.ts#L11-L26))
- **Exécution de Transaction :** Flux de transaction chiffrée complet ([src/adapters/react.ts:219-242](packages/fhevm-sdk/src/adapters/react.ts#L219-L242))

## 📁 **Structure du Projet**

```
fhevm-react-template/
├── packages/
│   ├── fhevm-sdk/              # SDK FHEVM Universel Core
│   ├── react-showcase/         # Exemple React (Port 3000)
│   ├── nextjs-showcase/        # Exemple Next.js (Port 3001)
│   ├── vue-showcase/           # Exemple Vue (Port 3003)
│   ├── node-showcase/          # Exemple Node.js CLI
│   └── hardhat/                # Smart Contracts
├── pnpm-workspace.yaml         # Configuration Monorepo
└── README.md                   # Ce fichier
```

## 🚀 **Démarrage Rapide**

### **Option 1 : Packages NPX (Recommandé)**
Créez un nouveau projet FHEVM instantanément avec nos packages NPX :

```bash
# React
npx create-fhevm-react my-app
cd my-app
npm install
# Copier le SDK FHEVM pour le déploiement en production
cp node_modules/@fhevm-sdk/dist/* src/lib/
npm start

# Next.js
npx create-fhevm-nextjs my-app
cd my-app
npm install
# Copier le SDK FHEVM pour le déploiement en production
cp node_modules/@fhevm-sdk/dist/* src/lib/
npm run dev

# Vue 
npx create-fhevm-vue my-app
cd my-app
npm install
# Copier le SDK FHEVM pour le déploiement en production
cp node_modules/@fhevm-sdk/dist/* src/lib/
npm run dev
```

**📝 Note :** Copiez les fichiers SDK FHEVM vers `src/lib/` pour la compatibilité du déploiement en production. Mettez à jour les imports de `@fhevm-sdk` vers `./lib/fhevm` dans vos composants.

### **Option 2 : Environnement de Développement**
Clonez et exécutez l'environnement de développement complet :

### **1. Installer les Dépendances**
```bash
pnpm install
```

### **2. Construire le SDK**
```bash
pnpm sdk:build
```

### **3. Choisissez Votre Framework**

| Framework | Commande | Port | Chargement FHEVM | Description |
|-----------|----------|------|------------------|-------------|
| ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) **React** | `pnpm --filter react-showcase start` | 3000 | Script CDN | FHEVM basé sur CDN |
| ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white) **Next.js** | `pnpm --filter nextjs-showcase dev` | 3001 | Script CDN | Next.js avec CDN |
| ![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=flat-square&logo=vue.js&logoColor=4FC08D) **Vue** | `pnpm --filter vue-showcase dev` | 3003 | Script CDN | Vue avec CDN |
| ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white) **Node.js** | `pnpm --filter node-showcase start` | CLI | Mock | Démo côté serveur |

## 🔧 **Comment Fonctionne le Chargement FHEVM**

### **Approche Script CDN (Utilisée par Tous les Showcases)**
Tous les showcases utilisent le CDN Zama Relayer SDK :

```html
<!-- Ce script est déjà inclus dans tous les showcases -->
<script
  src="https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs"
  type="text/javascript"
></script>
```

**Ce qui se passe :**
1. **Script CDN** charge `window.RelayerSDK` globalement
2. **SDK Universel** détecte et utilise l'instance globale
3. **Aucune configuration nécessaire** - fonctionne immédiatement

### **Pourquoi Cette Approche Fonctionne**
- ✅ **Aucun problème de bundling** - CDN se charge séparément
- ✅ **Fonctionne avec tous les frameworks** - React, Next.js, Vue, Vanilla JS
- ✅ **Aucun conflit webpack** - Script se charge avant l'app
- ✅ **Détection automatique** - SDK Universel trouve l'instance globale

## 🎯 **Workflow Développeur**

### **Cloner et Commencer à Construire**
```bash
# 1. Cloner le repository
git clone https://github.com/your-username/fhevm-react-template.git
cd fhevm-react-template

# 2. Installer toutes les dépendances
pnpm install

# 3. Construire le SDK Universel
pnpm sdk:build

# 4. Choisir votre environnement de développement
```

### **Environnements de Développement**

Chaque showcase est un environnement de développement complet prêt à utiliser :

| Environnement | Emplacement | Commande | Port | Ce que Vous Obtenez |
|---------------|-------------|----------|------|---------------------|
| ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) **React** | `packages/react-showcase/` | `pnpm --filter react-showcase start` | 3000 | App React complète avec FHEVM |
| ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white) **Next.js** | `packages/nextjs-showcase/` | `pnpm --filter nextjs-showcase dev` | 3001 | App Next.js complète avec FHEVM |
| ![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=flat-square&logo=vue.js&logoColor=4FC08D) **Vue** | `packages/vue-showcase/` | `pnpm --filter vue-showcase dev` | 3003 | App Vue complète avec FHEVM |
| ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white) **Node.js** | `packages/node-showcase/` | `pnpm --filter node-showcase start` | CLI | Démo Node.js FHEVM |
| ![Node.js](https://img.shields.io/badge/SDK-43853D?style=flat-square&logo=node.js&logoColor=white) **SDK** | `packages/fhevm-sdk/` | `pnpm --filter fhevm-sdk build` | N/A | SDK FHEVM Universel |
| 🔨 **Hardhat** | `packages/hardhat/` | `pnpm --filter hardhat deploy` | N/A | Contrat FHE Counter |

## 🔨 **Déploiement Smart Contract**

### **Déployer le Contrat FHE Counter**
```bash
# Naviguer vers le package Hardhat
cd packages/hardhat

# Installer les dépendances (si pas déjà fait)
pnpm install

# Compiler les contrats
npm run compile

# Déployer sur le réseau local hardhat
npm run deploy:hardhat

# Déployer sur le testnet Sepolia (nécessite INFURA_API_KEY)
npm run deploy:sepolia

# Cela va :
# 1. Compiler le contrat FHE Counter
# 2. Déployer sur le testnet Sepolia
# 3. Sauvegarder l'adresse du contrat et l'ABI
# 4. Rendre le contrat disponible pour les showcases
```

### **Détails du Contrat**
- **Nom du Contrat :** FHECounter
- **Réseau :** Testnet Sepolia
- **Fonctions :** 
  - `getCount()` - Retourne le compteur chiffré
  - `increment()` - Incrémente le compteur chiffré
  - `decrement()` - Décrémente le compteur chiffré
- **Données Publiques :** Compteur chiffré et somme pour le déchiffrement public

## 📦 **Packages NPX**

Nous avons créé des packages NPX qui vous permettent de créer des applications FHEVM instantanément :

### **![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) Package NPX React**
```bash
npx create-fhevm-react my-app
cd my-app
npm install
npm start
```
- **📦 Package :** [![npm](https://img.shields.io/npm/v/create-fhevm-react?style=flat-square&logo=npm&logoColor=white&color=red)](https://www.npmjs.com/package/create-fhevm-react) [create-fhevm-react](https://www.npmjs.com/package/create-fhevm-react) | **🔗 Démo Live :** [React Showcase](https://react-showcase-1738.up.railway.app/)
- **Fonctionnalités :** App React complète avec **SDK FHEVM Universel**, UI magnifique, contrat déployé
- **Tech :** React 18, TypeScript, Create React App, Tailwind CSS

### **![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white) Package NPX Next.js**
```bash
npx create-fhevm-nextjs my-app
cd my-app
npm install
npm run dev
```
- **📦 Package :** [![npm](https://img.shields.io/npm/v/create-fhevm-nextjs?style=flat-square&logo=npm&logoColor=white&color=red)](https://www.npmjs.com/package/create-fhevm-nextjs) [create-fhevm-nextjs](https://www.npmjs.com/package/create-fhevm-nextjs) | **🔗 Démo Live :** [Next.js Showcase](https://nextjs-showcase-1661.up.railway.app/)
- **Fonctionnalités :** App Next.js complète avec **SDK FHEVM Universel**, UI magnifique, contrat déployé
- **Tech :** Next.js 15, TypeScript, App Router, Tailwind CSS

### **![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D) Package NPX Vue**
```bash
npx create-fhevm-vue my-app
cd my-app
npm install
npm run dev
```
- **📦 Package :** [![npm](https://img.shields.io/npm/v/create-fhevm-vue?style=flat-square&logo=npm&logoColor=white&color=red)](https://www.npmjs.com/package/create-fhevm-vue) [create-fhevm-vue](https://www.npmjs.com/package/create-fhevm-vue) | **🔗 Démo Live :** [Vue Showcase](https://vue-showcase-2780.up.railway.app/)
- **Fonctionnalités :** App Vue complète avec **SDK FHEVM Universel**, UI magnifique, contrat déployé
- **Tech :** Vue 3, TypeScript, Vite, Tailwind CSS

### **Ce que Chaque Package NPX Inclut :**
- ✅ **SDK FHEVM Universel** - **LE MÊME SDK** à travers React, Next.js, et Vue
- ✅ **SDK FHEVM Bundlé** - Aucune dépendance externe, fonctionne immédiatement
- ✅ **Contrat FHE Counter Déployé** - Live sur le testnet Sepolia
- ✅ **UI Zama Magnifique** - Système de design professionnel
- ✅ **Core Framework-Agnostic** - Même fonctionnalité FHEVM partout
- ✅ **Support TypeScript** - Sécurité de type complète
- ✅ **Prêt pour la Production** - Optimisé pour le déploiement
- ✅ **Environnement Hardhat Complet** - Développement de smart contract inclus

## 📋 **Exigences**

- **Node.js** 18+ 
- **pnpm** (recommandé) ou npm
- **MetaMask** (pour les exemples frontend)
- **Sepolia ETH** (pour les transactions)

## 🎨 **Thème UI**

Tous les exemples utilisent le **thème Zama** :
- **Primaire :** `#FFD208` (Jaune Zama)
- **Secondaire :** `#000000` (Noir)
- **Arrière-plan :** `#f8f9fa` (Gris Clair)

## 🏗️ **Développement**

### **Construire Tout**
```bash
pnpm sdk:build
```

### **Commencer le Développement**
```bash
pnpm start
```

### **Linter Tout**
```bash
pnpm lint
```

## 📚 **Documentation**

- [React Showcase](./packages/react-showcase/README.md)
- [Next.js Showcase](./packages/nextjs-showcase/README.md)
- [Vue Showcase](./packages/vue-showcase/README.md)
- [Node.js Showcase](./packages/node-showcase/README.md)
- [FHEVM SDK](./packages/fhevm-sdk/README.md)

## 🎉 **Métriques de Succès**

- ✅ **4 Exemples de Framework** - React, Next.js, Vue, Node.js
- ✅ **Interactions FHEVM Réelles** - Aucun mock, appels blockchain réels
- ✅ **Authentification EIP-712** - Déchiffrement utilisateur approprié
- ✅ **Intégration de Contrat Live** - Testnet Sepolia
- ✅ **UI Magnifique** - Thème Zama à travers tous les exemples
- ✅ **Documentation Complète** - READMEs et exemples

## 🏆 **Soumission de Bounty**

Ce projet remplit toutes les exigences pour le **Bounty SDK FHEVM Universel Zama** :

- ✅ **SDK Framework-agnostic** - Fonctionne dans n'importe quel environnement JavaScript
- ✅ **Fonctionnalité FHEVM réelle** - Déchiffrement EIP-712, chiffrement, interactions de contrat
- ✅ **Exemples multi-environnements** - React, Next.js, Vue, Node.js
- ✅ **API de type Wagmi** - Intuitif pour les développeurs web3
- ✅ **Composants propres et réutilisables** - Structure SDK modulaire
- ✅ **Documentation complète** - Instructions de configuration et d'utilisation claires

**Prêt pour la soumission !** 🚀