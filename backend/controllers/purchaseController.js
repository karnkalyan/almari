const prisma = require('../prismaClient');

const normalizeItems = (items = []) => items.map(item => {
  const quantity = parseInt(item.quantity || 0);
  const unitCost = parseFloat(item.unitCost || 0);
  return {
    productName: item.productName,
    sku: item.sku || null,
    quantity,
    unitCost,
    total: quantity * unitCost,
  };
});

const getPurchases = async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({ include: { items: true }, orderBy: { date: 'desc' } });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPurchase = async (req, res) => {
  try {
    const { supplier, invoiceNo, date, tax = 0, shipping = 0, status = 'Received', notes, items = [] } = req.body;
    const purchaseItems = normalizeItems(items);
    const subtotal = purchaseItems.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + parseFloat(tax || 0) + parseFloat(shipping || 0);
    const purchase = await prisma.purchase.create({
      data: {
        supplier,
        invoiceNo,
        date: date ? new Date(date) : new Date(),
        subtotal,
        tax: parseFloat(tax || 0),
        shipping: parseFloat(shipping || 0),
        total,
        status,
        notes,
        items: { create: purchaseItems },
      },
      include: { items: true },
    });
    res.status(201).json(purchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updatePurchase = async (req, res) => {
  try {
    const { supplier, invoiceNo, date, tax = 0, shipping = 0, status = 'Received', notes, items = [] } = req.body;
    const purchaseItems = normalizeItems(items);
    const subtotal = purchaseItems.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + parseFloat(tax || 0) + parseFloat(shipping || 0);
    const purchase = await prisma.purchase.update({
      where: { id: req.params.id },
      data: {
        supplier,
        invoiceNo,
        date: date ? new Date(date) : undefined,
        subtotal,
        tax: parseFloat(tax || 0),
        shipping: parseFloat(shipping || 0),
        total,
        status,
        notes,
        items: {
          deleteMany: {},
          create: purchaseItems,
        },
      },
      include: { items: true },
    });
    res.json(purchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletePurchase = async (req, res) => {
  try {
    await prisma.purchase.delete({ where: { id: req.params.id } });
    res.json({ message: 'Purchase deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPurchases, createPurchase, updatePurchase, deletePurchase };
