# 🔐 通用FHEVM   SDK

一个框架无关的前端工具包，帮助开发者轻松运行机密dApp。为Zama赏金计划 - 通用FHEVM SDK挑战而构建。

## 🌐 **实时示例**

所有示例都在Sepolia测试网上运行**真实的FHEVM交互**：

- **![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) React Showcase：** [https://react-showcase-1738.up.railway.app/](https://react-showcase-1738.up.railway.app/)
- **![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white) Next.js Showcase：** [https://nextjs-showcase-1661.up.railway.app/](https://nextjs-showcase-1661.up.railway.app/)
- **![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D) Vue Showcase：** [https://vue-showcase-2780.up.railway.app/](https://vue-showcase-2780.up.railway.app/)

**合约详情：**

- **FHE计数器合约：** `0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e`
- **评分合约：** `0xcA2430F1B112EC25cF6b6631bb40039aCa0C86e0`
- **投票合约：** `0x7294A541222ce449faa2B8A7214C571b0fCAb52E`
- **网络：** Sepolia测试网 (链ID: 11155111)
- **功能：** 真实加密、解密、合约交互

## 🌍 **语言 / Languages / Langues**


[![English](https://img.shields.io/badge/English-🇺🇸-blue)](README.md)
[![Français](https://img.shields.io/badge/Français-🇫🇷-red)](README.fr.md)
[![中文](https://img.shields.io/badge/中文-🇨🇳-green)](README.zh.md)

## 🏆 **赏金要求达成**

### **✅ 1. 可导入到任何dApp**

**实现：** 通用SDK与框架适配器

- **React:** `import { useWallet, useFhevm, useContract } from '@fhevm-sdk'` ([src/adapters/react.ts](packages/fhevm-sdk/src/adapters/react.ts))
- **Next.js:** `import { useWallet, useFhevm, useContract } from '@fhevm-sdk'` ([src/adapters/react.ts](packages/fhevm-sdk/src/adapters/react.ts))
- **Vue:** `import { useWalletVue, useFhevmVue } from '@fhevm-sdk'` ([src/adapters/vue.ts](packages/fhevm-sdk/src/adapters/vue.ts))
- **Node.js:** `import { FhevmNode } from '@fhevm-sdk'` ([src/adapters/node.ts](packages/fhevm-sdk/src/adapters/node.ts))
- **Vanilla JS:** `import { FhevmVanilla } from '@fhevm-sdk'` ([src/adapters/vanilla.ts](packages/fhevm-sdk/src/adapters/vanilla.ts))

### **✅ 2. 初始化、加密输入和解密流程的实用工具**

**实现：** 完整的FHEVM操作与EIP-712签名

- **初始化：** `initializeFheInstance()` ([src/core/fhevm.ts:15-35](packages/fhevm-sdk/src/core/fhevm.ts#L15-L35))
- **加密输入：** `createEncryptedInput()` ([src/core/encryption.ts:31-75](packages/fhevm-sdk/src/core/encryption.ts#L31-L75))
- **用户解密（EIP-712）：** `requestUserDecryption()` ([src/core/decryption.ts:12-59](packages/fhevm-sdk/src/core/decryption.ts#L12-L59))
- **公共解密：** `fetchPublicDecryption()` ([src/core/decryption.ts:64-69](packages/fhevm-sdk/src/core/decryption.ts#L64-L69))

### **✅ 3. Wagmi-like模块化API结构**

**实现：** 框架特定的钩子和组合式函数

- **React/Next.js钩子：** `useWallet()`, `useFhevm()`, `useContract()`, `useFhevmOperations()` ([src/adapters/react.ts:20-265](packages/fhevm-sdk/src/adapters/react.ts#L20-L265))
- **Vue组合式函数：** `useWalletVue()`, `useFhevmVue()`, `useContractVue()` ([src/adapters/vue.ts:15-200](packages/fhevm-sdk/src/adapters/vue.ts#L15-L200))
- **核心独立性：** 框架适配器从核心模块导入 ([src/core/index.ts](packages/fhevm-sdk/src/core/index.ts))

### **✅ 4. 覆盖不同加密/解密场景的可重用组件**

**实现：** 多种场景与真实世界示例

- **私有用户解密：** 需要EIP-712签名 ([React示例:151-169](packages/react-showcase/src/App.tsx#L151-L169))
- **公共解密：** 无需签名 ([React示例:238-264](packages/react-showcase/src/App.tsx#L238-L264))
- **输入加密：** 用于合约交互 ([React示例:183-189](packages/react-showcase/src/App.tsx#L183-L189))
- **多值加密：** `encryptValue()` 用于数组 ([src/core/encryption.ts:11-26](packages/fhevm-sdk/src/core/encryption.ts#L11-L26))
- **交易执行：** 完整的加密交易流程 ([src/adapters/react.ts:219-242](packages/fhevm-sdk/src/adapters/react.ts#L219-L242))

## 📁 **项目结构**

```
fhevm-react-template/
├── packages/
│   ├── fhevm-sdk/              # 通用FHEVM SDK核心
│   ├── react-showcase/         # React示例 (端口 3000)
│   ├── nextjs-showcase/        # Next.js示例 (端口 3001)
│   ├── vue-showcase/           # Vue示例 (端口 3003)
│   ├── node-showcase/          # Node.js CLI示例
│   └── hardhat/                # 智能合约
├── pnpm-workspace.yaml         # Monorepo配置
└── README.md                   # 此文件
```

## 🚀 **快速开始**

### **选项1：NPX包（推荐）**

使用我们的NPX包立即创建新的FHEVM项目：

```bash
# React
npx create-fhevm-react my-app
cd my-app
npm install
# 复制FHEVM SDK用于生产部署
cp node_modules/@fhevm-sdk/dist/* src/lib/
npm start

# Next.js
npx create-fhevm-nextjs my-app
cd my-app
npm install
# 复制FHEVM SDK用于生产部署
cp node_modules/@fhevm-sdk/dist/* src/lib/
npm run dev

# Vue
npx create-fhevm-vue my-app
cd my-app
npm install
# 复制FHEVM SDK用于生产部署
cp node_modules/@fhevm-sdk/dist/* src/lib/
npm run dev
```

**📝 注意：** 将FHEVM SDK文件复制到 `src/lib/` 以确保生产部署兼容性。在组件中将导入从 `@fhevm-sdk` 更新为 `./lib/fhevm`。

### **选项2：开发环境**

克隆并运行完整的开发环境：

### **1. 安装依赖**

```bash
pnpm install
```

### **2. 构建SDK**

```bash
pnpm sdk:build
```

### **3. 选择您的框架**

| 框架                                                                                                               | 命令                                 | 端口 | FHEVM加载 | 描述           |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ---- | --------- | -------------- |
| ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) **React**        | `pnpm --filter react-showcase start` | 3000 | CDN脚本   | 基于CDN的FHEVM |
| ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white) **Next.js** | `pnpm --filter nextjs-showcase dev`  | 3001 | CDN脚本   | Next.js与CDN   |
| ![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=flat-square&logo=vue.js&logoColor=4FC08D) **Vue**       | `pnpm --filter vue-showcase dev`     | 3003 | CDN脚本   | Vue与CDN       |
| ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white) **Node.js** | `pnpm --filter node-showcase start`  | CLI  | Mock      | 服务端演示     |

## 🔧 **FHEVM加载工作原理**

### **CDN脚本方法（所有示例使用）**

所有示例都使用Zama Relayer SDK CDN：

```html
<!-- 此脚本已包含在所有示例中 -->
<script
  src="https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs"
  type="text/javascript"
></script>
```

**工作原理：**

1. **CDN脚本** 全局加载 `window.RelayerSDK`
2. **通用SDK** 检测并使用全局实例
3. **无需配置** - 开箱即用

### **为什么这种方法有效**

- ✅ **无打包问题** - CDN单独加载
- ✅ **适用于所有框架** - React, Next.js, Vue, Vanilla JS
- ✅ **无webpack冲突** - 脚本在应用前加载
- ✅ **自动检测** - 通用SDK找到全局实例

## 🎯 **开发者工作流程**

### **克隆并开始构建**

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/fhevm-react-template.git
cd fhevm-react-template

# 2. 安装所有依赖
pnpm install

# 3. 构建通用SDK
pnpm sdk:build

# 4. 选择您的开发环境
```

### **开发环境**

每个示例都是完整的开发环境，随时可用：

| 环境                                                                                                               | 位置                        | 命令                                 | 端口 | 您将获得                 |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------- | ------------------------------------ | ---- | ------------------------ |
| ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) **React**        | `packages/react-showcase/`  | `pnpm --filter react-showcase start` | 3000 | 完整的React应用与FHEVM   |
| ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white) **Next.js** | `packages/nextjs-showcase/` | `pnpm --filter nextjs-showcase dev`  | 3001 | 完整的Next.js应用与FHEVM |
| ![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=flat-square&logo=vue.js&logoColor=4FC08D) **Vue**       | `packages/vue-showcase/`    | `pnpm --filter vue-showcase dev`     | 3003 | 完整的Vue应用与FHEVM     |
| ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white) **Node.js** | `packages/node-showcase/`   | `pnpm --filter node-showcase start`  | CLI  | Node.js FHEVM演示        |
| ![Node.js](https://img.shields.io/badge/SDK-43853D?style=flat-square&logo=node.js&logoColor=white) **SDK**         | `packages/fhevm-sdk/`       | `pnpm --filter fhevm-sdk build`      | N/A  | 通用FHEVM SDK            |
| 🔨 **Hardhat**                                                                                                     | `packages/hardhat/`         | `pnpm --filter hardhat deploy`       | N/A  | FHE计数器合约            |

## 🔨 **智能合约部署**

### **部署FHE计数器合约**

```bash
# 导航到Hardhat包
cd packages/hardhat

# 安装依赖（如果尚未完成）
pnpm install

# 编译合约
npm run compile

# 部署到本地hardhat网络
npm run deploy:hardhat

# 部署到Sepolia测试网（需要INFURA_API_KEY）
npm run deploy:sepolia

# 这将：
# 1. 编译FHE计数器合约
# 2. 部署到Sepolia测试网
# 3. 保存合约地址和ABI
# 4. 使合约可用于示例
```

### **合约详情**

- **合约名称：** FHECounter
- **网络：** Sepolia测试网
- **功能：**
  - `getCount()` - 返回加密计数
  - `increment()` - 增加加密计数
  - `decrement()` - 减少加密计数
- **公共数据：** 加密计数和公共解密的和

## 📦 **NPX包**

我们创建了NPX包，让您立即创建FHEVM应用：

### **![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) React NPX包**

```bash
npx create-fhevm-react my-app
cd my-app
npm install
npm start
```

- **📦 包：** [![npm](https://img.shields.io/npm/v/create-fhevm-react?style=flat-square&logo=npm&logoColor=white&color=red)](https://www.npmjs.com/package/create-fhevm-react) [create-fhevm-react](https://www.npmjs.com/package/create-fhevm-react) | **🔗 实时演示：** [React Showcase](https://react-showcase-1738.up.railway.app/)
- **功能：** 完整的React应用，包含**通用FHEVM SDK**，美观的UI，已部署的合约
- **技术：** React 18, TypeScript, Create React App, Tailwind CSS

### **![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white) Next.js NPX包**

```bash
npx create-fhevm-nextjs my-app
cd my-app
npm install
npm run dev
```

- **📦 包：** [![npm](https://img.shields.io/npm/v/create-fhevm-nextjs?style=flat-square&logo=npm&logoColor=white&color=red)](https://www.npmjs.com/package/create-fhevm-nextjs) [create-fhevm-nextjs](https://www.npmjs.com/package/create-fhevm-nextjs) | **🔗 实时演示：** [Next.js Showcase](https://nextjs-showcase-1661.up.railway.app/)
- **功能：** 完整的Next.js应用，包含**通用FHEVM SDK**，美观的UI，已部署的合约
- **技术：** Next.js 15, TypeScript, App Router, Tailwind CSS

### **![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D) Vue NPX包**

```bash
npx create-fhevm-vue my-app
cd my-app
npm install
npm run dev
```

- **📦 包：** [![npm](https://img.shields.io/npm/v/create-fhevm-vue?style=flat-square&logo=npm&logoColor=white&color=red)](https://www.npmjs.com/package/create-fhevm-vue) [create-fhevm-vue](https://www.npmjs.com/package/create-fhevm-vue) | **🔗 实时演示：** [Vue Showcase](https://vue-showcase-2780.up.railway.app/)
- **功能：** 完整的Vue应用，包含**通用FHEVM SDK**，美观的UI，已部署的合约
- **技术：** Vue 3, TypeScript, Vite, Tailwind CSS

### **每个NPX包包含的内容：**

- ✅ **通用FHEVM SDK** - React、Next.js和Vue中的**相同SDK**
- ✅ **捆绑的FHEVM SDK** - 无外部依赖，开箱即用
- ✅ **已部署的FHE计数器合约** - 在Sepolia测试网上运行
- ✅ **美观的Zama UI** - 专业设计系统
- ✅ **框架无关的核心** - 相同的FHEVM功能无处不在
- ✅ **TypeScript支持** - 完整的类型安全
- ✅ **生产就绪** - 为部署优化
- ✅ **完整的Hardhat环境** - 包含智能合约开发

## 📋 **要求**

- **Node.js** 18+
- **pnpm**（推荐）或npm
- **MetaMask**（用于前端示例）
- **Sepolia ETH**（用于交易）

## 🎨 **UI主题**

所有示例都使用**Zama主题**：

- **主色：** `#FFD208`（Zama黄色）
- **次色：** `#000000`（黑色）
- **背景：** `#f8f9fa`（浅灰色）

## 🏗️ **开发**

### **构建所有**

```bash
pnpm sdk:build
```

### **开始开发**

```bash
pnpm start
```

### **代码检查**

```bash
pnpm lint
```

## 📚 **文档**

- [React Showcase](./packages/react-showcase/README.md)
- [Next.js Showcase](./packages/nextjs-showcase/README.md)
- [Vue Showcase](./packages/vue-showcase/README.md)
- [Node.js Showcase](./packages/node-showcase/README.md)
- [FHEVM SDK](./packages/fhevm-sdk/README.md)

## 🎉 **成功指标**

- ✅ **4个框架示例** - React, Next.js, Vue, Node.js
- ✅ **真实FHEVM交互** - 无模拟，实际区块链调用
- ✅ **EIP-712认证** - 适当的用户解密
- ✅ **实时合约集成** - Sepolia测试网
- ✅ **美观的UI** - 所有示例的Zama主题
- ✅ **完整文档** - README和示例

## 🏆 **赏金提交**

此项目满足**Zama通用FHEVM SDK赏金**的所有要求：

- ✅ **框架无关SDK** - 适用于任何JavaScript环境
- ✅ **真实FHEVM功能** - EIP-712解密、加密、合约交互
- ✅ **多环境示例** - React, Next.js, Vue, Node.js
- ✅ **Wagmi-like API** - 对web3开发者直观
- ✅ **清洁、可重用组件** - 模块化SDK结构
- ✅ **完整文档** - 清晰的设置和使用说明

**准备提交！** 🚀
