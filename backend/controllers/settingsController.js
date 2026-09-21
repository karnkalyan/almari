const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Email Templates
exports.getEmailTemplates = async (req, res) => {
  res.json(await prisma.emailTemplate.findMany());
};
exports.updateEmailTemplate = async (req, res) => {
  res.json(await prisma.emailTemplate.upsert({
    where: { name: req.body.name },
    update: req.body,
    create: req.body,
  }));
};

// SMS Templates
exports.getSmsTemplates = async (req, res) => {
  res.json(await prisma.smsTemplate.findMany());
};
exports.updateSmsTemplate = async (req, res) => {
  res.json(await prisma.smsTemplate.upsert({
    where: { name: req.body.name },
    update: req.body,
    create: req.body,
  }));
};

// Notification Settings
exports.getNotificationSettings = async (req, res) => {
  res.json(await prisma.notificationSetting.findMany());
};
exports.updateNotificationSetting = async (req, res) => {
  res.json(await prisma.notificationSetting.upsert({
    where: { event: req.body.event },
    update: req.body,
    create: req.body,
  }));
};

// Recipients
exports.getRecipients = async (req, res) => {
  try {
    // Safely check if the model exists in the prisma instance
    const model = prisma.notificationRecipient || prisma['notificationRecipient'];
    if (!model) return res.json({ emails: [], numbers: [] });
    
    const recipients = await model.findMany();
    res.json({
      emails: recipients.filter(r => r.type === 'email').map(r => r.value),
      numbers: recipients.filter(r => r.type === 'sms').map(r => r.value)
    });
  } catch (e) {
    res.json({ emails: [], numbers: [] });
  }
};
exports.updateRecipients = async (req, res) => {
  const model = prisma.notificationRecipient || prisma['notificationRecipient'];
  if (!model) return res.status(500).json({ error: 'Model not found' });

  await model.deleteMany({});
  
  const emails = req.body.emails || [];
  const numbers = req.body.numbers || [];

  for (const email of emails) {
    if (email) await model.create({ data: { type: 'email', value: email } });
  }
  for (const num of numbers) {
    if (num) await model.create({ data: { type: 'sms', value: num } });
  }
  
  res.json({ success: true });
};

// SMTP Settings
exports.getSmtpSettings = async (req, res) => {
  const settings = await prisma.smtpSetting.findFirst();
  res.json(settings || {});
};
exports.updateSmtpSettings = async (req, res) => {
  const existing = await prisma.smtpSetting.findFirst();
  let updated;
  if (existing) {
    updated = await prisma.smtpSetting.update({ where: { id: existing.id }, data: req.body });
  } else {
    updated = await prisma.smtpSetting.create({ data: req.body });
  }
  res.json(updated);
};

exports.deleteEmailTemplate = async (req, res) => {
  await prisma.emailTemplate.delete({ where: { id: req.params.id } });
  res.json({ success: true });
};

exports.deleteSmsTemplate = async (req, res) => {
  await prisma.smsTemplate.delete({ where: { id: req.params.id } });
  res.json({ success: true });
};


// SMS Gateway
exports.getSmsGateways = async (req, res) => {
  const gateways = await prisma.smsGatewaySetting.findMany();
  res.json(gateways);
};
exports.updateSmsGateway = async (req, res) => {
  let updated;
  // Support both POST with body and dynamic params
  const id = req.params.id || req.body.id;
  const data = { ...req.body };
  delete data.id;

  if (id && id !== 'new') {
    updated = await prisma.smsGatewaySetting.update({ where: { id }, data });
  } else {
    updated = await prisma.smsGatewaySetting.create({ data });
  }
  res.json(updated);
};

