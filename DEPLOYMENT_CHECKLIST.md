# 📝 Deployment Checklist

Follow these steps in order to deploy your Digital Warranty Vault application.

---

## ✅ Phase 1: Pre-Deployment Preparation

### 1. Verify GitHub Repository
- [ ] All code is committed to GitHub
- [ ] Repository is public or accessible to deployment platforms
- [ ] `.gitignore` is properly configured (excludes `.env`, `venv`, `node_modules`, etc.)

### 2. Create Platform Accounts
- [ ] Create account at [Render.com](https://render.com)
- [ ] Create account at [Vercel.com](https://vercel.com)
- [ ] Connect GitHub to both platforms

### 3. Prepare Environment Variables

#### Backend Environment Variables (for Render)
Generate a strong SECRET_KEY:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Prepare these values:
- [ ] `SECRET_KEY` - (generated above)
- [ ] `DEBUG` - Set to `False`
- [ ] `ALLOWED_HOSTS` - Will be set after deployment
- [ ] `CORS_ALLOWED_ORIGINS` - Will be set after deployment
- [ ] `EMAIL_HOST_USER` - Your Gmail address
- [ ] `EMAIL_HOST_PASSWORD` - Gmail App Password (not your regular password)

> **How to get Gmail App Password:**
> 1. Go to Google Account → Security
> 2. Enable 2-Step Verification
> 3. Go to App Passwords
> 4. Generate password for "Mail"
> 5. Copy the 16-character password

---

## ✅ Phase 2: Database Deployment (Render PostgreSQL)

### 1. Create PostgreSQL Database
1. [ ] Go to [Render Dashboard](https://dashboard.render.com/)
2. [ ] Click **"New +"** → **"PostgreSQL"**
3. [ ] Configure:
   - **Name**: `warranty-vault-db`
   - **Database**: `warranty_vault`
   - **Region**: Choose closest to you (e.g., Oregon, Frankfurt, Singapore)
   - **Plan**: **Free**
4. [ ] Click **"Create Database"**
5. [ ] Wait for database to be created (takes ~2 minutes)

### 2. Save Database Credentials
Once created, save these from the database page:
- [ ] **Internal Database URL** (starts with `postgresql://`)
- [ ] **External Database URL** (for local testing if needed)
- [ ] **Username**
- [ ] **Password**

> **Important:** Keep these credentials safe! You'll need the Internal Database URL for the backend.

---

## ✅ Phase 3: Backend Deployment (Render Web Service)

### 1. Deploy Backend Service
1. [ ] Go to [Render Dashboard](https://dashboard.render.com/)
2. [ ] Click **"New +"** → **"Web Service"**
3. [ ] Click **"Connect a repository"** and select your GitHub repo
4. [ ] Configure:
   - **Name**: `warranty-vault-backend`
   - **Region**: **Same as database** (important!)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --no-input`
   - **Start Command**: `gunicorn warranty_vault.wsgi:application`
   - **Plan**: **Free**

### 2. Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"** and add:

```
PYTHON_VERSION=3.11.0
SECRET_KEY=<paste-your-generated-secret-key>
DEBUG=False
DATABASE_URL=<paste-internal-database-url-from-phase-2>
ALLOWED_HOSTS=.onrender.com
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=
EMAIL_HOST_USER=<your-gmail@gmail.com>
EMAIL_HOST_PASSWORD=<your-gmail-app-password>
```

> **Note:** Leave `CORS_ALLOWED_ORIGINS` empty for now. We'll update it after frontend deployment.

3. [ ] Click **"Create Web Service"**
4. [ ] Wait for deployment (takes ~5-10 minutes)
5. [ ] Check logs for any errors

### 3. Run Database Migrations
Once deployed:
1. [ ] Go to your backend service page
2. [ ] Click **"Shell"** tab (top right)
3. [ ] Run these commands one by one:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```
4. [ ] Create admin account when prompted

### 4. Save Backend URL
- [ ] Copy your backend URL (e.g., `https://warranty-vault-backend.onrender.com`)

---

## ✅ Phase 4: Frontend Deployment (Vercel)

### 1. Update Frontend Environment File
Before deploying, update `frontend/.env.production`:
```
VITE_API_URL=https://<your-backend-url>.onrender.com/api
```

Replace `<your-backend-url>` with your actual Render backend URL from Phase 3.

### 2. Commit and Push Changes
```bash
git add frontend/.env.production
git commit -m "Update production API URL"
git push
```

### 3. Deploy to Vercel
1. [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. [ ] Click **"Add New..."** → **"Project"**
3. [ ] Import your GitHub repository
4. [ ] Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### 4. Add Environment Variables
Click **"Environment Variables"** and add:
```
VITE_API_URL=https://<your-backend-url>.onrender.com/api
```

5. [ ] Click **"Deploy"**
6. [ ] Wait for deployment (takes ~2-3 minutes)

### 5. Save Frontend URL
- [ ] Copy your frontend URL (e.g., `https://warranty-vault.vercel.app`)

---

## ✅ Phase 5: Update CORS Settings

Now that both services are deployed, update the backend CORS settings:

### 1. Update Backend Environment Variables
1. [ ] Go to your Render backend service
2. [ ] Click **"Environment"** tab
3. [ ] Update these variables:
   - `ALLOWED_HOSTS`: Add your Render URL (e.g., `warranty-vault-backend.onrender.com`)
   - `CORS_ALLOWED_ORIGINS`: Add your Vercel URL (e.g., `https://warranty-vault.vercel.app`)

Example:
```
ALLOWED_HOSTS=warranty-vault-backend.onrender.com,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://warranty-vault.vercel.app
```

4. [ ] Click **"Save Changes"**
5. [ ] Service will automatically redeploy

---

## ✅ Phase 6: Testing

### 1. Test Backend API
1. [ ] Visit `https://<your-backend-url>.onrender.com/admin`
2. [ ] Login with superuser credentials
3. [ ] Verify admin panel works

### 2. Test Frontend
1. [ ] Visit your Vercel URL
2. [ ] Test user registration
3. [ ] Test login
4. [ ] Test adding a warranty (without OCR)
5. [ ] Test viewing warranties
6. [ ] Test QR code generation and sharing

### 3. Common Issues

**Backend won't start:**
- [ ] Check Render logs for errors
- [ ] Verify all environment variables are set correctly
- [ ] Ensure `DATABASE_URL` is the Internal URL

**Frontend can't connect to backend:**
- [ ] Check browser console for CORS errors
- [ ] Verify `VITE_API_URL` is correct in Vercel
- [ ] Ensure `CORS_ALLOWED_ORIGINS` includes your Vercel URL
- [ ] Wait for backend to wake up (free tier spins down after 15 min)

**Database connection fails:**
- [ ] Verify `DATABASE_URL` is correct
- [ ] Ensure backend and database are in the same region
- [ ] Check if database is still active (90-day limit on free tier)

---

## ✅ Phase 7: Post-Deployment (Optional)

### 1. Set Up Custom Domain (Optional)
- [ ] Add custom domain to Vercel (frontend)
- [ ] Add custom domain to Render (backend)
- [ ] Update CORS settings with new domain

### 2. Set Up File Storage (Recommended)
Since Render has ephemeral storage, set up cloud storage:
- [ ] Create Cloudinary account
- [ ] Configure Django to use Cloudinary
- [ ] Update environment variables

### 3. Monitor Your Application
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Monitor database usage
- [ ] Set calendar reminder for database renewal (90 days)

---

## 🎉 Deployment Complete!

Your application is now live at:
- **Frontend**: `https://<your-app>.vercel.app`
- **Backend**: `https://<your-backend>.onrender.com`
- **Admin Panel**: `https://<your-backend>.onrender.com/admin`

---

## ⚠️ Important Reminders

1. **Free Tier Limitations:**
   - Render PostgreSQL expires after 90 days
   - Render Web Service spins down after 15 minutes of inactivity
   - First request after spin-down takes 50+ seconds

2. **OCR Features:**
   - Tesseract OCR is NOT available on Render free tier
   - OCR features will only work locally
   - Consider disabling OCR upload in production or use a paid platform

3. **File Uploads:**
   - Files uploaded to Render are deleted on restart
   - Set up Cloudinary or S3 for persistent storage

4. **Security:**
   - Never commit `.env` files
   - Rotate `SECRET_KEY` periodically
   - Use strong passwords for database and admin

---

## 📚 Need Help?

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)

---

**Last Updated:** January 2026
