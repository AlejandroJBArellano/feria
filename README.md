# Feria Frontend

> La configuracion de infraestructura y CDK de este proyecto esta en: https://github.com/jesus1612/feria-infraestructure.  
> En la entrega solo podiamos adjuntar un unico link como entregable, por eso se separo la referencia de infraestructura en ese repositorio.

## Tecnologías Principales

- **Framework**: React 19 + Ionic React + Vite
- **Lenguaje**: TypeScript
- **Diseño UI/UX**: Estilo Neo-Brutalista (CSS Custom)
- **Backend e Integración**: AWS Amplify (Autenticación, API)
- **Testing**: Cypress (E2E) y Vitest (Unitario)
- **Mobile**: Capacitor

## Requisitos Previos

- [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada)
- npm (o pnpm/yarn)

## Instalación y Uso

1. Clona el repositorio e ingresa al directorio del proyecto:
   ```bash
   git clone <url-del-repo>
   cd feria
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno. Copia el archivo `.env.example` a `.env` y ajusta los valores necesarios:
   ```bash
   cp .env.example .env
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo en modo local.
- `npm run build`: Compila el proyecto con TypeScript y Vite para producción.
- `npm run preview`: Previsualiza la aplicación compilada localmente.
- `npm run test.e2e`: Corre las pruebas de end-to-end usando Cypress.
- `npm run test.unit`: Ejecuta las pruebas unitarias con Vitest.
- `npm run lint`: Revisa el código en busca de errores usando ESLint.

## Documentación del Proyecto

El proyecto incluye documentación extensa sobre la arquitectura y las reglas de negocio, alojada en la carpeta `docs/product`:

- [Arquitectura B2B2C y ODS8](./docs/product/hackathon-arquitectura-b2b2c-ods8.md)
- [Catálogo MVP de Logros](./docs/product/mvp-achievements-catalog.md)
- [Especificación de Recordatorios](./docs/product/reminders-v1-spec.md)
- [Guía de Tono del Tutor](./docs/product/tutor-tone-guide.md)
- [Política de Consentimiento de Hubs y Partners](./docs/product/consent-partners-policy.md)
