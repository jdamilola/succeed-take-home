import { Router } from 'express';

import { SchoolController } from '../controllers/school.controller';

const router: Router = Router();

/**
 * @route GET /api/schools
 * @desc Get all schools
 * @access Public - For discovery, but could be limited to authenticated users
 */
router.get('/', SchoolController.getAll);

export default router;
