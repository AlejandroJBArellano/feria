# Recordatorios in-app

La idea central de los recordatorios de Feria es avisarle a las personas si se colgaron de anotar un gasto, pero con un detalle: **no queremos ser spam**. Así que todo funciona in-app, sin emails ni push notifications constantes que estresen.

Acá no usamos predicción futurística ni algoritmos mágicos para interrumpirte al cenar. Utilizamos reglas básicas tomando la última interacción que tuviste en la plataforma.

## Las reglas base

Actualmente la app se basa en estas dos situaciones habituales para decidir si tiene que poner un cartel en tu pantalla principal:

1. **La alerta de Racha en Riesgo**
   - Si tienes varios días seguidos (al menos 3) metiendo un registro nuevo, pero hoy el reloj en tu celular pasó las 8 de la noche y no abriste un ticket, te mandamos un mensaje empujando esto: "Llevas varios días registrando al hilo. Si quedó algo volando por ahí, ciérralo ahora un segundo".

2. **La pregunta nocturna**
   - Si no pasa nada, si es un día súper flojo y llega la noche sin registros puntuales, tiramos suavemente un: "No registramos nada hoy. ¿Te quedó algún movimiento suelto en el bolsillo?".

3. **Presentando al Tutor**
   - Si a lo largo de un par de semanas ya cargaste un par de decenas de movimientos pero nunca cruzaste palabra con la IA del bot, el sistema te lo sugiere: "Tu tutor te puede ayudar a revisar estas últimas tendencias, anímate a preguntarle".

## Límites para no ser pesados

- Para no fastidiarte la experiencia, el frontend está capado a revelar a máximo un (1) sólo banner de ayuda por día del usuario.
- Si le das a descartar (el botón por defecto para cerrar), descansas sin verlo en las siguientes 24 horas obligatoriamente.
- Todo esto cuenta con opción para silenciarlo por completo dentro del menú interno. Nadie te obligará.
