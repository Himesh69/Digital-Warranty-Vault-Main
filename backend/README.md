# Digital Warranty Vault - Django Backend

Complete REST API backend for the Digital Warranty Vault application.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Migrations

```bash
py manage.py makemigrations
py manage.py migrate
```

### 3. Create Superuser (Optional)

```bash
py manage.py createsuperuser
```

### 4. Run Development Server

```bash
py manage.py runserver
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication

- **POST** `/api/auth/register/` - Register new user
  ```json
  {
    "email": "user@example.com",
    "name": "John Doe",
    "password": "password123",
    "password2": "password123"
  }
  ```

- **POST** `/api/auth/login/` - Login
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **GET** `/api/auth/profile/` - Get user profile (requires auth)
- **PUT** `/api/auth/profile/` - Update user profile (requires auth)

### Warranties

All warranty endpoints require authentication (JWT token in Authorization header).

- **GET** `/api/warranties/` - List all warranties for authenticated user
- **POST** `/api/warranties/` - Create new warranty
  ```json
  {
    "product_name": "MacBook Pro",
    "brand": "Apple",
    "category": "Electronics",
    "purchase_date": "2024-01-15",
    "expiry_date": "2025-01-15",
    "notes": "Optional notes"
  }
  ```

- **GET** `/api/warranties/{id}/` - Get warranty details
- **PUT** `/api/warranties/{id}/` - Update warranty
- **DELETE** `/api/warranties/{id}/` - Delete warranty
- **GET** `/api/warranties/stats/` - Get dashboard statistics

### Public Endpoints

- **GET** `/api/warranty/{id}/` - Public warranty details (for QR code scanning, no auth required)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After login/register, you'll receive:
- `access` token - Use for API requests (expires in 1 day)
- `refresh` token - Use to get new access token (expires in 7 days)

Include the access token in requests:
```
Authorization: Bearer <access_token>
```

## File Uploads

To upload warranty documents, send a multipart/form-data request with the `document` field.

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/` using your superuser credentials.

## Database

The project uses SQLite for development. For production, update `settings.py` to use PostgreSQL or MySQL.

## CORS Configuration

CORS is configured to allow requests from:
- `http://localhost:5173`
- `http://localhost:5174`

Update `CORS_ALLOWED_ORIGINS` in `settings.py` for production.
