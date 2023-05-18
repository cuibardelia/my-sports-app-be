const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { protectAdmin } = require('../middleware/protect')
const { deleteExercise } = require('../controllers/adminFeatures');
const { deleteUser, updateTrainer, getClients } = require('../controllers/adminFeatures');
const { getTrainers, uploadPic } = require('../controllers/commonFeatures');


router.use(protectAdmin);
router.delete('/delete-exercise', deleteExercise);
router.delete('/delete-user', deleteUser);
router.put('/update-trainer', updateTrainer);
router.get('/trainers', getTrainers);
router.get('/clients', getClients);
router.post('/upload', upload.single('file'), uploadPic);

module.exports = router;