import { Router } from 'express';
import { body } from 'express-validator';

import { CompetitionController } from '../controllers/competition.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router: Router = Router();

/**
 * @route POST /api/competitions
 * @desc Create a new competition
 * @access Private
 */
router.post(
  '/',
  authenticate,
  [
    body('name').trim().notEmpty().withMessage('Competition name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('rules').optional().isString().withMessage('Rules must be a string'),
    body('visibility').optional().isIn(['public', 'private', 'restricted']).withMessage('Visibility must be one of: public, private, restricted'),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    body('allowedSchools').optional().isArray().withMessage('Allowed schools must be an array')
  ],
  CompetitionController.create
);

/**
 * @route GET /api/competitions
 * @desc Get all accessible competitions for the current user
 * @access Private
 */
router.get('/', authenticate, CompetitionController.getAll);

/**
 * @route GET /api/competitions/:id
 * @desc Get a specific competition
 * @access Private
 */
router.get('/:id', authenticate, CompetitionController.getById);

export default router;
