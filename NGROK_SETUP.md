# Ngrok Setup Guide for Digital Warranty Vault

## Current Status

✅ **Frontend:** Running on `http://localhost:5174`  
⚠️ **Backend:** PostgreSQL database needs to be started

---

## Step 1: Start PostgreSQL Database

You need to start your PostgreSQL service first.

### Option A: Using Windows Services
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find "postgresql-x64-xx" in the list
4. Right-click → Start

### Option B: Using Command Line
```bash
# Start PostgreSQL service
net start postgresql-x64-16
```

---

## Step 2: Start Backend Server

Once PostgreSQL is running, the backend should start automatically (it's already attempting to run).

If you need to restart it manually:
```bash
cd backend
venv\Scripts\activate
py manage.py runserver
```

This will run on `http://localhost:8000`

---

## Step 3: Share with Ngrok

### Use Frontend Port (Recommended)

```bash
ngrok http 5174
```

You'll get output like:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:5174
```

**Share this URL:** `https://abc123.ngrok.io`

---

## Important Notes

### ✅ CORS Already Configured
I've updated your Django settings to allow all origins:
- `CORS_ALLOW_ALL_ORIGINS = True`
- `ALLOWED_HOSTS = ['*']`

This means your ngrok URL will work without any additional configuration!

### 🔒 Security Warning
These settings are **only for development/testing**. Before deploying to production:
1. Set `CORS_ALLOW_ALL_ORIGINS = False`
2. Add specific domains to `CORS_ALLOWED_ORIGINS`
3. Set specific hosts in `ALLOWED_HOSTS`

---

## Alternative: Share Both Ports

If you want to share both frontend and backend separately:

### Terminal 1 - Frontend Ngrok:
```bash
ngrok http 5174
```

### Terminal 2 - Backend Ngrok:
```bash
ngrok http 8000
```

Then update your frontend API configuration to use the backend ngrok URL.

---

## Troubleshooting

### Backend won't start?
- Make sure PostgreSQL is running
- Check database credentials in `backend/warranty_vault/settings.py`
- Database name: `warranty_vault`
- User: `warranty_user`
- Password: `1234`

### Ngrok connection issues?
- Make sure both servers are running locally first
- Test `http://localhost:5174` in your browser
- Test `http://localhost:8000/api/` in your browser

---

## Quick Start Commands

```bash
# Terminal 1: Backend (after PostgreSQL is running)
cd backend
venv\Scripts\activate
py manage.py runserver

# Terminal 2: Frontend (already running on port 5174)
# No action needed - already started!

# Terminal 3: Ngrok
ngrok http 5174
```

---

## What to Share

Share the **ngrok HTTPS URL** with others:
- Example: `https://abc123-def456.ngrok.io`
- They can access your full application through this URL
- All features will work (login, register, warranties, etc.)

---

## Files Modified

- ✅ [backend/warranty_vault/settings.py](file:///c:/Users/lenovo/Downloads/Digital-Warranty-Vault-main/backend/warranty_vault/settings.py)
  - Set `CORS_ALLOW_ALL_ORIGINS = True`
  - Set `ALLOWED_HOSTS = ['*']`
