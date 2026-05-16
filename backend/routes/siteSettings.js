const express = require('express');
const { getSiteSettings, getSiteSetting, updateSiteSetting } = require('../controllers/siteSettingsController');
const { authenticate, authorizeAdmin, authorizeSuperAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getSiteSettings);
router.get('/:key', getSiteSetting);
router.post('/', authenticate, authorizeSuperAdmin, updateSiteSetting);

module.exports = router;
