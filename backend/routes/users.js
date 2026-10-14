const express = require('express');
const { getUsers, getUser, createUser, updateUser, updateUserRole, deleteUser } = require('../controllers/userController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorizeAdmin, getUsers);
router.post('/', authenticate, authorizeAdmin, createUser);
router.get('/:id', authenticate, getUser);
router.put('/:id', authenticate, updateUser);
router.put('/:id/role', authenticate, authorizeAdmin, updateUserRole);
router.delete('/:id', authenticate, authorizeAdmin, deleteUser);

module.exports = router;
