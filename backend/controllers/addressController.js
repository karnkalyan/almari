const prisma = require('../prismaClient');

const getUserAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({ where: { userId: req.userId } });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAddress = async (req, res) => {
  try {
    const { type, street, city, state, zipCode, country, isDefault } = req.body;
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.userId }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({
      data: { userId: req.userId, type, street, city, state, zipCode, country, isDefault },
    });
    res.status(201).json(address);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { type, street, city, state, zipCode, country, isDefault } = req.body;
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.userId }, data: { isDefault: false } });
    }
    const address = await prisma.address.update({
      where: { id: req.params.id },
      data: { type, street, city, state, zipCode, country, isDefault },
    });
    res.json(address);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    await prisma.address.delete({ where: { id: req.params.id } });
    res.json({ message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserAddresses, createAddress, updateAddress, deleteAddress };
