const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { protectClient } = require('../middleware/protect')
const { addFavoriteExercise, removeFavoriteExercise, getFavoriteExercises, getTrainers, uploadPic } = require('../controllers/commonFeatures');
const {  getPersonalTrainers, updateSettings, addPersonalTrainer, updatePhoto, getAppointments } = require('../controllers/clientFeatures');


router.use(protectClient);
router.post('/favorite-exercise', addFavoriteExercise);
router.post('/remove-favorite-exercise', removeFavoriteExercise);
router.get('/get-exercises', getFavoriteExercises);
router.get('/all-trainers', getTrainers);
router.post('/add-personal-trainer', addPersonalTrainer);
router.get('/get-personal-trainers', getPersonalTrainers);
router.post('/upload', upload.single('file'), uploadPic);
router.put('/update-settings', updateSettings);
router.put('/update-photo', updatePhoto);
router.get('/get-appointments', getAppointments);
// router.post('/weight-stats', getUserWeightStats);

module.exports = router;