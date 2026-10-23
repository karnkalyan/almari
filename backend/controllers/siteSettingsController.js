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

const BRANDING_FIELDS = [
  'storeName',
  'logoText',
  'logoImage',
  'favicon',
  'primaryColor',
  'secondaryColor',
  'tertiaryColor',
  'quaternaryColor',
  'accentColor',
  'accentHighlights',
  'merchantQrCode',
  'merchantQrName',
  'merchantQrAccountName',
  'merchantQrAccountNumber',
  'merchantQrInstructions'
];

const updateSiteSetting = async (req, res) => {
  try {
    const { key, value, description } = req.body;
    const userRole = req.user?.role;

    // Must have staff admin/super_admin/editor privileges
    if (!['admin', 'super_admin', 'editor'].includes(userRole)) {
      return res.status(403).json({ message: 'Admin access required to modify site settings' });
    }

    let finalValue = value;

    // Check if non-super_admin is attempting to change branding
    if (userRole !== 'super_admin') {
      if (key === 'branding' || (typeof key === 'string' && key.startsWith('branding_'))) {
        return res.status(403).json({ message: 'Only Super Admin can modify website branding details' });
      }

      if (key === 'site_customization') {
        const existing = await prisma.siteSettings.findUnique({ where: { key } });
        let existingVal = {};
        if (existing) {
          try {
            existingVal = typeof existing.value === 'string' ? JSON.parse(existing.value) : (existing.value || {});
          } catch {
            existingVal = {};
          }
        }

        if (typeof value === 'object' && value !== null) {
          // Detect whether any branding field has been changed
          const isAttemptingBrandingChange = BRANDING_FIELDS.some(field => {
            const newVal = value[field];
            const oldVal = existingVal[field];
            if (newVal === undefined && oldVal === undefined) return false;
            return JSON.stringify(newVal) !== JSON.stringify(oldVal);
          });

          if (isAttemptingBrandingChange) {
            return res.status(403).json({ message: 'Only Super Admin can modify website branding details' });
          }

          // Ensure branding fields are locked to existing database values
          finalValue = { ...value };
          for (const field of BRANDING_FIELDS) {
            if (existingVal[field] !== undefined) {
              finalValue[field] = existingVal[field];
            } else {
              delete finalValue[field];
            }
          }
        }
      }
    }

    const setting = await prisma.siteSettings.upsert({
      where: { key },
      update: { value: JSON.stringify(finalValue), description },
      create: { key, value: JSON.stringify(finalValue), description },
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
