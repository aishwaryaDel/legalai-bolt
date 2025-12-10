import dotenv from 'dotenv';
import app from './app';
import { swaggerUi, swaggerSpec } from './config/swagger';

dotenv.config();


// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Expose raw swagger JSON for debugging (helps verify what swagger-jsdoc produced)
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

// Log summary of swagger spec at startup to help troubleshoot 'No operations defined'
const pathsCount = swaggerSpec && swaggerSpec.paths ? Object.keys(swaggerSpec.paths).length : 0;
console.log(`📚 Swagger spec generated with ${pathsCount} path(s)`);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf Port ${PORT}`);
});

 