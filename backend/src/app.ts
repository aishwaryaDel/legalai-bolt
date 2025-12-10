import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import userRoutes from './routes/userRoutes';
import roleRoutes from './routes/roleRoutes';
import userRoleRoutes from './routes/userRoleRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/user-roles', userRoleRoutes);

app.get('/', (req, res) => {
  res.send('Tesa AI Hub Backend is running 🚀');
});

// Centralized error handler middleware (should be last)
app.use(errorHandler);

export default app;
