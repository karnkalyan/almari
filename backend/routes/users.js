const express = require('express');
const { getUsers, getUser, updateUser, updateUserRole } = require('../controllers/userController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.put('/:id/role', authenticate, authorizeAdmin, updateUserRole);

module.exports = router;
