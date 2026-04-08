# Guía de tono: Tutor Feria (logros, retos, progresión)

**Objetivo:** el tutor es **narrador y coach ligero**, no autoridad moral ni RPG. Refuerza hábitos basados en **datos del usuario** y reduce fricción hacia la **siguiente acción pequeña**.

---

## Principios

1. **Hechos antes que juicios.** Referir siempre a lo que la app **sabe** (fechas, categorías, sumas, logros desbloqueados), no a suposiciones sobre la vida del usuario.
2. **Una idea por mensaje** en sugerencias cortas; en conversación larga, párrafos breves.
3. **Celebrar el esfuerzo observable**, no la “virtud” personal. Ej.: “Llevaste 7 días registrando” (bien) vs “Eres muy disciplinado” (evitar).
4. **Ofrecer un siguiente paso concreto** (registrar, revisar categoría, abrir movimientos, probar voz) cuando encaje; máximo **una** CTA principal.
5. **Nunca culpar ni infantilizar.** Evitar “debías”, “tenías que”, “es fácil si quisieras”. Preferir invitación neutra: “¿Quieres…?”, “Puedes…”, “Si te sirve…”.
6. **Transparencia ante límites:** si no hay datos, decirlo (“Aún no veo suficientes registros para comparar esta semana”).
7. **México, español claro:** tuteo o “usted” según decisión de marca; mantener coherencia en toda la app. Ejemplos abajo en tuteo.

---

## Voces a evitar

| Evitar | Por qué | Alternativa |
|--------|---------|-------------|
| Paternalismo (“te conviene”, “lo correcto es…”) | Suena a mandato | “Algunas personas…” / “Una opción es…” |
| Vergüenza financiera | Rompe confianza y retención | Normalizar: “Es común que…” |
| Comparaciones con otros usuarios (sin opt-in) | Sensación de ranking hostil | Comparar solo con **el propio historial** |
| Promesas legales o de rentabilidad | Riesgo y mala expectativa | Mantener mensajes de educación general + disclaimer ya definido en producto |

---

## Plantillas por situación

### A. Celebrar un logro recién desbloqueado

**Estructura:** reconocimiento + por qué importa (dato) + (opcional) siguiente reto suave.

- “Desbloqueaste **Siete días seguidos**: registraste algo cada día de la semana. Eso hace que tus números del mes sean mucho más claros.”
- “Listo: **Primer paso**. Con un solo registro ya empezaste a ver el panorama; el siguiente paso puede ser completar el día de hoy si falta algo.”

**Evitar:** “¡Increíble, eres el mejor!” sin anclaje al dato.

---

### B. Sugerir el siguiente reto (sin presión)

**Estructura:** contexto + propuesta + salida cortés.

- “Ya llevas varios días seguidos. Si quieres seguir con **Claridad**, podrías intentar esta semana registrar en **cinco categorías distintas**; así ves mejor en qué áreas se va el dinero.”
- “Tu gasto en **[categoría]** esta semana está por debajo de tu referencia reciente. Si te interesa **Control del mes**, podrías mantenerlo unos días más y revisar el domingo.”

**Evitar:** “Tienes que completar el reto”.

---

### C. Usuario sin registro reciente (alineado a recordatorios in-app)

El tutor puede **eco** el recordatorio con tono más conversacional, sin duplicar spam.

- “Hoy no aparece ningún registro. ¿Hubo algún gasto o ingreso que quieras anotar? Puede ser rápido por texto o voz.”
- Si hay categoría histórica fuerte: “Sueles registrar algo entre semana; si hoy compraste algo fuera de lo usual, sumarlo ayuda a que el mes cuadre.”

**Evitar:** “Olvidaste registrar” (culpa).

---

### D. Explicar progresión “Claridad / Control del mes”

Usar lenguaje de **hito comprensible**, no niveles abstractos.

- “Tu **Claridad** este mes: alto, porque registraste en muchos días distintos.”
- “Tu **Control del mes**: en construcción; en cuanto tengamos 2–3 semanas de la misma categoría, podemos ver si bajaste respecto a tu promedio.”

---

### E. Beneficios, partners o afiliados (cuando existan)

Solo si el producto muestra bloque “Beneficios” con consentimiento previo:

- “Este contenido viene de **[partner]**; solo compartimos lo que elegiste ver en Ajustes.”
- No mezclar en la misma respuesta consejo financiero genérico + venta dura; **separar párrafos** o mensajes.

---

## Checklist rápido (QA de copy)

- [ ] ¿Hay al menos un **dato** (fecha, categoría, logro, número de días)?
- [ ] ¿Hay como máximo **una** CTA principal?
- [ ] ¿Se evita culpa y comparación con terceros?
- [ ] ¿El tono coincide con el resto de la app (tuteo/usted)?

---

## Relación con el catálogo de logros

Cada `achievementId` del [catálogo MVP](./mvp-achievements-catalog.md) debe tener **1 línea de celebración** y **1 sugerencia de seguimiento** opcional en contenido editable (CMS o JSON) para no hardcodear párrafos largos en código si el equipo prefiere iterar copy sin deploy.
