# Feria Hackathon: stack, despliegue, modelo B2B2C y ODS 8

## 1) Resumen ejecutivo

Feria es una plataforma B2B2C de educacion y acompanamiento financiero que combina:

- app web/mobile (Ionic + React + Capacitor),
- autenticacion con Cognito,
- APIs REST protegidas en API Gateway,
- Lambdas para ingestion, voz, chat y engagement,
- persistencia en DynamoDB y audio en S3,
- IA con Bedrock (tutor y clasificacion) y STT con Amazon Transcribe o AssemblyAI.

La solucion esta separada en dos repositorios para acelerar el hackathon sin bloquear equipos:

- `feria`: experiencia de usuario, autenticacion cliente, llamadas API y despliegue web.
- `feria-infraestructure`: infraestructura como codigo (AWS CDK), APIs, Lambdas y persistencia.

---

## 2) Stack tecnologico revisado

## Frontend y experiencia

- Framework UI: Ionic React 8 + React 19 + React Router 5.
- Runtime/build: Vite 5 + TypeScript.
- Mobile bridge: Capacitor 8 (App, Haptics, Keyboard, Status Bar).
- Auth client: AWS Amplify Auth (OAuth code grant con Cognito Hosted UI).
- QA: Vitest + Testing Library + Cypress.

## Backend, datos e IA

- API: Amazon API Gateway REST.
- Compute: AWS Lambda Node.js 20 (handlers especializados por dominio).
- Data: DynamoDB on-demand (tablas para usuarios, movimientos, chat, engagement y catalogo).
- Audio: Amazon S3 (uploads privados con URL prefirmada).
- IA: Amazon Bedrock (chat tutor y procesamiento semantico).
- Speech-to-text:
  - Amazon Transcribe (flujo AWS nativo), o
  - AssemblyAI (alternativa configurable por variable de entorno).

## Infraestructura y DevOps

- IaC: AWS CDK v2 en TypeScript.
- CI/CD webapp: GitHub Actions, build Vite, deploy estatico a S3 + CloudFront e invalidacion cache.
- Seguridad de despliegue: OIDC role o Access Keys, validacion previa de variables requeridas.

---

## 3) Diagrama de despliegue (Mermaid)

```mermaid
flowchart LR
  %% Clientes
  U1[Usuario final - Web] --> CF[CloudFront]
  U2[Usuario final - App movil via Capacitor] --> CF
  CF --> S3WEB[S3 Web Bucket - Frontend estatico]

  %% Auth
  U1 --> COG[Cognito User Pool + Hosted UI]
  U2 --> COG

  %% API
  U1 --> APIGW[API Gateway REST /prod]
  U2 --> APIGW
  COG -. JWT Authorizer .-> APIGW

  %% Lambdas
  APIGW --> L_INGEST[Lambda IngestionHandler]
  APIGW --> L_VOICE_API[Lambda Voice API]
  APIGW --> L_CHAT[Lambda Chat REST]
  APIGW --> L_ENG[Lambda Engagement]
  APIGW --> L_TYPES[Lambda Tipos Movimiento]
  APIGW --> L_USERS[Lambda Users API]

  %% Persistencia
  L_INGEST --> DDB_MAIN[(DynamoDB FeriaData)]
  L_VOICE_API --> DDB_MAIN
  L_CHAT --> DDB_MAIN
  L_ENG --> DDB_MAIN

  L_CHAT --> DDB_CHAT_C[(DynamoDB ChatConversations)]
  L_CHAT --> DDB_CHAT_M[(DynamoDB ChatMessages)]
  L_ENG --> DDB_ENG[(DynamoDB FeriaEngagement)]
  L_TYPES --> DDB_TYPES[(DynamoDB TiposMovimiento)]
  L_USERS --> DDB_USERS[(DynamoDB UsersTable)]

  %% Voz
  L_VOICE_API --> S3VOICE[(S3 VoiceAudioBucket)]
  S3VOICE --> EVT[S3 ObjectCreated uploads/*]
  EVT --> L_VOICE_PROC[Lambda Voice Processor]
  L_VOICE_PROC --> DDB_MAIN
  L_VOICE_PROC --> DDB_TYPES

  %% STT e IA
  L_VOICE_PROC --> TR[Amazon Transcribe]
  L_VOICE_PROC --> AAI[AssemblyAI (opcional)]
  L_CHAT --> BR[Amazon Bedrock]
  L_ENG --> BR
  L_VOICE_PROC --> BR

  %% CI/CD
  GH[GitHub Actions] --> BUILD[Vite build]
  BUILD --> S3WEB
  GH --> INV[CloudFront invalidation]
  INV --> CF
```

---

## 4) Modelo de negocio B2B2C

## Quien paga y quien usa

- C (usuario final): personas que registran movimientos, usan tutor IA, logros y recordatorios para mejorar salud financiera.
- B (cliente pagador): empresas que quieren distribuir bienestar financiero a su base de usuarios/empleados/clientes (ej. neobancos, aseguradoras, fintechs, programas de wellness laboral, aliados educativos).

## Propuesta de valor

- Para C:
  - claridad financiera diaria (registro + clasificacion),
  - acompanamiento contextual (tutor),
  - motivacion conductual (logros, retos, recordatorios).
- Para B:
  - canal de engagement recurrente con utilidad real,
  - activacion de usuarios con data agregada de uso,
  - base para beneficios y productos financieros responsables.

## Mecanismos de monetizacion plausibles en hackathon -> piloto

- Licencia B2B por cohorte activa (MAU) para modulo de bienestar financiero.
- Fee por programa (implementacion + operacion mensual).
- Revenue share/afiliacion etica por beneficios activados con consentimiento.
- Plan enterprise con personalizacion (branding, reglas de engagement, reporting).

## Guardrails clave del modelo

- El valor core para C no depende de aceptar publicidad o afiliados.
- Cualquier activacion comercial requiere consentimiento explicito y granular.
- Priorizar analitica agregada para B; evitar exposicion de datos personales innecesarios.

---

## 5) Decisiones arquitectonicas: por que y como

## 5.1 Frontend Ionic + React + Capacitor

- Por que:
  - una sola base de codigo para web y movil.
  - velocidad de iteracion para hackathon.
- Como:
  - shell comun con navegacion por secciones,
  - Vite para feedback rapido en desarrollo,
  - Capacitor para capacidades nativas sin reescribir app.

## 5.2 Cognito + Amplify en cliente

- Por que:
  - autenticacion gestionada, escalable y segura,
  - soporte nativo de email/password y federacion Google.
- Como:
  - OAuth Authorization Code en Hosted UI,
  - app obtiene tokens y los usa en Authorization Bearer,
  - backend valida con Cognito User Pools Authorizer.

## 5.3 API Gateway REST + Lambda por dominio

- Por que:
  - arquitectura serverless costo-eficiente para trafico variable,
  - despliegue rapido y desacople por casos de uso.
- Como:
  - rutas separadas para voz, chat, engagement, catalogo y users,
  - handlers con responsabilidades claras,
  - CORS habilitado para clientes web.

## 5.4 DynamoDB on-demand

- Por que:
  - elimina gestion de capacidad en fase MVP,
  - baja friccion operativa para equipo pequeno.
- Como:
  - tablas por bounded context (chat, engagement, movimientos, etc.),
  - GSI para consultas de movimientos por usuario y fecha,
  - esquema orientado a acceso y no a joins relacionales.

## 5.5 Pipeline de voz con S3 event-driven

- Por que:
  - desacopla upload de audio del procesamiento,
  - permite reintentos y trazabilidad de jobs.
- Como:
  - API crea job + URL prefirmada,
  - cliente sube audio a S3,
  - evento de S3 dispara Lambda de procesamiento,
  - Lambda transcribe, clasifica y persiste movimiento(s).

## 5.6 Bedrock para tutor y apoyo analitico

- Por que:
  - acelera prototipado de asistente conversacional,
  - flexibilidad para cambiar modelo por config.
- Como:
  - `BEDROCK_MODEL_ID` configurable,
  - chat REST no streaming para simplicidad inicial,
  - resultados guardados en tablas de conversaciones/mensajes.

## 5.7 CI/CD web en S3 + CloudFront

- Por que:
  - hosting estatico robusto y barato,
  - excelente para SPA con cache global.
- Como:
  - workflow builda frontend,
  - sincroniza `dist/` a bucket,
  - invalida CloudFront para propagar cambios.

## 5.8 IaC con CDK en repo dedicado

- Por que:
  - trazabilidad y reproducibilidad de infraestructura,
  - facilita revision tecnica por PR.
- Como:
  - stack unico para MVP,
  - variables en `.env` para entorno,
  - posibilidad de stack auxiliar para Transcribe cross-region.

---

## 6) Mejoras futuras priorizadas

## Arquitectura y operacion

1. Multi-entorno formal (dev/staging/prod) con cuentas separadas y politicas IAM por ambiente.
2. Endurecer seguridad:
   - reemplazar secretos sensibles por Secrets Manager,
   - reducir CORS wildcard donde sea viable,
   - WAF y rate limiting por ruta.
3. Observabilidad productiva:
   - metricas de negocio + tecnicas (latencia por endpoint, errores por handler, costo por flujo voz/chat),
   - trazas distribuidas (AWS X-Ray / OpenTelemetry).
4. Contratos API y versionado (OpenAPI + pruebas de contrato).

## Producto y datos

1. Motor de reglas de logros/recordatorios configurable sin redeploy (tabla de reglas + consola interna).
2. Personalizacion del tutor por etapa de usuario y nivel de alfabetizacion financiera.
3. Mejor calidad de datos:
   - normalizacion de categorias,
   - deteccion de duplicados,
   - reconciliacion temporal.
4. Modo offline-first para captura local y sync posterior.

## Go-to-market B2B2C

1. Tenanting ligero (branding, reglas y contenidos por partner).
2. Dashboard B2B con KPIs agregados y anonimizados.
3. Marco de consentimiento granular y auditable para partners/afiliados.
4. Pilotos por vertical (educacion, financiero, bienestar laboral).

---

## 7) Alineacion con ODS 8 (Trabajo decente y crecimiento economico)

El ODS 8 busca crecimiento economico sostenido e inclusivo, empleo pleno y trabajo decente. Feria puede contribuir en tres capas:

## 7.1 Impacto directo en personas (C)

- Mejora de capacidades financieras practicas (registro, lectura de patrones, decision informada).
- Reduccion de estres financiero cotidiano, que impacta productividad y estabilidad laboral.
- Inclusion financiera digital para perfiles con baja alfabetizacion financiera.

## 7.2 Impacto en organizaciones (B)

- Programas de bienestar financiero para colaboradores y comunidades de clientes.
- Menor ausentismo/rotacion asociada a estres financiero (hipotesis a validar en piloto).
- Herramientas para impulsar empleo de calidad via acompanamiento no extractivo.

## 7.3 Practicas de implementacion responsables

- IA asistiva y explicable (no punitiva, no discriminatoria).
- Consentimiento informado y control del usuario sobre sus datos.
- Monetizacion alineada a valor real, evitando dependencia de venta opaca de datos.

## Indicadores sugeridos para reportar ODS 8 en pilotos

- % usuarios activos que sostienen habito de registro >= 4 semanas.
- Variacion de auto-reporte de control financiero (encuesta corta pre/post).
- % usuarios que completan acciones de mejora (ej. plan semanal, meta de ahorro).
- Retencion mensual de uso del tutor y correlacion con continuidad laboral/educativa (si aplica y con consentimiento).

---

## 8) Riesgos abiertos y mitigaciones

- Riesgo: complejidad creciente en un stack unico CDK.
  - Mitigacion: separar por stacks de dominio al pasar a staging/prod.
- Riesgo: sobrecostos de IA/STT por uso intensivo.
  - Mitigacion: limites por usuario, caching de respuestas y ruteo de modelo por tarea.
- Riesgo: percepcion negativa por afiliacion/comercial.
  - Mitigacion: transparencia radical, opt-in granular y valor base sin condicionamiento.
- Riesgo: deuda de seguridad en MVP (policies amplias, secretos en env).
  - Mitigacion: hardening por fases antes de escalar pilotos.

---

## 9) Conclusiones

La arquitectura actual esta bien orientada para objetivos de hackathon: velocidad, iteracion y demostracion de valor end-to-end (auth -> API -> IA -> persistencia -> UX). El siguiente salto para convertir esto en producto B2B2C sostenible es reforzar seguridad, observabilidad, gobierno de datos y operacion multi-tenant, siempre manteniendo el enfoque de impacto real en ODS 8: mas capacidades para trabajo decente y crecimiento economico inclusivo.