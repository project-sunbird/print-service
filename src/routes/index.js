const express = require('express'),
  router = express.Router(),
  printService = require('../service/print-service');

router.post('/v1/print/preview/generate', (req, res) => printService.generate(req, res));

router.post('/v1/print/pdf', (req, res) => printService.printPdf(req, res, 'html'));

router.post('/v1/print/png', (req, res) => printService.printPdf(req, res, 'svg'));

router.get('/health', (req, res) => printService.health(req, res));

module.exports = router;
