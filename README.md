# Store Rating App

A Full Stack Web Application that allows users to register, submit ratings for stores, and manage operations through role-based access control.

## Project Overview

The Store Rating App enables users to rate stores (1–5 stars), explore stores by name or address, and interact with the platform based on their roles. The platform offers:

- Clean architecture with modular components
- Secure authentication and password validation
- Responsive UI/UX for seamless interaction
- Robust data handling with efficient filtering and sorting

Roles include System Administrator, Normal User, and Store Owner, each with tailored permissions.

## Tech Stack

- **Backend:** Express.js
- **Database:** MySQL
- **Frontend:** React.js

## User Roles & Permissions

### Demo Credentials:

#### Local administrator
- **Email:** appadmin@gmail.com
- **Password:** Set locally in `backend/.env.local` as `ADMIN_PASSWORD`.

**Capabilities:**
- Create and manage stores and users (normal, admin, and store owner)
- View dashboards showing total users, stores, and ratings
- Filter, search, and manage users and stores
- Access detailed user and store information

#### Normal User and Store Owner
- Normal users create an account through the sign-up page.
- Administrators can add store owner accounts and assign stores.

## Key Features

- Role-based authentication and authorization
- Store and user management with sorting and filtering
- Ratings submission and real-time updates
- Secure password handling with robust validation
- Responsive and intuitive UI/UX design
- Clean database schema and modular architecture

## Form Validation Rules

- **Name:** 20–60 characters
- **Address:** Up to 400 characters
- **Password:** 8–16 characters, must include at least one uppercase letter and one special character
- **Email:** Must follow standard format

## Additional Notes

- Tables support sorting (ascending/descending) by fields like name, email, and address
- Clean and modular code structure
- Database design follows normalization principles
- Secure handling of passwords and user sessions

## Setup Instructions

### 1️⃣ Configure Environment Variables

Create a `.env.local` file in the backend folder with your local MySQL credentials:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=rating_system
DB_PORT=3306
JWT_SECRET=your_local_jwt_secret
ADMIN_EMAIL=appadmin@gmail.com
ADMIN_PASSWORD=choose_a_local_password
```

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/nithyachantimi/Store-Rating-App-.git
```

### 3️⃣ Install and Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Access the frontend at: [http://localhost:5173](http://localhost:5173)

### 4️⃣ Install and Run the Backend

```bash
cd backend
npm install
npm start
```

Access the backend API at: [http://localhost:5000](http://localhost:5000)

## API Endpoints

### **Authentication**

* `POST /auth/signup` - User registration
* `POST /auth/login` - User login
* `POST /auth/logout` - User logout
* `PUT /auth/update-password` - Update user password
* `GET /auth/check` - Check authentication status

### **Admin** (Admin only)

* `POST /admin/stores` - Create new store
* `POST /admin/users` - Create new user
* `GET /admin/dashboard` - Get admin dashboard data

### **Store Owner** (Store Owner only)

* `GET /owner/dashboard` - Get store ratings and user data

### **Users** (User only)

* `GET /user/stores` - Get all stores with filtering and search
* `POST /user/stores/:id/rating` - Submit rating for a store
* `PUT /user/stores/:id/rating` - Update existing rating for a store
