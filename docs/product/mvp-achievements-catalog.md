# Catálogo de Logros V1

Para este MVP, decidimos saltarnos cualquier idea de poner sistemas súper complejos de puntos RPG o mil niveles. Feria simplemente busca incentivar que la gente se enganche a anotar y empiece a ver hacia dónde va su dinero. Todo esto lo mostramos de forma fluida validando fechas y montos reales directamente de la base de datos (DynamoDB).

## Lista de Logros

1. **El rompehielo**
   - Se gana automáticamente al anotar el primer movimiento (gasto o ingreso) con tu cuenta.
   - Mensaje al usuario: "Registraste tu primer movimiento."

2. **Una Semana Consecutiva**
   - Requiere haber entrado a la app y registrado al menos algo por 7 días seguidos (hace la validación en base a días calendario).
   - Mensaje al usuario: "Sumaste una semana seguida anotando."

3. **Explorador Omnichannel**
   - Se destraba cuando vemos que el usuario es curioso y metió al menos un movimiento anotado por teclado, y otro mandando directamente un audio.
   - Mensaje al usuario: "Estás usando todas las herramientas: probaste el registro por voz y también el manual."

4. **Radar Prendido**
   - Fomenta anotar variabilidad (cobertura total de la billetera). Salta si el historial detecta que tus movimientos cruzan 5 categorías completamente diferentes en el mismo mes.
   - Mensaje al usuario: "Tus finanzas son de varios colores: registraste más de 5 áreas distintas de tu día a día."

5. **El Amigo Fiel**
   - Para introducir el acompañamiento IA. Se gana al enviar tu primera consulta en la zona del chat con el tutor.
   - Mensaje al usuario: "Conversaste con tu tutor por primera vez."

Los retos semanales más complejos o alertas sobre cuotas quedaron a la espera de las próximas versiones de la plataforma. Por ahora empezamos con lo básico y efectivo.
