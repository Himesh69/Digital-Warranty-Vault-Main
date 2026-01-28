# 🚂 Railway Quick Start Guide

**Quick reference for deploying to Railway with OCR + Notifications**

---

## ✅ What's Already Done

I've prepared your code for Railway deployment:

- ✅ **Aptfile** created - Installs Tesseract OCR and Poppler
- ✅ **nixpacks.toml** created - Railway build configuration
- ✅ **Procfile** created - Web server command
- ✅ **settings.py** updated - Railway-specific settings
- ✅ **Environment variables** configured - Production-ready

---

## 🚀 Quick Deploy Steps

### 1. Commit Railway Configuration Files

```bash
git add backend/Aptfile backend/nixpacks.toml backend/Procfile
git add backend/warranty_vault/settings.py
git commit -m "Add Railway deployment configuration"
git push origin main
```

### 2. Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. You get **$5 trial credit** (lasts ~1 month)

### 3. Deploy Database

1. Click **"Start a New Project"**
2. Select **"Deploy PostgreSQL"**
3. Wait 30 seconds ✅

### 4. Deploy Backend

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. Railway auto-detects Python
4. Click on the service → **"Settings"**
5. Set **Root Directory**: `backend`
6. Click **"Variables"** tab

### 5. Add Environment Variables

```bash
PYTHON_VERSION=3.11.0
SECRET_KEY=<generate-using-command-below>
DEBUG=False
DATABASE_URL=${{Postgres.DATABASE_URL}}
ALLOWED_HOSTS=.railway.app,localhost,127.0.0.1
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=<your-vercel-url>
EMAIL_HOST_USER=<your-gmail>
EMAIL_HOST_PASSWORD=<gmail-app-password>
TESSERACT_CMD=/usr/bin/tesseract
POPPLER_PATH=/usr/bin
RAILWAY_ENVIRONMENT=production
```

**Generate SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 6. Deploy & Run Migrations

**Install Railway CLI:**
```bash
# Windows PowerShell
iwr https://railway.app/install.ps1 -useb | iex
```

**Run migrations:**
```bash
railway login
railway link  # Select your project
cd backend
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

### 7. Generate Domain

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy your URL (e.g., `https://warranty-vault.up.railway.app`)

### 8. Set Up Cron Job for Notifications

**Option A: Railway Cron (Recommended)**

1. Click **"+ New"** → **"GitHub Repo"** (same repo)
2. Name it `warranty-checker`
3. Set **Root Directory**: `backend`
4. Go to **"Settings"** → **"Cron"**
5. Enable cron
6. Schedule: `30 3 * * *` (9 AM IST)
7. Command: `python manage.py check_warranty_expiry`
8. Add environment variables (same as backend)

**Option B: Django-Crontab**

See full guide in `RAILWAY_DEPLOYMENT_GUIDE.md`

### 9. Deploy Frontend to Vercel

1. Update `frontend/.env.production`:
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```
2. Push to GitHub
3. Deploy to Vercel
4. Update `CORS_ALLOWED_ORIGINS` in Railway with Vercel URL

---

## 🧪 Testing

### Test OCR:
1. Login to your app
2. Add warranty → Upload receipt
3. Click "Scan Receipt"
4. Verify text extraction works ✅

### Test Notifications:
```bash
railway run python manage.py check_warranty_expiry
```
Check your email for notifications ✅

---

## 📊 What You Get

✅ **Full OCR Support** - Tesseract works perfectly  
✅ **Daily Notifications** - Automated at 9 AM IST  
✅ **Email Alerts** - Beautiful HTML emails  
✅ **PostgreSQL Database** - Included  
✅ **Production Ready** - All features working  

---

## 💰 Cost

- **First Month**: Free ($5 trial credit)
- **After Trial**: ~$10-12/month
  - PostgreSQL: ~$5/month
  - Backend: ~$5/month
  - Cron Job: ~$1/month

---

## 🆘 Quick Troubleshooting

**OCR not working?**
```bash
railway run which tesseract
# Should output: /usr/bin/tesseract
```

**Emails not sending?**
- Use Gmail App Password (not regular password)
- Enable 2-Step Verification in Google Account

**Cron not running?**
- Check cron service logs
- Trigger manually to test
- Verify environment variables

---

## 📚 Full Documentation

For detailed instructions, see:
- **[RAILWAY_DEPLOYMENT_GUIDE.md](RAILWAY_DEPLOYMENT_GUIDE.md)** - Complete guide
- **[DEPLOYMENT_FAQ.md](DEPLOYMENT_FAQ.md)** - Common questions

---

## ✅ Checklist

- [ ] Commit Railway config files
- [ ] Create Railway account
- [ ] Deploy PostgreSQL
- [ ] Deploy backend
- [ ] Add environment variables
- [ ] Run migrations
- [ ] Create superuser
- [ ] Generate domain
- [ ] Set up cron job
- [ ] Deploy frontend to Vercel
- [ ] Update CORS settings
- [ ] Test OCR ✅
- [ ] Test notifications ✅

---

**Ready to deploy?** Follow the steps above! 🚀

**Need help?** Check the full Railway deployment guide.
