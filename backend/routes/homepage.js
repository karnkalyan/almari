const express = require('express');
const router = express.Router();
const homepageController = require('../controllers/homepageController');

router.get('/', homepageController.getSections);
router.post('/', homepageController.createSection);
router.put('/reorder', homepageController.reorderSections);
router.put('/:id', homepageController.updateSection);
router.delete('/:id', homepageController.deleteSection);

router.post('/:sectionId/items', homepageController.createSectionItem);
router.put('/items/:itemId', homepageController.updateSectionItem);
router.delete('/items/:itemId', homepageController.deleteSectionItem);

module.exports = router;
