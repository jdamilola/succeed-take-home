import { Router } from 'express';
import { body } from 'express-validator';

import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router: Router = Router();

/**
 * @route POST /api/auth/login
 * @desc Log in a user
 * @access Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    body('schoolId').optional().isUUID().withMessage('School ID must be a valid UUID'),
    body('schoolDomain').optional().isString().withMessage('School domain must be a string')
  ],
  AuthController.login
);

/**
 * @route GET /api/auth/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', authenticate, AuthController.getProfile);

export default router;
