import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import userRoutes from './routes/userRoutes';
import fileRoutes from './routes/fileRoutes';
import { errorHandler } from './middlewares/errorHandler';
 
const app = express();
 
app.use(helmet());
app.use(cors());
app.use(express.json());
 
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
 
app.get('/', (req, res) => {
  res.send('Tesa Legal Ai Backend is running 🚀');
});
 
// Centralized error handler middleware (should be last)
app.use(errorHandler);
 
export default app;
 