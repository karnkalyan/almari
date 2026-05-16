const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all sections ordered by position
exports.getSections = async (req, res) => {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: { position: 'asc' },
      include: {
        items: {
          orderBy: { position: 'asc' }
        }
      }
    });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSection = async (req, res) => {
  try {
    const section = await prisma.homepageSection.create({
      data: req.body
    });
    res.status(201).json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const section = await prisma.homepageSection.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    await prisma.homepageSection.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.reorderSections = async (req, res) => {
  try {
    const { sectionIds } = req.body;
    for (let i = 0; i < sectionIds.length; i++) {
      await prisma.homepageSection.update({
        where: { id: sectionIds[i] },
        data: { position: i }
      });
    }
    res.json({ message: 'Reordered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createSectionItem = async (req, res) => {
  try {
    const item = await prisma.homepageSectionItem.create({
      data: { ...req.body, sectionId: req.params.sectionId }
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateSectionItem = async (req, res) => {
  try {
    const item = await prisma.homepageSectionItem.update({
      where: { id: req.params.itemId },
      data: req.body
    });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSectionItem = async (req, res) => {
  try {
    await prisma.homepageSectionItem.delete({
      where: { id: req.params.itemId }
    });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
