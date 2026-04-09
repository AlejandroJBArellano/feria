<div align="center">

<img src="./public/favicon.png" alt="Feria Logo" align="center" height="64" />

# Feria Frontend

[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev)
[![Ionic](https://img.shields.io/badge/Ionic-8-3880ff?style=flat-square&logo=ionic)](https://ionicframework.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)

Feria es una plataforma B2B2C de educación y acompañamiento financiero con un diseño Neo-Brutalista propio.

[Resumen](#resumen) • [Para Empezar](#para-empezar) • [Scripts](#scripts) • [Documentación](#documentación)

</div>

Este repositorio contiene la aplicación frontend construida con React 19, Ionic, Vite y Capacitor. Aquí vive la experiencia de usuario, la autenticación usando AWS Amplify, las integraciones con las APIs y el entorno móvil.

> [!NOTE]
> Toda la infraestructura CDK de este proyecto está en el repo [feria-infraestructure](https://github.com/jesus1612/feria-infraestructure). Como en la entrega del hackathon solo podíamos adjuntar un único link, decidimos separar el código de infraestructura a ese repositorio.

## Resumen

Feria combina una experiencia moderna web y móvil para ayudar a que los usuarios sigan su salud financiera de forma natural. Incluye:
- **Autenticación**: Manejada de manera segura con AWS Amplify vía Cognito Hosted UI.
- **Mobile First**: Usando Capacitor 8 para acceder a funciones nativas como Vibración y la Barra de Estado sin reescribir código.
- **Testing**: Verificación de calidad usando Cypress para E2E y Vitest para pruebas unitarias.
- **Diseño Neo-Brutalista**: Una interfaz única, de alto contraste y juguetona.

## Para Empezar

> [!IMPORTANT]
> Necesitas tener instalado Node.js 18 o superior para correr la app en local.

1. **Clona el repositorio**
   ```bash
   git clone <repo-url>
   cd feria
   ```

2. **Instala las dependencias**
   Sugerimos utilizar `npm`.
   ```bash
   npm install
   ```

3. **Configura el entorno**
   Copia las variables de entorno de ejemplo y rellena tus datos de AWS Amplify y la API.
   ```bash
   cp .env.example .env
   ```

4. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: Inicia el servidor de desarrollo local usando Vite.
- `npm run build`: Compila el TypeScript y buildea la app para producción.
- `npm run preview`: Levanta una previsualización local del build de producción.
- `npm run test.e2e`: Corre las pruebas de integración usando Cypress.
- `npm run test.unit`: Corre las pruebas unitarias usando Vitest.
- `npm run lint`: Evalúa el estilo de código para encontrar errores.

## Documentación

Dentro de la carpeta `docs/product` vas a encontrar los detalles y definiciones del producto:

- [Arquitectura y Modelo B2B2C](./docs/product/hackathon-arquitectura-b2b2c-ods8.md)
- [Catálogo de Logros MVP](./docs/product/mvp-achievements-catalog.md)
- [Especificación de Recordatorios](./docs/product/reminders-v1-spec.md)
- [Guía de Tono del Tutor](./docs/product/tutor-tone-guide.md)
- [Política de Consentimiento](./docs/product/consent-partners-policy.md)
