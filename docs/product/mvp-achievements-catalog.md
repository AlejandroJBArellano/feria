# Catálogo MVP de Logros

Aquí definimos cómo se evalúan las metas iniciales y los logros para la v1 de Feria. Procesamos esto basándonos directamente en los datos de la tabla de DynamoDB (`movementDate` y `amount`). 

Evacuamos la idea de crear sistemas de puntos hiper gamificados o RPG. Simplemente buscamos incentivar constancia ("registro el día a día") y control ("noto si estoy gastando de más").

## Metas Disponibles e IDs

### 1. `first_movement` (El rompehielo)
- **Comportamiento**: Un logro del tipo one-shot.
- **Regla**: Existe como mínimo un registro con el ID del usuario.
- **Feedback UI**: "Registraste tu primer movimiento."

### 2. `streak_register_7` (Una Semana Consecutiva)
- **Comportamiento**: Recurrente mensual.
- **Regla**: Siete días consecutivos, cruzando cualquier hora del día pero verificando las fechas calendario (fijar el tz a `America/Mexico_City` de momento para la validación del cron job).
- **Feedback UI**: "Sumás una semana seguida anotando."

### 3. `voice_or_manual_diversity` (Explorador Omnichannel)
- **Comportamiento**: One-shot.
- **Regla**: Un movimiento cuyo endpoint fuente es voz cruzado con al menos uno manual.
- **Feedback UI**: "Productor y director: usaste el registro por voz y el manual."

### 4. `category_coverage_5` (Radar Prendido)
- **Comportamiento**: Mensual (se reinicia).
- **Regla**: Registro en al menos cinco categorías dispares durante un mismo mes.
- **Feedback UI**: "Tus finanzas son de varios colores: registraste más de 5 áreas diferentes."

### 5. `week_spend_below_category_cap` (Categoría Controlada)
- **Comportamiento**: Reto Dinámico.
- **Regla**: Automático en MVP sin armar un panel en la UI. Agarramos la categoría top de la semana pasada, multiplicamos el promedio mensual por 0.9. Si el usuario se mantiene abajo de esa línea, gana el logro de la semana. Solo corre si hay datos suficientes.
- **Feedback UI**: "Mantuviste tus gastos en 'X' por debajo del radar, ¡buen trabajo!"

### 6. `tutor_first_conversation` (El Amigo Fiel)
- **Comportamiento**: One-shot.
- **Regla**: Se detona al crear el primer thread/message en la tabla de chat al interactuar con el AI de Bedrock.
- **Feedback UI**: "Conversaste con tu tutor por vez primera."

---

## Qué quedó por fuera en este sprint

Cosas que nos quedaron sin poder implementar por límites de tiempo (pasan a la V2 o V1.5):
- Metas de ahorro complejas `savings_goal_progress_80`. Requerirá armar nueva estructura tabular para las metas asociadas.
- Logro de `month_clarity_complete` por completar todo un mes; los umbrales eran medios frágiles para probar en dos días de código.
