import { Router } from 'express';
import authRoutes from './auth.routes';
import schoolRoutes from './school.routes';
import competitionRoutes from './competition.routes';
import participantRoutes from './participant.routes';

const router: Router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is up and running' });
});

// Register all routes
router.use('/auth', authRoutes);
router.use('/schools', schoolRoutes);
router.use('/competitions', competitionRoutes);
router.use('/participants', participantRoutes);

export default router;
