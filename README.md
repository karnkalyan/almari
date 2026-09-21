# Almari — Premium Online Shopping

A modern, full-stack premium eCommerce platform designed for fashion and luxury apparel. Built with a responsive React frontend, an Express & Prisma backend, real-time messaging, and rich customization settings.

---

## ✨ Features

- **Storefront & Catalog**: Elegant browsing experience with dynamic promotional banners, category filtering, search, and responsive layout.
- **Interactive Product Showcase**: High-quality imagery, size/color variant selection, real-time stock counters, and reviews.
- **Cart & Checkout**: Streamlined shopping bag experience with order summary and voucher/coupon validation.
- **Real-time Live Chat / Communication**: Customer support messaging powered by Socket.io.
- **Comprehensive Admin Panel**:
  - Visual identity & dynamic section customizer
  - Real-time product, order, and inventory management
  - About Us and brand storytelling content editor
  - Live customer messaging and automated chat triggers
  - Profile and store settings configuration

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Rich Text Editor**: Quill
- **Real-time**: Socket.io Client

### Backend
- **Server**: [Node.js](https://nodejs.org/) & [Express 5](https://expressjs.com/)
- **Database ORM**: [Prisma ORM](https://www.prisma.io/)
- **Real-time Engine**: [Socket.io](https://socket.io/)
- **Authentication**: JWT & bcryptjs

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

---

### 1. Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` or `.env.local` file in the root folder if custom API endpoints are needed (defaults to `http://localhost:5000`):
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

---

### 2. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install backend dependencies:**
   ```bash
   npm install
   ```

3. **Configure backend environment variables:**
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   DATABASE_URL="file:./dev.db" # or your preferred database URL
   JWT_SECRET="your_jwt_secret_key"
   ```

4. **Run database migrations and seed data:**
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
├── backend/                  # Express REST API & Prisma schema
│   ├── controllers/          # Route controllers (products, orders, chat, etc.)
│   ├── prisma/               # Prisma schema & migrations
│   ├── routes/               # Express API endpoints
│   ├── app.js                # Server setup and Socket.io initialization
│   └── seed.js               # Initial seed dataset
├── components/               # Reusable UI & layout components
│   └── admin/                # Admin dashboard specific components
├── pages/                    # Main application pages
│   └── admin/                # Admin management pages
├── services/                 # API service handlers
├── types.ts                  # Shared TypeScript interfaces
├── index.html                # App entry point HTML
└── vite.config.ts            # Vite configuration
```

---

## 📄 License

This project is licensed under the MIT License.
