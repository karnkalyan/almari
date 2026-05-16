const prisma = require('../prismaClient');
const SmsService = require('../utils/smsService');

const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: true, address: true, items: { include: { product: true } }, promoCode: true },
      orderBy: { date: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { user: true, address: true, items: { include: { product: true } }, promoCode: true },
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: { address: true, items: { include: { product: true } }, promoCode: true },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { addressId, address, customer, items, total, promoCode, shippingCharge = 0 } = req.body;
    let promoCodeId = null;
    let finalTotal = parseFloat(total || 0);
    let userId = req.userId;
    let resolvedAddressId = addressId;

    if (!userId) {
      const email = customer?.email || 'guest@almari.local';
      const name = customer?.name || 'Guest Customer';
      const user = await prisma.user.upsert({
        where: { email },
        update: { name },
        create: {
          name,
          email,
          password: 'guest-checkout',
          role: 'customer',
        },
      });
      userId = user.id;
    }

    if (!resolvedAddressId && address) {
      const createdAddress = await prisma.address.create({
        data: {
          userId,
          type: address.type || 'shipping',
          street: address.street,
          city: address.city,
          state: address.state || '',
          zipCode: address.zipCode || '',
          country: address.country || 'Nepal',
          isDefault: false,
        },
      });
      resolvedAddressId = createdAddress.id;
    }

    if (!resolvedAddressId) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const normalizedItems = (items || []).map((item) => {
      const selectedServices = Array.isArray(item.selectedServices) ? item.selectedServices : [];
      const serviceTotal = selectedServices.reduce((sum, service) => sum + Number(service.amount || 0), 0);
      return {
        productId: item.productId,
        quantity: Number(item.quantity || 1),
        price: parseFloat(item.price),
        selectedServices,
        serviceTotal,
      };
    });

    const computedSubtotal = normalizedItems.reduce((sum, item) => {
      const lineBase = Number(item.price || 0) * Number(item.quantity || 1);
      const lineServices = Number(item.serviceTotal || 0) * Number(item.quantity || 1);
      return sum + lineBase + lineServices;
    }, 0);
    const normalizedShippingCharge = Number(shippingCharge || 0);
    finalTotal = computedSubtotal + normalizedShippingCharge;

    if (promoCode) {
      const code = await prisma.promoCode.findUnique({
        where: { code: promoCode },
      });
      if (code && code.isActive && (!code.expiresAt || new Date() <= code.expiresAt) && (!code.usageLimit || code.usedCount < code.usageLimit)) {
        promoCodeId = code.id;
        let discount = 0;
        if (code.discountType === 'percentage') {
          discount = (finalTotal * code.discountValue) / 100;
          if (code.maxDiscount && discount > code.maxDiscount) {
            discount = code.maxDiscount;
          }
        } else {
          discount = code.discountValue;
        }
        finalTotal -= discount;

        // Increment used count
        await prisma.promoCode.update({
          where: { id: code.id },
          data: { usedCount: code.usedCount + 1 },
        });
      }
    }

    const order = await prisma.order.create({
      data: {
        userId,
        addressId: resolvedAddressId,
        total: finalTotal,
        shippingCharge: normalizedShippingCharge,
        promoCodeId,
        items: {
          create: normalizedItems,
        },
      },
      include: { user: true, address: true, items: { include: { product: true } }, promoCode: true },
    });

    // Send SMS Notification
    try {
      const siteSettingsRaw = await prisma.siteSettings.findUnique({ where: { key: 'site_customization' } });
      if (siteSettingsRaw) {
        const settings = JSON.parse(siteSettingsRaw.value);
        if (settings.smsSettings?.enabled) {
          const smsService = new SmsService(settings.smsSettings);
          const phone = customer?.phone || order.user?.phone;
          if (phone) {
             const message = `Namaste! Your order #${order.id.slice(-6)} of NPR ${order.total} has been placed successfully. Thank you for shopping with Almari.`;
             await smsService.sendSms(phone, message);
          }
        }
      }
    } catch (smsErr) {
      console.error('Failed to send order creation SMS:', smsErr.message);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { user: true, address: true, items: { include: { product: true } } },
    });

    // Send SMS Notification for status update
    try {
      const siteSettingsRaw = await prisma.siteSettings.findUnique({ where: { key: 'site_customization' } });
      if (siteSettingsRaw) {
        const settings = JSON.parse(siteSettingsRaw.value);
        if (settings.smsSettings?.enabled) {
          const smsService = new SmsService(settings.smsSettings);
          const phone = order.user?.phone;
          if (phone) {
             const message = `Namaste! Your order #${order.id.slice(-6)} status has been updated to: ${status}. Track your order on Almari.`;
             await smsService.sendSms(phone, message);
          }
        }
      }
    } catch (smsErr) {
      console.error('Failed to send order status update SMS:', smsErr.message);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getOrders, getOrder, getUserOrders, createOrder, updateOrderStatus };
