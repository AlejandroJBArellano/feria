# Recordatorios in-app v1 (sin ML)

**Objetivo:** aumentar registro oportuno sin culpa ni spam. **Fase 1** = reglas sobre datos ya disponibles (última actividad, conteos, categorías frecuentes). **Fase 2** = modelos predictivos y ventanas horarias (fuera de alcance de este documento).

---

## 1. Canales y alcance

| Canal | v1 |
|-------|-----|
| **In-app** (banner, card en Home, modal no intrusivo) | Sí |
| **Push nativo** (FCM/APNs) | Opcional; requiere permiso OS + consentimiento en app |
| **Email/SMS** | No en v1 (mayor fricción legal y expectativa) |

Todo recordatorio v1 debe poder **descartarse** en un toque y respetar **silencio** (ver §4).

---

## 2. Señales de datos (entradas permitidas)

Derivadas de movimientos del usuario (`movementDate` / `createdAt`, `kind`, `category`, `amount`, `source`):

| Señal | Definición |
|-------|------------|
| `lastMovementAt` | Máximo de fechas efectivas de movimiento (TZ `America/Mexico_City` recomendado). |
| `hasMovementToday` | ≥1 movimiento con fecha efectiva = hoy (calendario local usuario). |
| `streakDays` | Días consecutivos calendario con ≥1 movimiento (misma lógica que logro de racha). |
| `topSpendCategoryLast7d` | Categoría de `gasto` con mayor suma de `amount` en últimos 7 días (excluir categorías vacías). |
| `movementCountLast7d` | Número de movimientos en últimos 7 días. |
| `hasUsedTutor` | Existe conversación tutor (boolean). |

No usar en v1: inferencia de comercio, geolocalización, datos de terceros.

---

## 3. Catálogo de mensajes v1 (plantillas)

Cada regla tiene: **id**, **condición**, **copy**, **CTA principal**, **prioridad** (menor número = gana si compiten).

### R1 — `remind_no_movement_today`

| Campo | Valor |
|-------|--------|
| **Condición** | `!hasMovementToday` y hora local ≥ **18:00** (configurable). |
| **Copy** | “Hoy no registraste movimientos. ¿Hubo algún gasto o ingreso que quieras anotar?” |
| **CTA** | Abrir registro rápido / voz (según rutas de producto). |
| **Prioridad** | 10 |

### R2 — `remind_streak_at_risk`

| Campo | Valor |
|-------|--------|
| **Condición** | `streakDays >= 3` y `!hasMovementToday` y hora local ≥ **20:00**. |
| **Copy** | “Llevas {N} días seguidos registrando. Si aún falta algo de hoy, puedes cerrar el día en un minuto.” |
| **CTA** | Registrar ahora. |
| **Prioridad** | 5 (gana sobre R1 si ambas aplican). |

### R3 — `remind_category_pattern`

| Campo | Valor |
|-------|--------|
| **Condición** | `topSpendCategoryLast7d` definida y `movementCountLast7d >= 5` y `!hasMovementToday` y hora ≥ **19:00**. |
| **Copy** | “Esta semana moviste bastante en **{categoría}**. Si hoy hubo algo más ahí, sumarlo mantiene claro el mes.” |
| **CTA** | Registrar con categoría sugerida (si UI lo permite; si no, registro genérico). |
| **Prioridad** | 15 |

### R4 — `remind_try_tutor`

| Campo | Valor |
|-------|--------|
| **Condición** | `movementCountLast7d >= 10` y `!hasUsedTutor` y pasaron ≥ **14 días** desde `firstMovementAt` (primera fecha de movimiento). |
| **Copy** | “Ya tienes buen historial de registros. Si quieres, el tutor puede ayudarte a ver patrones o el mes en conjunto.” |
| **CTA** | Abrir Tutor. |
| **Prioridad** | 20 |
| **Frecuencia** | Máximo **1 vez cada 30 días** por usuario (ver §4). |

---

## 4. Límites de frecuencia y anti-spam

| Regla global | Valor recomendado v1 |
|--------------|----------------------|
| Máximo **in-app** por día | **2** disparos (el de mayor prioridad que cumpla condición + uno secundario solo si el primero fue descartado hace ≥ 4 h; **o** más simple: **1** por día — elegir en implementación). |
| **Cooldown** tras dismiss | **24 h** para el mismo `reminderRuleId`. |
| **Quiet hours** | No mostrar entre **22:00 y 08:00** hora local (configurable). |
| **Modo silencio** | Toggle en Ajustes: “Pausar recordatorios” → no evaluar reglas hasta reactivar (salvo críticos legales si algún día existieran). |

**Recomendación MVP:** **1 recordatorio in-app por día** por usuario (el de menor `prioridad` numérica que cumpla condición y cooldown).

---

## 5. Consentimiento y opt-out

- Primer uso: pantalla o sección **“Recordatorios”** con interruptor ON por defecto solo si política de producto lo permite; alternativa más conservadora: OFF hasta que el usuario active.
- Texto corto: “Te avisamos dentro de la app para ayudarte a registrar; no vendemos tus datos.”
- Enlace al [borrador de política](./consent-partners-policy.md) / aviso de privacidad definitivo.

---

## 6. Telemetría mínima (para iterar copy)

Eventos sugeridos (sin contenido sensible):

- `reminder_shown` { `ruleId` }
- `reminder_cta` { `ruleId`, `action` }
- `reminder_dismiss` { `ruleId` }

---

## 7. Handoff al tutor

Si el usuario abre el tutor desde un recordatorio, se puede pasar **contexto no sensible** (ej. `source=reminder&rule=remind_streak_at_risk`) para que el primer mensaje del tutor sea coherente con la [guía de tono](./tutor-tone-guide.md), sin repetir el mismo texto del banner.

---

## 8. Fase 2 (fuera de v1)

- Predicción de “días típicos de gasto” y ventanas horarias personalizadas.
- A/B de copy y orden de reglas.
- Push con geofencing: solo con consentimiento explícito y valor claro.
