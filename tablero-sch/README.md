# Tablero SCH · Cinthya

Página de uso diario (móvil): acciones del día y solicitudes de sourcing. La URL prevista es:

https://cm-mkt.github.io/marketing/tablero-sch/

Cada teléfono guarda marcas, notas y la lista de sourcing en `localStorage`. Cambiar el JSON no borra lo que ella ya editó en ese navegador.

No incluyas teléfonos ni correos en estos archivos.

## Actualizar las acciones del día

Sustituye solo este archivo:

`tablero-sch/acciones.json`

Con un día nuevo, cambia `fecha`. Las marcas de ese teléfono empiezan en blanco. Lo que el día anterior quedó en **Pendiente** o **Mañana** aparece en «Pendientes de días anteriores».

Si vuelves a publicar **el mismo** `fecha` (por ejemplo para sumar una acción), conserva los `id` que ya existían. Un `id` nuevo entra como pendiente y no borra las marcas de los demás.

### Esquema `acciones.json`

```json
{
  "fecha": "2026-11-26",
  "titulo_fecha": "Jueves 26 de noviembre",
  "acciones": [
    {
      "id": "b1",
      "prioridad": "rojo",
      "cliente": "Oscar Ángeles",
      "unidad": "MH-91317 · National 600E 20 t",
      "accion": "Recíbelo en patio con la unidad lista y avisa a Gabriel al llegar.",
      "contexto": "Está en Negociación y a las 11:26 dijo “ya casi”."
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
| `acciones[].id` | Identificador estable dentro de ese `fecha`. No lo reutilices para otra acción el mismo día. |
| `acciones[].prioridad` | `rojo` (urgente / dinero), `ambar` (promesa pendiente) o `verde` (seguimiento). |
| `acciones[].cliente` | Nombre que se ve en la tarjeta. |
| `acciones[].unidad` | Unidad o referencia. Puede ir vacío. |
| `acciones[].accion` | Qué hay que hacer. |
| `acciones[].contexto` | Por qué, o el detalle. Puede ir vacío. |
| `ojo[]` | Avisos. `titulo` sale en negrita; `texto` es el resto. También se acepta un string. |
| `otros[]` | «Lo que mueven otros». `quien` es la persona; `texto` es el resto. También se acepta un string. |

La página pide este archivo con `fetch` y `cache: "no-store"`, más una query `?t=` para no usar una copia vieja. El service worker, si está activo, también va a red y no guarda este JSON.

## Solicitudes de sourcing

La pestaña **Solicitudes de sourcing** es una lista continua, no por día. Vive en `localStorage` con la clave `sch_sourcing_v1`.

`tablero-sch/sourcing.json` solo **siembra**:

- La primera vez que abre la página en ese navegador, copia las filas.
- Después, si el JSON trae un `id` que ahí no existe, agrega esa fila.
- Nunca pisa cliente, estatus, comentarios ni el cierre de un `id` que ya está guardado.

Para sumar una solicitud a teléfonos que ya usan la página, agrega un objeto con un `id` nuevo. Editar el texto de un `id` viejo en el JSON no cambia el teléfono de ella. Ella también puede usar **Agregar solicitud** en la página.

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
3. `estatus_solicitud` es `Solicitado` o `Enviado`, y la recepción no es `Recibido` → **Esperando a comprador**. `Enviado` cuenta como pedido ya mandado a compras.
4. `estatus_solicitud` vacío o `Pendiente` → **Pedir a compras**.

Filtros de la pestaña: **Todas**, **Falta solicitar** (Pedir a compras), **Esperando comprador**, **Falta enviar al cliente**. Los contadores son filas abiertas. **Cerrar** oculta la fila detrás de **Ver cerradas**; no la borra. **Reabrir** la devuelve.

**Exportar CSV** descarga las filas abiertas, con esta primera línea exacta (separador coma, UTF-8 con BOM para que Sheets respete los acentos):

```
CLIENTE,EQUIPO,CAPACIDAD,ESTATUS DE SOLICITUD,COMPRADOR,ESTATUS DE RECEPCIÓN,ESTATUS CLIENTE,COMENTARIOS
```

En una hoja con locale que no parte por comas: Archivo → Importar, o pegar y usar Dividir texto en columnas.

El corte del día incluye los cuatro conteos de siguiente paso (solo abiertas) y las filas tocadas hoy (`cambiada` = `fecha` del tablero).

## Guardado en el teléfono

| Clave | Contenido |
| --- | --- |
| `tableroSCH_cinthya_YYYY-MM-DD` | Estatus, nota, hora y extras de ese día, más una copia de las tarjetas para el arrastre al día siguiente. |
| `tableroSCH_cinthya_dias` | Fechas que ese navegador ya abrió. |
| `sch_sourcing_v1` | Solicitudes de sourcing, incluidas las cerradas. |

Reiniciar el día borra solo las marcas de esa `fecha`. No toca sourcing ni días anteriores.

## Publicar

GitHub Pages tiene que servir la rama `main`, carpeta `/` (root). Hace falta el archivo `.nojekyll` de la raíz para que Pages no procese el sitio con Jekyll.

No hay workflow de Actions: la fuente pedida es la rama, no GitHub Actions.

Para instalarla en el teléfono: abrir la URL en Safari o Chrome → Agregar a pantalla de inicio. El ícono es MH en amarillo `#F5B800` sobre negro `#111111`.

Sin red, la cáscara puede abrir desde el service worker, pero `acciones.json` y `sourcing.json` no se sirven desde caché. Si ese teléfono ya tenía la lista de sourcing, esa sí sigue en `localStorage` aunque falle el JSON.
