const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/email-templates', settingsController.getEmailTemplates);
router.post('/email-templates', settingsController.updateEmailTemplate);

router.get('/sms-templates', settingsController.getSmsTemplates);
router.post('/sms-templates', settingsController.updateSmsTemplate);

router.get('/notification-events', settingsController.getNotificationSettings);
router.post('/notification-events', settingsController.updateNotificationSetting);

router.get('/notification-recipients', settingsController.getRecipients);
router.post('/notification-recipients', settingsController.updateRecipients);

router.get('/smtp', settingsController.getSmtpSettings);
router.post('/smtp', settingsController.updateSmtpSettings);

router.get('/sms-gateways', settingsController.getSmsGateways);
router.post('/sms-gateways', settingsController.updateSmsGateway);
router.post('/sms-gateways/:id', settingsController.updateSmsGateway);
router.post('/sms-gateways/delete/:id', async (req, res) => {
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient();
  await p.smsGatewaySetting.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

module.exports = router;
