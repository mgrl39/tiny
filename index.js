/**
 * @file index.js
 * @brief Servidor de acortador de URLs
 * @description Implementa un servicio que redirecciona URLs cortas a URLs largas
 */

// Importaciones básicas
const express = require("express"); // Framework web
const fs = require("fs"); // Módulo de sistema de archivos
const path = require("path"); // Utilidades para manejo de rutas
const app = express(); // Instancia de la aplicación Express
const PORT = process.env.PORT || 3000; // Puerto del servidor

/**
 * @function loadRedirects
 * @brief Carga las redirecciones desde archivo JSON
 * @return {Object} Objeto con las redirecciones o vacío si hay error
 */
function loadRedirects() {
  try {
    const data = fs.readFileSync(
      path.join(__dirname, "redirects.json"),
      "utf8"
    );
    return JSON.parse(data);
  } catch (err) {
    console.error("Error al cargar las redirecciones:", err);
    return {};
  }
}

/**
 * @middleware requestLogger
 * @brief Registra todas las solicitudes entrantes
 */
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

/**
 * @route GET /:shortUrl
 * @brief Maneja las redirecciones de URLs cortas
 * @param {string} shortUrl - Código corto de la URL
 */
app.get("/:shortUrl", (req, res) => {
  const { shortUrl } = req.params;
  const redirects = loadRedirects();

  if (redirects[shortUrl]) {
    return res.redirect(redirects[shortUrl]);
  } else {
    return res
      .status(404)
      .send(
        `<h1>Ruta no encontrada</h1><p>La ruta /${shortUrl} no existe.</p>`
      );
  }
});

/**
 * @route GET /
 * @brief Muestra la página de inicio con instrucciones
 */
app.get("/", (req, res) => {
  res.send(`
    <h1>URL Shortener</h1>
    <p>Usa este servicio añadiendo un código corto después de la URL.</p>
    <p>Por ejemplo: <code>${req.protocol}://${req.get("host")}/github</code></p>
  `);
});

// Iniciar servidor solo en desarrollo.
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(
      "Redirecciones cargadas:",
      Object.keys(loadRedirects()).join(", ")
    );
  });
}

// Exportar para entornos serverless
module.exports = app;
