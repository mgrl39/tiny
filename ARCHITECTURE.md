# Análisis Técnico: `tiny`

## Funcionamiento básico

`tiny` es un acortador de URLs que funciona así:

1. Una petición llega a `/:código` (ejemplo: `/gh`)
2. El sistema busca este código en `redirects.json`
3. Si existe, redirige al usuario a la URL completa
4. Si no existe, muestra error 404

## Código principal explicado

### Dependencias e inicialización

```javascript
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
```

- Express maneja las rutas y peticiones HTTP
- fs lee el archivo JSON de redirecciones
- path construye rutas de archivo correctas

### Carga de redirecciones

```javascript
function loadRedirects() {
  try {
    const data = fs.readFileSync(
      path.join(__dirname, "redirects.json"),
      "utf8"
    );
    return JSON.parse(data);
  } catch (err) {
    console.error("Error al cargar redirecciones:", err);
    return {};
  }
}
```

- Lee `redirects.json` de forma síncrona
- Devuelve objeto vacío si hay error
- Se llama en cada petición (no hay caché)

### Registro de peticiones

```javascript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
```

- Registra cada petición con fecha y método
- `next()` continúa al siguiente manejador

### Redirección de URLs

```javascript
app.get("/:shortUrl", (req, res) => {
  const { shortUrl } = req.params;
  const redirects = loadRedirects();

  if (redirects[shortUrl]) {
    return res.redirect(redirects[shortUrl]);
  } else {
    return res
      .status(404)
      .send(`<h1>Ruta no encontrada</h1><p>/${shortUrl}</p>`);
  }
});
```

- Extrae el código corto de la URL
- Busca el código en las redirecciones
- Redirige o muestra 404 según corresponda

### Página de inicio

```javascript
app.get("/", (req, res) => {
  res.send(`<h1>URL Shortener</h1><p>Ejemplo: ${req.get("host")}/github</p>`);
});
```

- Muestra página informativa en la raíz

### Inicio del servidor

```javascript
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
  });
}

module.exports = app;
```

- En desarrollo: inicia servidor Express
- En producción: exporta app para serverless

## Ventajas principales

1. **Simple**: Sin base de datos, solo un archivo JSON
2. **Serverless**: Funciona en Vercel, Netlify, etc.
3. **Actualizable**: Cambios en redirecciones sin reiniciar
4. **Liviano**: Mínimo uso de recursos

## Limitaciones

1. **Escalabilidad**: Archivo JSON tiene límites prácticos
2. **Concurrencia**: No óptimo para volumen muy alto
3. **Persistencia**: Editar JSON requiere acceso al repositorio
