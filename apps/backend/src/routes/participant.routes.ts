import { Router } from 'express';
import { body, param } from 'express-validator';

import { ParticipantController } from '../controllers/participant.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router: Router = Router();

/**
 * @route POST /api/participants
 * @desc Join a competition
 * @access Private
 */
router.post(
  '/',
  authenticate,
  [
    body('competitionId').isUUID().withMessage('Competition ID must be a valid UUID')
  ],
  ParticipantController.join
);

/**
 * @route DELETE /api/participants/:competitionId
 * @desc Leave a competition
 * @access Private
 */
router.delete(
  '/:competitionId',
  authenticate,
  [
    param('competitionId').isUUID().withMessage('Competition ID must be a valid UUID')
  ],
  ParticipantController.leave
);

/**
 * @route GET /api/participants/competitions/:competitionId
 * @desc Get all participants for a competition
 * @access Private (Accessible by users with access to the competition)
 */
router.get(
  '/competitions/:competitionId',
  authenticate,
  [
    param('competitionId').isUUID().withMessage('Competition ID must be a valid UUID')
  ],
  ParticipantController.getParticipants
);

/**
 * @route GET /api/participants/user
 * @desc Get competitions a user is participating in
 * @access Private
 */
router.get(
  '/user',
  authenticate,
  ParticipantController.getUserCompetitions
);

export default router;
