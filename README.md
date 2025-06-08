# POS System

A comprehensive Point-of-Sale (POS) system with a strong emphasis on service culture and efficient project management.

## Features

- **Product Management/Inventory Management**

  - Add, edit, and remove products
  - Track inventory levels
  - Real-time stock monitoring
  - Low stock alerts

- **Transaction Processing**

  - Easy-to-use interface for processing sales
  - Support for multiple payment methods
  - Discount application (role-based)
  - Receipt generation (print and email)

- **User Management with Role-Based Access Control**

  - Cashier: Basic transaction processing
  - Manager: Reports, discounts, and inventory management
  - Administrator: Full system access

- **Customer Feedback System**

  - Post-transaction satisfaction surveys
  - Rating system (1-5 stars)
  - Feedback collection and analysis

- **Statistics and Reports**
  - Sales data visualization
  - Inventory status reports
  - Customer feedback analysis
  - Export capabilities

## Technology Stack

### Frontend

- React with TypeScript
- TailwindCSS for styling
- Chart.js for data visualization
- React Router for navigation
- Axios for API communication

### Backend

- Laravel (PHP)
- MySQL database
- Laravel Sanctum for authentication
- Queue system for email processing

## Installation

### Prerequisites

- PHP >= 8.1
- Node.js >= 16
- MySQL >= 8.0
- Composer
- npm

### Backend Setup

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install PHP dependencies:

   ```bash
   composer install
   ```

3. Copy the environment file:

   ```bash
   cp .env.example .env
   ```

4. Configure your database in `.env`

5. Generate application key:

   ```bash
   php artisan key:generate
   ```

6. Run migrations and seeders:

   ```bash
   php artisan migrate --seed
   ```

7. Start the server:
   ```bash
   php artisan serve
   ```

### Frontend Setup

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Default User Accounts

After running the seeders, the following accounts will be available:

- **Admin**

  - Email: admin@example.com
  - Password: password

- **Manager**

  - Email: manager@example.com
  - Password: password

- **Cashier**
  - Email: cashier@example.com
  - Password: password

## Project Structure

```
.
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── types/        # TypeScript type definitions
│   │   └── pages/        # Page components
│   └── public/           # Static assets
│
└── server/               # Backend Laravel application
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/
    │   │   └── Middleware/
    │   ├── Models/
    │   └── Mail/
    ├── database/
    │   ├── migrations/
    │   └── seeders/
    └── routes/
```

## API Documentation

### Authentication

- POST `/api/login` - User login
- POST `/api/logout` - User logout

### Products

- GET `/api/products` - List all products
- POST `/api/products` - Create a new product
- GET `/api/products/{id}` - Get product details
- PUT `/api/products/{id}` - Update product
- DELETE `/api/products/{id}` - Delete product
- POST `/api/products/{id}/stock` - Update stock level

### Transactions

- GET `/api/transactions` - List transactions
- POST `/api/transactions` - Create new transaction
- GET `/api/transactions/{id}` - Get transaction details
- POST `/api/transactions/{id}/feedback` - Add customer feedback
- POST `/api/transactions/{id}/void` - Void transaction

### Reports

- GET `/api/reports/sales` - Sales reports
- GET `/api/reports/inventory` - Inventory reports
- GET `/api/reports/feedback` - Customer feedback reports

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
"# project_system" 
