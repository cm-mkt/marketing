# Tablero SCH · Cinthya

Página de uso diario (móvil): acciones del día, dashboard semanal, leads y solicitudes de sourcing. La URL prevista es:

https://cm-mkt.github.io/marketing/tablero-sch/

Cada teléfono guarda marcas, notas, comentarios de leads y la lista de sourcing en `localStorage`. Cambiar el JSON no borra lo que ella ya editó en ese navegador.

No incluyas teléfonos ni correos en estos archivos. Los datos salen en solo lectura desde HighLevel y la hoja de Cinthya. No llevan teléfonos, correos ni ids de HighLevel.

## Actualizar las acciones del día

Sustituye `tablero-sch/acciones.json`.

Con un día nuevo, cambia `fecha`. Las marcas de ese teléfono empiezan en blanco. Lo que el día anterior quedó en **Pendiente** o **Mañana** aparece en «Pendientes de días anteriores».

Si vuelves a publicar **el mismo** `fecha`, conserva los `id`. Un `id` nuevo entra como pendiente y no borra las marcas de los demás. Los `id` `b1`–`b12` vienen del tablero publicado; `b13` en adelante son acciones nuevas. El orden del arreglo es el orden en pantalla.

### Esquema `acciones.json`

Mismo esquema de siempre (`fecha`, `titulo_fecha`, `acciones[]`, `ojo[]`, `otros[]`). Cada acción trae además `tipo`, `mensaje`, `video` y `lead_id`.

```json
{
  "fecha": "2026-11-26",
  "titulo_fecha": "Jueves 26 de noviembre",
  "acciones": [
    {
      "id": "b2",
      "prioridad": "rojo",
      "cliente": "Jesús Velázquez",
      "unidad": "MH-91315 · Hiab 322E-5 (patio Juárez)",
      "accion": "Llámale y ponle fecha para apartar la unidad.",
      "contexto": "La negociación ya está aprobada.",
      "tipo": "llamada",
      "mensaje": "Hola Jesús, buen día…",
      "video": "",
      "lead_id": "L7f647a62"
    }
  ],
  "ojo": [
    { "titulo": "MH-91315:", "texto": "no la ofrezcas ni la confirmes a nadie más." }
  ],
  "otros": [
    { "quien": "Gabriel", "texto": "recibir a Oscar contigo" }
  ]
}
```

| Campo | Qué es |
| --- | --- |
| `fecha` | Día en ISO `YYYY-MM-DD`. Clave de guardado de ese día. |
| `titulo_fecha` | Texto del encabezado, por ejemplo `Jueves 26 de noviembre`. |
| `acciones[].id` | Identificador estable dentro de ese `fecha`. |
| `acciones[].prioridad` | `rojo` (urgente / dinero), `ambar` (promesa pendiente) o `verde` (seguimiento). |
| `acciones[].cliente` | Nombre que se ve en la tarjeta. |
| `acciones[].unidad` | Unidad o referencia. Puede ir vacío. |
| `acciones[].accion` | Qué hay que hacer. |
| `acciones[].contexto` | Por qué, o el detalle. Puede ir vacío. |
| `acciones[].tipo` | `mensaje`, `llamada`, `video_personalizado`, `enviar_opciones`, `pedir_a_compras`, `pasar_a_vendedor`, `esperar` o `cerrar`. |
| `acciones[].mensaje` | Texto listo para copiar, o `""`. Los corchetes `[precio confirmado]` se llenan antes de enviar. |
| `acciones[].video` | Solo en `video_personalizado`: qué debe decir o mostrar el video. Si no, `""`. |
| `acciones[].lead_id` | `id` en `leads.json`. `""` si la acción agrupa a varios leads o el lead no entró por el agente desde el 5/11. |
| `ojo[]` | Avisos. `titulo` sale en negrita; `texto` es el resto. También se acepta un string. |
| `otros[]` | «Lo que mueven otros». `quien` es la persona; `texto` es el resto. También se acepta un string. |

La página pide este archivo con `fetch` y `cache: "no-store"`, más una query `?t=`. El service worker no guarda este JSON.

## Leads

`tablero-sch/leads.json` es un objeto, no un arreglo:

```json
{ "generado": "2026-11-26T13:33-07:00", "total": 108, "leads": [] }
```

`generado` es la hora del corte (Hermosillo, UTC-7). La página la muestra como `Actualizado 26/11 13:33`. `leads` va del más nuevo al más viejo.

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | string | `L` + 8 hex. Estable entre corridas. |
| `nombre` | string | Como está en HighLevel. `(sin nombre)` si el nombre era un número. |
| `fecha_entrada` | string | `D/M`, como en la hoja. |
| `tipo` | `Op` \| `D` | Op = oportunidad en SCH. D = conversación directa, sin oportunidad SCH. |
| `etapa` | string | Etapa SCH actual, o `""`. |
| `vendedor` | string | Nombre de pila. `""` si no hay. |
| `equipo_buscado` | string | Corto. Puede ir vacío. |
| `fuente` | `web` \| `campaña` \| `facebook` \| `orgánico` \| `""` | `web` incluye los saludos genéricos del botón del sitio. |
| `ultimo_mensaje` | objeto | `{ quien: lead\|agente\|nosotros\|"", hace: "3 h" \| "2 d", resumen }`. `resumen` máx. 100 caracteres. Los videos se marcan `[video general de bienvenida]` o `[video personalizado]`. |
| `siguiente_accion` | objeto | `{ tipo, prioridad, por_que, mensaje }`. `tipo` usa el mismo enum que las acciones. `prioridad`: `rojo`, `ambar`, `verde`. `mensaje` es texto para WhatsApp o `""`. |
| `comentario_previo` | string | COMENTARIOS de la hoja. Si hubo reentradas, se unen con ` \| `. |
| `llamar` | bool | La hoja tenía X en Marcar. |
| `no_oportunidad` | bool | Etapa SCH No oportunidad, o fila en rojo en la hoja. |

Reglas de la siguiente acción (resumen): X → llamada. Pidió llamada → llamada (rojo). Pidió precio → enviar_opciones. Vendedor o proveedor → pedir_a_compras. Venta o visita → pasar_a_vendedor. Menos de 24 h desde nuestro mensaje → esperar. Negociación o Interés validado con 3+ días sin respuesta → video_personalizado. 3 a 7 días → mensaje de reactivación. 14+ días con 2+ intentos → cerrar. El video general no se repite.

La pestaña **Leads** es la hoja ya llena. Ella solo completa lo que falta. Sus notas y toggles viven en `sch_leads_v1`, por `id`, y cruzan los días. Un `leads.json` nuevo **nunca** pisa su comentario, «Llamada hecha», «Mensaje enviado» ni «Mover a No oportunidad».

Contadores de arriba (sobre toda la lista): total, Op, D, llamar, no oportunidad (dato o marca local), sin acción (`siguiente_accion.tipo` vacío o `esperar`).

Filtros: Todos, Prioridad rojo, Llamar, Mensaje por mandar (hay texto y todavía no lo marcó enviado), Esperando. Las filas de no oportunidad vienen ocultas; **Ver no oportunidad** las muestra.

**Exportar CSV (formato hoja)** descarga todas las filas, en el orden del JSON, con esta primera línea exacta (UTF-8 con BOM):

```
Marcar,,NOMBRE,FECHA ENTRADA,ESTATUS,COMENTARIOS
```

- `Marcar` = `X` si `llamar` y la llamada todavía no está hecha.
- La segunda columna (encabezado vacío) = `Op` o `D`.
- `ESTATUS` = `Revisado` si ella tocó la fila, si no `Pendiente`.
- `COMENTARIOS` = su comentario, o si no `comentario_previo`.

En una hoja que no parte por comas: Archivo → Importar, o pegar y Dividir texto en columnas.

## Solicitudes de sourcing

La pestaña **Sourcing** es una lista continua, no por día. Vive en `localStorage` con la clave `sch_sourcing_v1`.

`tablero-sch/sourcing.json` solo **siembra**:

- La primera vez que abre la página en ese navegador, copia las filas.
- Después, si el JSON trae un `id` que ahí no existe, agrega esa fila.
- Nunca pisa cliente, estatus, comentarios ni el cierre de un `id` que ya está guardado.

### Esquema `sourcing.json`

```json
{
  "solicitudes": [
    {
      "id": "s1",
      "cliente": "Valentina",
      "equipo": "Telehandler",
      "capacidad": "6 TON",
      "estatus_solicitud": "Solicitado",
      "comprador": "Josue",
      "estatus_recepcion": "",
      "estatus_cliente": "Pendiente",
      "comentarios": ""
    }
  ]
}
```

| Campo | Valores |
| --- | --- |
| `id` | Estable. No lo cambies si la fila ya se sembró. |
| `cliente`, `equipo`, `capacidad`, `comprador`, `comentarios` | Texto. Vacío permitido. |
| `estatus_solicitud` | `Pendiente`, `Solicitado`, `Enviado`, o `""`. |
| `estatus_recepcion` | `Pendiente`, `Recibido`, o `""`. |
| `estatus_cliente` | `Pendiente`, `Enviado`, o `""`. |

**Siguiente paso** (el primero que cumpla):

1. `estatus_cliente` es `Enviado` → **Dar seguimiento**.
2. `estatus_recepcion` es `Recibido` → **Enviar al cliente**.
3. `estatus_solicitud` es `Solicitado` o `Enviado`, y la recepción no es `Recibido` → **Esperando a comprador**.
4. `estatus_solicitud` vacío o `Pendiente` → **Pedir a compras**.

**Exportar CSV** de sourcing usa esta cabecera:

```
CLIENTE,EQUIPO,CAPACIDAD,ESTATUS DE SOLICITUD,COMPRADOR,ESTATUS DE RECEPCIÓN,ESTATUS CLIENTE,COMENTARIOS
```

El corte del día junta acciones, sourcing (conteos y filas tocadas hoy) y leads (llamadas hechas, mensajes enviados, movidos a no oportunidad y comentarios nuevos de ese `fecha`).

## Dashboard semanal

`tablero-sch/dashboard.json` lo reemplaza un trabajo aparte **cada viernes**. La pestaña Dashboard lo pide con `fetch`, `cache: "no-store"` y `?t=`, igual que `acciones.json` y `leads.json`. El service worker no lo guarda: si hay red, siempre llega el archivo nuevo.

Si un campo viene `null`, la pantalla muestra `—` o `por medir` (por ejemplo una táctica que todavía no se midió).

El archivo trae `generado`, `semana` (`inicio`, `fin`, `etiqueta`), `periodo_total`, `kpis[]` (`id`, `label`, `valor`, `unidad` `MXN` | `%` | `h` | conteo, `delta_vs_semana_anterior`, `nota`), `embudo[]`, `tacticas[]` (`enviados`, `respondieron`, `tasa`, `mediana_respuesta_h`, `veredicto` `funcionó` | `no funcionó` | `probar más`), `leads_por_dia[]` (`fecha`, `op`, `d`, `total`), `tiempo_respuesta_buckets[]`, `por_fuente[]`, `bitacora[]`, `aprendizajes[]` y `propuestas[]` (`texto`, `estado`).

La mediana de primera respuesta pinta el delta negativo en verde (bajar horas es mejor). El resto de los deltas: subir es verde y bajar es rojo. **Copiar resumen** arma un texto plano con KPIs, tácticas y aprendizajes para WhatsApp.

Acciones sigue siendo la pestaña que abre la página.

## Guardado en el teléfono

| Clave | Contenido |
| --- | --- |
| `tableroSCH_cinthya_YYYY-MM-DD` | Estatus, nota, hora y extras de ese día, más una copia de las tarjetas. |
| `tableroSCH_cinthya_dias` | Fechas que ese navegador ya abrió. |
| `sch_leads_v1` | Comentario y toggles de cada lead, por `id`. |
| `sch_sourcing_v1` | Solicitudes de sourcing, incluidas las cerradas. |

Reiniciar el día borra solo las marcas de esa `fecha`. No toca leads, sourcing ni días anteriores.

## Publicar

GitHub Pages tiene que servir la rama `main`, carpeta `/` (root). Hace falta el `.nojekyll` de la raíz.

No hay workflow de Actions: la fuente pedida es la rama, no GitHub Actions.

Para instalarla en el teléfono: abrir la URL → Agregar a pantalla de inicio. El ícono es MH en blanco sobre azul `#134a88`, con una franja naranja `#f18c26`.

Sin red, la cáscara puede abrir desde el service worker, pero `acciones.json`, `leads.json`, `sourcing.json` y `dashboard.json` no se sirven desde caché. Los gráficos del dashboard van en la página (SVG), sin librerías externas. Lo ya guardado en el teléfono sigue ahí.
