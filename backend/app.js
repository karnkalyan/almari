const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Make io accessible from routes
app.set('io', io);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/promo-codes', require('./routes/promoCodes'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/flash-sales', require('./routes/flashSales'));
app.use('/api/site-settings', require('./routes/siteSettings'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/product-flags', require('./routes/productFlags'));
app.use('/api/conversations', require('./routes/messages'));
app.use('/api/homepage', require('./routes/homepage'));
app.use('/api/advanced-settings', require('./routes/advancedSettings'));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on('typing', (data) => {
    socket.to(`conversation:${data.conversationId}`).emit('user_typing', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
