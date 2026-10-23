const express = require('express');
const { getSitemap, getRobots } = require('../controllers/sitemapController');

const router = express.Router();

router.get('/', getSitemap);

const robotsRouter = express.Router();
robotsRouter.get('/', getRobots);

module.exports = {
  sitemapRouter: router,
  robotsRouter,
};
