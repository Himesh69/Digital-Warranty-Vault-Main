# Railway Deployment Guide - Digital Warranty Vault

Complete step-by-step guide to deploy your backend and database to Railway.

---

## Prerequisites

✅ **You already have:**
- Railway-ready configuration files (`Procfile`, `nixpacks.toml`)
- Production dependencies in `requirements.txt`
- PostgreSQL-compatible settings
- Static file handling with WhiteNoise

**What you need:**
1. Railway account (free tier available)
2. GitHub repository with your code
3. OCR.space API key (for production OCR)

---

## Part 1: Prepare Your Code

### Step 1: Create `.env.example` for Railway

Your `.env.example` should document all required environment variables:

```bash
# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=.railway.app

# Database (Railway will auto-configure this)
DATABASE_URL=postgresql://user:password@host:port/dbname

# Email Configuration
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# OCR Configuration (Production - Cloud OCR)
USE_CLOUD_OCR=True
OCR_API_KEY=your-ocr-space-api-key

# CORS (Update with your frontend URL after deployment)
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
```

### Step 2: Push Code to GitHub

```bash
# If not already initialized
cd c:\Users\lenovo\Downloads\Digital-Warranty-Vault-main
git init
git add .
git commit -m "Prepare for Railway deployment"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/Digital-Warranty-Vault.git
git branch -M main
git push -u origin main
```

---

## Part 2: Deploy to Railway

### Step 1: Create Railway Account

1. Go to: **https://railway.app/**
2. Click **"Start a New Project"**
3. Sign up with GitHub (recommended for easy deployment)

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub
4. Select your **Digital-Warranty-Vault** repository

### Step 3: Add PostgreSQL Database

1. In your Railway project dashboard
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically:
   - Create a PostgreSQL database
   - Generate a `DATABASE_URL` environment variable
   - Link it to your backend service

### Step 4: Configure Backend Service

1. Click on your **backend service** (the one from GitHub)
2. Go to **"Settings"** tab
3. Under **"Root Directory"**, set to: `backend`
4. Under **"Start Command"**, verify it shows: `gunicorn warranty_vault.wsgi:application --bind 0.0.0.0:$PORT`

### Step 5: Set Environment Variables

Click on **"Variables"** tab and add these:

#### Required Variables:

```
SECRET_KEY=<generate-a-strong-random-key>
DEBUG=False
ALLOWED_HOSTS=.railway.app
USE_CLOUD_OCR=True
OCR_API_KEY=<your-ocr-space-api-key>
EMAIL_HOST_USER=warrentyvault@gmail.com
EMAIL_HOST_PASSWORD=<your-gmail-app-password>
```

#### Generate SECRET_KEY:
```python
# Run this in Python to generate a secure key:
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### Optional Variables (for CORS - add after frontend deployment):
```
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,https://your-frontend-url.netlify.app
```

---

## Part 3: Deploy and Migrate

### Step 1: Trigger Deployment

1. Railway will automatically deploy when you push to GitHub
2. Or click **"Deploy"** button in Railway dashboard
3. Watch the build logs in **"Deployments"** tab

### Step 2: Run Database Migrations

Once deployed, you need to run migrations:

1. Go to your backend service in Railway
2. Click on **"Settings"** → **"Service Settings"**
3. Scroll to **"Custom Start Command"** (temporarily)
4. Or use Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run python manage.py migrate

# Create superuser
railway run python manage.py createsuperuser
```

**OR** add a one-time deployment command:

1. In Railway dashboard, go to **"Settings"**
2. Add **"Deploy Command"**: `python manage.py migrate`
3. This runs automatically on each deployment

### Step 3: Collect Static Files

Railway's `nixpacks.toml` already handles this in the build phase:
```toml
[phases.build]
cmds = ["python manage.py collectstatic --no-input"]
```

---

## Part 4: Get Your Backend URL

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Railway will give you a URL like: `https://your-app-name.up.railway.app`
4. **Save this URL** - you'll need it for frontend configuration

---

## Part 5: Test Your Deployment

### Test API Endpoints:

```bash
# Test root endpoint
curl https://your-app-name.up.railway.app/api/

# Test user registration
curl -X POST https://your-app-name.up.railway.app/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","first_name":"Test","last_name":"User"}'

# Test login
curl -X POST https://your-app-name.up.railway.app/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

### Access Django Admin:

1. Go to: `https://your-app-name.up.railway.app/admin/`
2. Login with your superuser credentials
3. Verify database is working

---

## Part 6: Set Up Scheduled Tasks (Cron Jobs)

Railway doesn't have built-in cron jobs on free tier. You have two options:

### Option 1: External Cron Service (Recommended)

Use **cron-job.org** (free):

1. Go to: **https://cron-job.org/**
2. Create account
3. Add new cron job:
   - **Title**: Check Warranty Expiry
   - **URL**: `https://your-app-name.up.railway.app/api/cron/check-expiry/`
   - **Schedule**: Daily at 9:00 AM
   - **Method**: GET

**Note**: You'll need to create a cron endpoint in your Django app (see below).

### Option 2: Create Cron Endpoint

Add this to your `warranties/views.py`:

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.management import call_command

@api_view(['GET'])
@permission_classes([AllowAny])  # Or add API key authentication
def check_expiry_cron(request):
    """Endpoint for cron job to check warranty expiry."""
    try:
        call_command('check_warranty_expiry')
        return Response({'status': 'success', 'message': 'Expiry check completed'})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=500)
```

Add to `warranties/urls.py`:
```python
path('cron/check-expiry/', views.check_expiry_cron, name='check-expiry-cron'),
```

---

## Part 7: Monitor Your Deployment

### View Logs:
1. Go to Railway dashboard
2. Click on your service
3. Go to **"Deployments"** tab
4. Click on latest deployment
5. View real-time logs

### Monitor Database:
1. Click on PostgreSQL service
2. Go to **"Data"** tab
3. View tables and data
4. Or use **"Connect"** to get connection string for database tools

---

## Part 8: Update Frontend Configuration

After backend is deployed, update your frontend `.env`:

```bash
# frontend/.env.production
VITE_API_URL=https://your-app-name.up.railway.app/api
```

---

## Troubleshooting

### Issue: "Application Error" or 500 Error

**Check:**
1. View deployment logs in Railway
2. Ensure all environment variables are set
3. Verify `DATABASE_URL` is configured
4. Check `ALLOWED_HOSTS` includes `.railway.app`

### Issue: Static Files Not Loading

**Solution:**
- WhiteNoise is configured in `settings.py`
- Ensure `collectstatic` runs in build phase (check `nixpacks.toml`)

### Issue: Database Connection Error

**Solution:**
- Railway auto-configures `DATABASE_URL`
- Verify PostgreSQL service is running
- Check database connection in logs

### Issue: CORS Errors

**Solution:**
- Add frontend URL to `CORS_ALLOWED_ORIGINS` environment variable
- Format: `https://your-frontend.vercel.app` (no trailing slash)

---

## Cost Estimate

**Railway Free Tier:**
- $5 free credit per month
- Enough for small projects
- PostgreSQL database included
- Automatic SSL certificates

**Paid Plan** (if needed):
- $5/month for additional resources
- More execution time
- Priority support

---

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Set up PostgreSQL database
3. ✅ Configure environment variables
4. ✅ Run migrations and create superuser
5. ⏭️ Deploy frontend (Vercel/Netlify)
6. ⏭️ Configure CORS with frontend URL
7. ⏭️ Set up cron jobs for notifications
8. ⏭️ Test end-to-end functionality

---

## Quick Reference

**Railway Dashboard**: https://railway.app/dashboard
**Railway Docs**: https://docs.railway.app/
**Your Backend URL**: `https://your-app-name.up.railway.app`
**Database**: PostgreSQL (auto-configured)
**OCR**: OCR.space cloud API (get key from https://ocr.space/ocrapi)

---

**🎉 Your backend will be live and accessible worldwide once deployed!**
