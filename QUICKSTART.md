# Quick Start Guide - Digital Warranty Vault

## Frontend (Already Running)

The frontend should now be running. If not, follow these steps:

```bash
cd frontend
npm install  # if not already done
npm run dev
```

Frontend will be available at: **http://localhost:5173** or **http://localhost:5174**

## Backend Setup (Required)

The Django backend needs to be set up manually. Follow these steps:

### Step 1: Install Python Dependencies

You need to install Django and other dependencies. Choose one method:

**Option A: Using pip directly**
```bash
cd backend
pip install Django==5.0
pip install djangorestframework==3.14.0
pip install djangorestframework-simplejwt==5.3.1
pip install django-cors-headers==4.3.1
pip install Pillow==10.1.0
pip install python-decouple==3.8
```

**Option B: Using requirements.txt (if pip works)**
```bash
cd backend
pip install -r requirements.txt
```

**Option C: Create a virtual environment (Recommended)**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Run Database Migrations

```bash
cd backend
py manage.py makemigrations
py manage.py migrate
```

### Step 3: Create Admin User (Optional)

```bash
py manage.py createsuperuser
```

### Step 4: Start Django Server

```bash
py manage.py runserver
```

Backend API will be available at: **http://localhost:8000**

## Verify Both Are Running

Once both servers are running:
- **Frontend**: http://localhost:5173 or http://localhost:5174
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

## Troubleshooting

### Python/pip issues
If you get "No module named pip" or similar errors:
1. Reinstall Python from python.org
2. Make sure to check "Add Python to PATH" during installation
3. Or use `py -m pip` instead of just `pip`

### Django not found
Make sure you've installed the dependencies in Step 1 above.

### Port already in use
If port 5173/5174 is in use, Vite will automatically try the next available port.
If port 8000 is in use, use: `py manage.py runserver 8001`

## Next Steps

After both servers are running:
1. The frontend currently uses mock data
2. To integrate with the real backend, you'll need to update the frontend API calls
3. See `backend/README.md` for complete API documentation
