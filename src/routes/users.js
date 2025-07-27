const express = require(`express`);
const router = express.Router();

const userController = require(`../controllers/userController`);
const {auth} = require(`../middleware/Auth`)
const {validateUpdateProfile} = require(`../validators/userValidator`);

// Rotas protegidas
router.use(auth);

router.get(`/profile`, userController.getProfile);
router.put(`/profile`, validateUpdateProfile, userController.updateProfile);
router.post(`/logout`, userController.logout);

module.exports = router;