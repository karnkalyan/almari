const prisma = require('../prismaClient');

const getSiteSettings = async (req, res) => {
  try {
    const settings = await prisma.siteSettings.findMany();
    const settingsObj = {};
    settings.forEach(setting => {
      try {
        settingsObj[setting.key] = JSON.parse(setting.value);
      } catch {
        settingsObj[setting.key] = setting.value;
      }
    });
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSiteSetting = async (req, res) => {
  try {
    const { key, value, description } = req.body;
    const setting = await prisma.siteSettings.upsert({
      where: { key },
      update: { value: JSON.stringify(value), description },
      create: { key, value: JSON.stringify(value), description },
    });
    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getSiteSetting = async (req, res) => {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: req.params.key },
    });
    if (!setting) return res.status(404).json({ message: 'Setting not found' });
    res.json({ ...setting, value: JSON.parse(setting.value) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSiteSettings,
  getSiteSetting,
  updateSiteSetting,
};
