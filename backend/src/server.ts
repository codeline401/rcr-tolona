// src/server.ts
// Point d'entrée : démarre le serveur HTTP.

import "dotenv/config"; // charge les variables du fichier .env
import app from "./app";

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📋 Health check : http://localhost:${PORT}/health`);
});
