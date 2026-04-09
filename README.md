<div align="center">

<img src="./public/favicon.png" alt="Feria Logo" align="center" height="64" />

# Feria Frontend

[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev)
[![Ionic](https://img.shields.io/badge/Ionic-8-3880ff?style=flat-square&logo=ionic)](https://ionicframework.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)

Feria is a B2B2C financial education and tracking platform with a custom Neo-Brutalist design. 

[Overview](#overview) • [Getting Started](#getting-started) • [Scripts](#scripts) • [Documentation](#documentation)

</div>

This repository contains the front-end application built with React 19, Ionic, Vite, and Capacitor. It provides the user experience, authentication via AWS Amplify, API integrations, and mobile deployments.

> [!NOTE]
> The CDK infrastructure for this project is hosted at [feria-infraestructure](https://github.com/jesus1612/feria-infraestructure). Due to hackathon constraints requiring a single deliverable link, the infrastructure code was separated into its own repository.

## Overview

Feria combines a modern web and mobile experience to help users track finances naturally. It features:
- **Authentication**: Managed securely with AWS Amplify using Cognito Hosted UI.
- **Mobile First**: Uses Capacitor 8 to bridge native features like Haptics and Status Bar without rewriting code.
- **Testing**: Quality assurance with Cypress for E2E and Vitest for unit testing.
- **Neo-Brutalist Design**: A unique, high-contrast, playful user interface.

## Getting Started

> [!IMPORTANT]
> You need Node.js 18 or higher to run the application locally.

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd feria
   ```

2. **Install dependencies**
   We recommend using `npm`.
   ```bash
   npm install
   ```

3. **Configure environment**
   Copy the example environment variables and fill in your AWS Amplify and API details.
   ```bash
   cp .env.example .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: Starts the local Vite development server.
- `npm run build`: Compiles TypeScript and builds the production app with Vite.
- `npm run preview`: Previews the local production build.
- `npm run test.e2e`: Runs Cypress tests.
- `npm run test.unit`: Runs Vitest unit tests.
- `npm run lint`: Checks for code formatting and linting errors.

## Documentation

The `docs/product` folder contains detailed technical and product specifications:

- [Architecture & B2B2C Model](./docs/product/hackathon-arquitectura-b2b2c-ods8.md)
- [MVP Achievements Catalog](./docs/product/mvp-achievements-catalog.md)
- [Reminders Specification](./docs/product/reminders-v1-spec.md)
- [Tutor Tone Guide](./docs/product/tutor-tone-guide.md)
- [Partner Consent Policy](./docs/product/consent-partners-policy.md)
