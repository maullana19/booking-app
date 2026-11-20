# Booking App API

A REST API for a concert ticket booking application, built with **NestJS**, **TypeORM**, and **MySQL**. It supports the complete flow from event catalog management, ticket ordering, manual payment confirmation, to e-ticket generation with QR codes.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Business Flow](#-business-flow)
- [API Documentation](#-api-documentation)
- [Roles & Permissions](#-roles--permissions)
- [Development Notes](#-development-notes)
- [License](#-license)

---

## Features

### Authentication & Authorization
- Register & login with JWT
- Role-based access control (`admin`, `cust`, `guest`)
- Guards to protect endpoints based on roles

### Catalog
- Manage categories, venues, products, and event details
- Ticket variants (VIP, CAT 1, Festival) with separate price & stock
- Product poster upload to ImageKit

### Transactions
- Order creation with **database transaction** and **pessimistic lock** (prevents overselling)
- Automatic stock decrement when an order is created
- Manual payment (admin confirmation)
- Order cancellation with stock restoration
- **Cron job** automatically expires unpaid orders and restores stock

### E-Ticket
- Generate tickets with QR codes after successful payment
- One ticket per quantity (each ticket has a unique QR)
- Ticket validation on venue scan (admin)

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [NestJS](https://nestjs.com/) |
| ORM | [TypeORM](https://typeorm.io/) |
| Database | MySQL |
| Authentication | JWT + Passport |
| Validation | class-validator, class-transformer |
| API Documentation | Swagger (OpenAPI) |
| Image Upload | [ImageKit](https://imagekit.io/) |
| QR Code | qrcode |
| Scheduler | @nestjs/schedule |

---

## Prerequisites

- **Node.js** v18+
- **npm** v9+
- **MySQL** v8+
- **ImageKit** account (free tier is sufficient)

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/username/booking-app.git
   cd booking-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create the MySQL database:**

   ```sql
   CREATE DATABASE booking_db;
   ```

4. **Copy the environment file:**

   ```bash
   cp .env.example .env
   ```

5. **Fill in `.env`** (see [Environment Configuration](#-environment-configuration)).

---

## Environment Configuration

Create a `.env` file at the project root:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=booking_db

JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=24h

IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxxxxx
```

> **Never commit the `.env` file to Git.** Use `.env.example` as a template.

### How to get `IMAGEKIT_PRIVATE_KEY`

1. Sign up at [imagekit.io](https://imagekit.io/)
2. Go to **Developer Options → API Keys**
3. Copy the **Private Key**

---

## Running the Application

```bash
# Development (hot reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

The application runs at `http://localhost:3000`.

---

## Project Structure

```
src/
├── common/                     # Cross-module code
│   ├── imagekit/               # ImageKit provider & service
│   ├── decorators/             # Custom decorators (@Roles, etc.)
│   └── guards/                 # JwtAuthGuard, RolesGuard
│
├── modules/
│   ├── auth/                   # Login, register, JWT strategy
│   ├── users/                  # User management
│   ├── categories/             # Product categories
│   ├── venues/                 # Event locations
│   ├── products/               # Products (tickets/merchandise)
│   ├── product-events/         # Event details (venue, schedule)
│   ├── product-variants/       # Ticket variants + stock
│   ├── orders/                 # Orders + expiry cron
│   ├── payments/               # Payments
│   └── tickets/                # E-tickets + QR codes
│
├── app.module.ts               # Root module
└── main.ts                     # Entry point
```

---

## Business Flow

### 1. Admin sets up the catalog

```
Category → Venue → Product → ProductEvent → ProductVariant
```

### 2. User books a ticket

```
1. POST /orders              → order PENDING, stock decremented
2. POST /payments            → payment PENDING
3. Admin: PATCH /payments/:id/confirm
   → payment SUCCESS, order PAID, tickets auto-generated
4. GET /tickets/my           → user views e-ticket + QR
```

### 3. Unpaid order

```
Cron job (every minute):
  → orders PENDING with expiresAt < now → EXPIRED
  → stock restored
  → PENDING payment → EXPIRED
```

### 4. Cancellation

```
PATCH /orders/:id/cancel → order CANCELLED, stock restored
```

---

## API Documentation

Swagger is available at:

```
http://localhost:3000/api
```

### Endpoint Summary

| Module | Endpoint | Access |
|---|---|---|
| **Auth** | `POST /auth/login`, `POST /auth/register` | Public |
| **Categories** | `GET /categories`, `GET /categories/:id` | Public |
| | `POST/PATCH/DELETE /categories` | Admin |
| **Venues** | `GET /venues`, `GET /venues/:id` | Public |
| | `POST/PATCH/DELETE /venues` | Admin |
| **Products** | `GET /products`, `GET /products/:id` | Public |
| | `POST/PATCH/DELETE /products` | Admin |
| | `POST /products/upload-poster` | Admin |
| **Product Events** | `GET /product-events/product/:productId` | Public |
| | `POST/PATCH/DELETE /product-events` | Admin |
| **Product Variants** | `GET /products/:id/variants` | Public |
| | `POST/PATCH/DELETE /variants` | Admin |
| **Orders** | `POST /orders` | User |
| | `GET /orders`, `GET /orders/:id` | User (own) |
| | `PATCH /orders/:id/cancel` | User (own) |
| **Payments** | `POST /payments` | User |
| | `GET /payments`, `GET /payments/:id` | User (own) |
| | `PATCH /payments/:id/confirm`, `/fail` | Admin |
| **Tickets** | `GET /tickets/my`, `GET /tickets/:id` | User (own) |
| | `POST /tickets/validate` | Admin |

---

## Roles & Permissions

| Role | Permissions |
|---|---|
| **guest** | (optional) user who has not verified their email |
| **cust** | Browse catalog, create orders, pay, view own tickets |
| **admin** | Full access + manage catalog, confirm payments, validate tickets |

### Creating the first admin account

After registering a regular user, update the role directly in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

Then log in again to get a JWT with the new role.

---

## Development Notes

### Security
- `JWT_SECRET` must be at least 32 characters and **must not** be committed
- `.env` is already in `.gitignore`
- Admin endpoints are protected by `JwtAuthGuard` + `RolesGuard`
- Users can only access their own data

### Stock & Ticket War
- Stock decrement uses a **database transaction** + **pessimistic lock**
- For very high traffic (ticket war), consider a **Redis atomic lock** (not yet implemented)

### Poster Upload
- Posters are stored in **ImageKit**; the database only stores the URL
- Flow: `POST /products/upload-poster` → get URL → save when creating/updating a product

### Cron Job
- Runs every minute (`CronExpression.EVERY_MINUTE`)
- Checks for `PENDING` orders with `expiresAt < now`
- Restores stock and marks `PENDING` payments as `EXPIRED`

### Roadmap
- [ ] Frontend (React/Vue)
- [ ] Payment gateway integration (Midtrans/Xendit)
- [ ] Redis lock for ticket war
- [ ] Rate limiting
- [ ] Email notifications (e-ticket)
- [ ] Refund

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Credits

- [NestJS](https://nestjs.com/) — backend framework
- [TypeORM](https://typeorm.io/) — ORM
- [ImageKit](https://imagekit.io/) — image storage & CDN
- [qrcode](https://www.npmjs.com/package/qrcode) — QR code generator