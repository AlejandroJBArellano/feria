# MVP catalog: logros y retos (Fase 1)

**Audience:** producto e ingeniería.  
**Data source today:** movimientos con `kind`, `category`, `concept`, `amount`, `movementDate` / `createdAt`, `source` (API [`ApiMovement`](../../src/api/feriaApi.ts)).  
**Principle:** reglas explícitas y auditables; perfilado por **comportamiento**, no demografía.

---

## Narrative frame (no RPG)

Los logros se agrupan bajo dos ejes de progresión que el usuario entiende sin puntos genéricos:

| Eje | Qué mide | Copy de producto (ejemplo) |
|-----|----------|----------------------------|
| **Claridad** | Qué tan completo y oportuno es el registro | “Ves con claridad a dónde va tu dinero” |
| **Control del mes** | Comparación semanal/mensual vs. tus propios patrones | “Llevas el mes bajo control” |

Cada logro desbloqueado puede mapearse a uno o ambos ejes para UI y tutor.

---

## Catálogo MVP (8 ítems)

### 1. `first_movement` — “Primer paso”

| Campo | Valor |
|-------|--------|
| **Tipo** | Logro único (one-shot) |
| **Eje** | Claridad |
| **Regla** | Existe al menos un movimiento con `sub` del usuario (`count >= 1`). |
| **Evidencia** | Cualquier `kind`, cualquier `source`. |
| **Copy usuario** | “Registraste tu primer movimiento en Feria.” |
| **Siguiente sugerido** | Reto de racha (ítem 2). |

---

### 2. `streak_register_7` — “Siete días seguidos”

| Campo | Valor |
|-------|--------|
| **Tipo** | Reto / logro repetible mensual (configurable) |
| **Eje** | Claridad |
| **Regla** | 7 días **calendario consecutivos** donde cada día existe ≥1 movimiento cuyo `movementDate` (o fallback `createdAt` en TZ del usuario) cae en ese día. |
| **Notas** | Definir TZ fija (ej. `America/Mexico_City`) en implementación. |
| **Copy usuario** | “Llevaste una semana registrando algo cada día.” |
| **Anti-abuso** | Opcional: mínimo 1 gasto **o** 1 ingreso; no solo micro-movimientos duplicados (regla de deduplicación futura). |

---

### 3. `voice_or_manual_diversity` — “Dos formas de contar”

| Campo | Valor |
|-------|--------|
| **Tipo** | Logro único |
| **Eje** | Claridad |
| **Regla** | Al menos un movimiento con `source` que indique voz **y** al menos uno manual (o flujos distintos: p. ej. `voice` vs `manual` / `ingest` según contrato API). |
| **Copy usuario** | “Probaste más de una forma de registrar en la app.” |
| **Dependencia** | Alinear enumeración de `source` con backend cuando se implemente. |

---

### 4. `category_coverage_5` — “Cinco categorías en el mes”

| Campo | Valor |
|-------|--------|
| **Tipo** | Logro mensual (reset por mes natural) |
| **Eje** | Claridad |
| **Regla** | En el mes calendario actual, existen movimientos (recomendado: `gasto`) en ≥ **5** valores distintos de `category` (trim, case-insensitive). |
| **Copy usuario** | “Este mes ya reflejaste gastos en varias áreas de tu vida.” |
| **Notas** | No asumir catálogo cerrado en MVP; usar strings tal cual vienen del API. |

---

### 5. `week_spend_below_category_cap` — “Semana bajo tope en una categoría”

| Campo | Valor |
|-------|--------|
| **Tipo** | Reto (semanal) |
| **Eje** | Control del mes |
| **Regla** | Usuario elige (en UI futura) categoría `C` y tope semanal `X` MXN. Suma de `amount` de `gasto` con esa categoría en la semana ISO elegida **≤ X**. |
| **MVP sin UI de meta** | Versión simplificada: categoría fija sugerida por app (“Comida” / “Ocio”) y tope por defecto basado en **promedio de las últimas 4 semanas × 0.9** (solo si hay datos suficientes; si no, omitir reto). |
| **Copy usuario** | “Esta semana mantuviste [categoría] por debajo de tu referencia.” |
| **Fase 2** | Meta explícita usuario + notificación predictiva. |

---

### 6. `savings_goal_progress_80` — “Meta de ahorro al 80%”

| Campo | Valor |
|-------|--------|
| **Tipo** | Logro (hasta completar meta) |
| **Eje** | Control del mes |
| **Regla** | Requiere entidad **Meta de ahorro** (monto objetivo + ventana o mes). Progreso = ahorro atribuible / objetivo ≥ **0.8**. |
| **Estado hoy** | **No implementable** sin tabla/API de metas; mantener en catálogo como “Fase 1.5”. |
| **Proxy temporal (opcional)** | “Mes con flujo positivo”: suma `ingreso` − suma `gasto` > 0 en el mes (no sustituye meta; solo placeholder de ingeniería si se necesita demo). |

---

### 7. `month_clarity_complete` — “Mes completo”

| Campo | Valor |
|-------|--------|
| **Tipo** | Logro mensual |
| **Eje** | Claridad |
| **Regla** | En el mes calendario, hay ≥ **20** días distintos con al menos un movimiento registrado **o** ≥ **N** movimientos totales con umbral `N` definido por producto (ej. 30). Elegir una definición en implementación y documentarla. |
| **Copy usuario** | “Este mes tu registro estuvo muy completo.” |

---

### 8. `tutor_first_conversation` — “Conversaste con el tutor”

| Campo | Valor |
|-------|--------|
| **Tipo** | Logro único |
| **Eje** | Claridad (hábito de reflexión) |
| **Regla** | Existe al menos una conversación de chat tutor asociada al usuario (REST existente: conversación/mensajes). |
| **Copy usuario** | “Usaste el tutor para revisar tus finanzas.” |
| **Privacidad** | No evaluar contenido del mensaje; solo existencia de hilo. |

---

## Prioridad de implementación sugerida

1. `first_movement`, `streak_register_7`, `category_coverage_5`, `tutor_first_conversation` — solo datos actuales.  
2. `voice_or_manual_diversity` — tras normalizar `source`.  
3. `week_spend_below_category_cap` — versión con heurística o con UI de tope.  
4. `savings_goal_progress_80` — cuando exista modelo de metas.  
5. `month_clarity_complete` — ajustar umbral con métricas de uso reales.

---

## IDs estables

Usar los slugs entre backticks arriba como `achievementId` en persistencia y analítica.
