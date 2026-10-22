import { Router } from 'express'
import { create, crops, detection, getOne, list, retryPrediction, update } from '../controllers/report.controller.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { parseReportUpload } from '../middleware/upload.js'

const router = Router()

router.use(authenticate) // every report route needs a logged-in user

router.post('/', authorize('FARMER'), parseReportUpload, create) // only farmers submit reports; multipart form with an "image" file
router.get('/', list)
router.get('/crops', crops) // must stay ABOVE '/:id', otherwise "crops" would be read as an id
router.get('/:id', getOne)
router.patch('/:id', authorize('FARMER'), update)
router.get('/:id/detection', detection) // AI result in the shape of the Detection Result screen
router.post('/:id/predict', authorize('FARMER'), retryPrediction) // re-run a failed/pending analysis

export default router
