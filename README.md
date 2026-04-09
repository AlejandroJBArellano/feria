<div align="center">

<img src="./public/favicon.png" alt="Feria Logo" align="center" height="64" />

# Feria Frontend

[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev)
[![Ionic](https://img.shields.io/badge/Ionic-8-3880ff?style=flat-square&logo=ionic)](https://ionicframework.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)

Feria es una plataforma de educación y acompañamiento financiero enfocada en la privacidad, construida con un diseño Neo-Brutalista increíble, vibrante y claro.

[Resumen](#resumen) • [Características](#características) • [Para Empezar](#para-empezar) • [Scripts](#scripts) • [Documentación](#documentación)

</div>

Este repositorio contiene la aplicación frontend construida con React 19, Ionic, Vite y Capacitor. Aquí vive la experiencia de usuario, la autenticación a través de AWS Amplify, las integraciones con de nuestro backend de microservicios y soporte total para su uso móvil.

> [!NOTE]
> Toda la infraestructura Serverless y de CDK en la nube de este proyecto está en el repositorio [feria-infraestructure](https://github.com/jesus1612/feria-infraestructure). Para mantener el desarrollo y el despliegue lo más limpio posible, decidimos separar la rama del backend.

## Resumen

Feria combina una experiencia web moderna y la utilidad de una buena app móvil nativa, buscando ayudar a que las personas puedan realizar un seguimiento transparente de cómo usan su dinero evitando generarles estrés mental.

## Características

- **Registro Moderno**: Posibilidad de asentar todos tus gastos y recibos del día a través de un simple mensaje de voz. El proyecto se encarga de entender y procesar eso con IA automáticamente en segundo plano.
- **Tutor Asistente**: Un bloque de chat de acceso rápido, capaz de sugerir tendencias, apoyado por modelos del ecosistema de Amazon Bedrock.
- **Sistema de Logros Vivo**: Insignias que dan palmaditas en el hombro del usuario intentando mantener su constancia (su racha).
- **Mobile First a Tope**: Hecho con Capacitor 8. Usamos librerías exclusivas para detonar la vibración nativa de tu teléfono y manejar a la par las pantallas responsivas. 
- **Autenticación Solida**: Inicio de cuenta manejado con soltura y seguridad con AWS Amplify integrando Cognito Hosted UI.
- **Neo-Brutalismo**: Una identidad de marca y una interfaz atípica; juguetona, con muchísimo contraste para leer la info económica rápido en la calle bajo el sol.

## Para Empezar

> [!IMPORTANT]
> Debes tener la dependencia de Node.js 18 o un nivel mayor en tu computadora para poder correr correctamente todos los módulos.

1. **Clona de inmediato el proyecto y dirígete adentro de la carpeta**
   ```bash
   git clone <repo-url>
   cd feria
   ```

2. **Inicia tu árbol de dependencias**
   Te ruego usar directamente `npm` ya que usamos su versión de lockfile por defecto.
   ```bash
   npm install
   ```

3. **Copia los perfiles de Entorno**
   Agrega acá tus URLs de CloudFront para nuestra versión particular de la API y vincula la piscina de registros de usuario proveniente de AWS Cognito.
   ```bash
   cp .env.example .env
   ```

4. **Inicia el servidor**
   ```bash
   npm run dev
   ```
   > Aquí es el momento ideal en que verás que abriremos los puertos del entorno web al puerto 5173 vía la maravillosa velocidad de Vite.

## Scripts

El proyecto estipuló un abanico útil de atajos en el JSON central:

- `npm run dev`: Inicia enseguida la instancia de desarrollo local usando Vite.
- `npm run build`: Audita el TypeScript para que no reviente nuestro proyecto y compila al directorio root de publicación.
- `npm run preview`: Lanza un servidor casero imitando al de la producción en tu local (necesitas empujar previo el comando de build).
- `npm run test.e2e`: Monta Cypress y despliega las pruebas del ciclo de vida visual de sistema cruzado de un componente.
- `npm run test.unit`: Llama a los ejecutables de Vitest, de forma aislada para revisar las funciones unitarias vitales del parseo de datos.
- `npm run lint`: Da un ojo ciego general y reporta si el formateador del código de linteo descubre desajustes de código o promesas sueltas con errores en línea.

## Documentación Interna

Encontramos en la carpeta que está en `docs/product` una librería con nuestra visión real de hacia dónde está empujando las reglas comerciales Feria:

- [Arquitectura de Servidor Base](./docs/product/hackathon-arquitectura-b2b2c-ods8.md)
- [Criterios Actuales de los Logros Útiles MVP](./docs/product/mvp-achievements-catalog.md)
- [Los Reglas de los Recordatorios en V1](./docs/product/reminders-v1-spec.md)
- [Personalidad y Control Humano de Respuestas del Tutor](./docs/product/tutor-tone-guide.md)
- [Sobre Privacidad Real y Datos Sensibles](./docs/product/consent-partners-policy.md)
