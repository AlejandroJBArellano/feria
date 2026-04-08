# Borrador: partners, afiliados, leads y consentimiento (México)

**Estado:** borrador interno para producto, UX y legal. **No sustituye asesoría legal.** Debe revisarlo un abogado familiarizado con la **LFPDPPP** y normativa sectorial aplicable (seguros, fintech, etc.).

---

## 1. Finalidad de este documento

Definir cómo Feria:

- Ofrece valor **gratuito** al usuario.
- Integra **B2B2C** (neobancos, aseguradoras, educación financiera, empleadores / wellness financiero).
- Opera **afiliados éticos** sin que el usuario perciba “venden mis datos”.
- Genera **leads cualificados** solo con **consentimiento explícito, informado y granular**.

---

## 2. Principios (marca y cumplimiento)

| Principio | Significado operativo |
|-----------|------------------------|
| **Minimización** | Solo recolectar y tratar datos necesarios para la función (tracker, logros, tutor). |
| **Finalidad** | Cada flujo de datos tiene una finalidad declarada; no reutilizar para lead gen sin nuevo consentimiento. |
| **Transparencia** | Quién es el responsable, qué datos, con quién se comparten, por cuánto tiempo. |
| **Consentimiento** | Opt-in separado para: (a) beneficios/partners, (b) contacto comercial de un tercero, (c) afiliados con tracking. |
| **Revocación** | El usuario puede retirar consentimientos sin perder el núcleo gratuito del tracker (salvo que la ley exija lo contrario). |
| **No condicionamiento abusivo** | El registro de movimientos y el tutor base **no** dependen de aceptar partners o afiliados. |

---

## 3. Roles LFPDPPP (referencia)

- **Responsable:** la entidad que determine los fines y medios del tratamiento (p. ej. la empresa operadora de Feria).
- **Encargado:** quien trate datos por cuenta del responsable (p. ej. proveedor cloud bajo contrato).
- **Terceros / co-responsabilidad:** partners que reciban datos identificables deben encajar en contratos y avisos claros.

*(Ajustar denominaciones con asesor legal según estructura societaria real.)*

---

## 4. B2B2C y “beneficios”

### 4.1 Contenido o beneficios en app

- Cada bloque de partner debe estar **marcado** (“Contenido de [Nombre del partner]” o “Beneficio para usuarios Feria”).
- Enlace a **aviso de privacidad del partner** cuando haya tratamiento conjunto o remisión de datos.
- **No** mezclar publicidad como si fuera consejo del tutor sin etiqueta; el tutor debe poder citar fuentes cuando recomiende un beneficio pagado.

### 4.2 Modelos de ingreso (alto nivel)

| Modelo | Descripción | Requisito de consentimiento |
|--------|-------------|----------------------------|
| **Fee por programa / piloto** | El partner paga por alcance o por cohorte agregada | Contrato B2B; usuario solo ve beneficios explícitos |
| **White-label ligero** | Marca copresentada en módulos educativos | Aviso + posible licencia de marca |
| **Leads cualificados** | El usuario **solicita** contacto (ej. “Quiero hablar con un asesor”) | Opt-in **explícito** por finalidad; registro de prueba de consentimiento |
| **Distribución de cupones** | Código o deep link sin compartir datos hasta canje | Mínimo: transparencia de afiliación si hay comisión |

---

## 5. Afiliados éticos

### 5.1 Criterios de catálogo (públicos recomendados)

- Producto **alineado** con salud financiera (ahorro, protección básica, educación).
- **Transparencia de comisión** en una página “Cómo financiamos Feria” (alto nivel: “podemos recibir comisión si contratas X”).
- **No** venta de datos de comportamiento como producto; ingresos por **afiliación declarada** o fee por referencia con consentimiento.

### 5.2 UX mínima

- Antes de salir a un formulario externo: pantalla intersticial **“Vas a salir de Feria hacia [sitio]. [Partner] tendrá su propio aviso de privacidad.”**
- Opción “No gracias” visible.
- No usar dark patterns (timer falso, doble negación en checkboxes).

---

## 6. Leads cualificados (con consentimiento)

### 6.1 Flujo mínimo

1. Usuario inicia **acción explícita** (“Solicitar información”, “Agendar llamada”).
2. Pantalla de **resumen**: qué datos se envían (nombre, tel, email, ciudad, interés), a **quién**, para **qué finalidad**, **duración** estimada del tratamiento por el partner.
3. Checkbox o acción inequívoca **separada** del aceptar Términos generales de la app.
4. Registro auditable: timestamp, versión del texto legal, identificador del partner.

### 6.2 Prohibido en esta política de producto

- Enviar perfiles comportamentales a terceros **sin** este flujo.
- Inferir “interés” solo por navegación y disparar WhatsApp del partner sin opt-in.

---

## 7. Consentimientos sugeridos en UI (granular)

Textos orientativos (legal debe afinar):

1. **Núcleo del servicio:** cuenta, movimientos, tutor con contexto de tus datos (base del producto).
2. **Notificaciones y recordatorios** (canal y frecuencia) — ver [recordatorios v1](./reminders-v1-spec.md).
3. **Beneficios y contenido de partners** (mostrar sección de beneficios).
4. **Contacto comercial de terceros** (leads; solo si el usuario solicita).
5. **Cookies / analítica** (si aplica en web; en app, SDKs equivalentes con transparencia).

---

## 8. Derechos del titular (recordatorio para UX)

Prever accesos desde Ajustes / Privacidad:

- Acceso, rectificación, cancelación, oposición (según proceda).
- Revocación del consentimiento.
- Aclaraciones vía canal de contacto del responsable.

---

## 9. Relación con el tutor y logros

- El tutor **no** debe filtrar ofertas por defecto en conversaciones de soporte financiero.
- Los logros y retos **no** deben bloquearse por no aceptar partners.
- Cualquier mención de partner en el tutor sigue la [guía de tono](./tutor-tone-guide.md) y el etiquetado de origen.

---

## 10. Próximos pasos legales / producto

- [ ] Redactar **Aviso de Privacidad** integral y **Términos** públicos en sitio/app.
- [ ] Registro con **INAI** u obligaciones aplicables (si corresponde por volumen/actividad).
- [ ] DPIA o evaluación de riesgo para tratamiento de datos financieros agregados.
- [ ] Contratos tipo con partners (encargo / co-responsabilidad / transferencias).
