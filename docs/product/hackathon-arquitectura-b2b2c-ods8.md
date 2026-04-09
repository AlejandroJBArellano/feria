# Arquitectura y Modelo B2B2C (Feria)

Feria es una plataforma de educación y acompañamiento financiero. El proyecto está dividido en dos repos para agilizar el desarrollo:
- `feria`: Frontend, experiencia de usuario y conexión a APIs.
- `feria-infraestructure`: Backend, AWS CDK, Lambdas y base de datos.

## Tech Stack

### Frontend
- **Framework**: Ionic React 8, React 19, React Router 5
- **Build Tool**: Vite 5 con TypeScript
- **Movilidad**: Capacitor 8
- **Autenticación**: AWS Amplify (Cognito Hosted UI)
- **Testing**: Vitest, React Testing Library, Cypress

### Backend e IA
- **API**: Amazon API Gateway REST
- **Compute**: AWS Lambda (Node.js 20)
- **Base de Datos**: DynamoDB (on-demand)
- **Storage**: Amazon S3
- **IA y Voz**: Amazon Bedrock (Tutor/Clasificador), Amazon Transcribe / AssemblyAI

### Infraestructura
- **IaC**: AWS CDK v2 (TypeScript)
- **CI/CD**: GitHub Actions desplegando a S3 + CloudFront

## Diagrama de Despliegue

```mermaid
flowchart LR
  %% Clientes
  U1[Usuario final - Web] --> CF[CloudFront]
  U2[Usuario final - App movil via Capacitor] --> CF
  CF --> S3WEB[S3 Web Bucket]

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
  S3VOICE --> EVT[S3 ObjectCreated]
  EVT --> L_VOICE_PROC[Lambda Voice Processor]
  L_VOICE_PROC --> DDB_MAIN
  L_VOICE_PROC --> DDB_TYPES

  %% STT e IA
  L_VOICE_PROC --> TR[Amazon Transcribe]
  L_VOICE_PROC --> AAI[AssemblyAI]
  L_CHAT --> BR[Amazon Bedrock]
  L_ENG --> BR
  L_VOICE_PROC --> BR

  %% CI/CD
  GH[GitHub Actions] --> BUILD[Vite build]
  BUILD --> S3WEB
  GH --> INV[CloudFront invalidation]
  INV --> CF
```

## Modelo B2B2C

- **Usuario final (C)**: Personas que buscan mejorar su salud financiera mediante registro de gastos, tutor de IA y retos.
- **Cliente (B)**: Empresas (neobancos, fintechs, programas de bienestar) que distribuyen la herramienta a sus usuarios.

La idea es que los usuarios obtienen claridad y motivación. Las empresas consiguen un canal de engagement recurrente y datos agregados sobre cómo sus usuarios interactúan con la plataforma. De esta manera el valor core no depende de anuncios invasivos.

## Decisiones de Arquitectura

- Elegimos **Ionic + React + Capacitor** para mantener una sola base de código en web y móvil. Esto nos dio mucha velocidad de iteración.
- Delegar el login a **Cognito + Amplify** fue clave para ahorrarnos temas de seguridad e implementar flujos de OAuth rápidamente.
- La capa serverless (API Gateway + Lambdas + DynamoDB on-demand) mantiene los costos prácticamente en cero durante el desarrollo y absorbe picos de tráfico de manera natural.
- Todo lo que es procesamiento de voz corre de fondo (**event-driven**). El usuario sube el audio a S3 (mediante pre-signed URLs) y un evento levanta un Lambda para transcribir y clasificar el gasto sin bloquear la UI.
- Finalmente, exponer el dashboard via S3 + CloudFront garantiza un SLA excelente y distribución por CDN automatizada mediante Actions.

## Trabajo Pendiente / Próximos Pasos

- Habilitar un entorno formal `staging`.
- Limpiar políticas IAM y sacar secretos como variables del proyecto a algo nativo como Secrets Manager o System Manager.
- Definir un modo offline-first para guardar gastos cuando no hay red y sincronizarlos después.

## Alineación con ODS 8

Nuestro foco está en reducir el estrés financiero para construir ambientes de trabajo y vidas más sanas. Promovemos el **Trabajo decente y crecimiento económico** aportando herramientas claras a personas de distinto nivel de alfabetización financiera, priorizando SIEMPRE la privacidad e intimidad de sus transacciones. No se venden los datos individuales.