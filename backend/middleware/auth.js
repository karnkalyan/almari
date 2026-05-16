const { verifyToken } = require('../utils/jwt');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  req.userId = decoded.userId;
  next();
};

const authorizeAdmin = async (req, res, next) => {
  const prisma = require('../prismaClient');
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  const staffRoles = ['admin', 'super_admin', 'editor', 'sell_staff', 'crm_staff'];
  if (!user || !staffRoles.includes(user.role)) {
    return res.status(403).json({ message: 'Staff access required' });
  }
  req.user = user;
  next();
};

const authorizeSuperAdmin = async (req, res, next) => {
  const prisma = require('../prismaClient');
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Super Admin access required' });
  }
  req.user = user;
  next();
};

module.exports = { authenticate, authorizeAdmin, authorizeSuperAdmin };
