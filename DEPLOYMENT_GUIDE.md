# 🚀 Digital Warranty Vault - Deployment Guide

This guide will walk you through deploying your full-stack application on **free platforms**:
- **Backend (Django)**: Render
- **Database (PostgreSQL)**: Render (Free PostgreSQL)
- **Frontend (React)**: Vercel

---

## 📋 Prerequisites

- [x] GitHub repository initialized with your code
- [ ] GitHub account
- [ ] Render account (sign up at [render.com](https://render.com))
- [ ] Vercel account (sign up at [vercel.com](https://vercel.com))

---

## 🗂️ Part 1: Prepare Your Repository

### 1.1 Create Required Configuration Files

You need to create several files for deployment. These files should be in your repository root.

#### **File 1: `render.yaml`** (for Render Blueprint)
Create this file in the root directory to define your backend and database services.

#### **File 2: `build.sh`** (Backend Build Script)
Create this file in the root directory for Render to run during deployment.

#### **File 3: `.env.example`** (Environment Variables Template)
Create this file to document required environment variables.

#### **File 4: Update `requirements.txt`**
Add production dependencies.

#### **File 5: Update Django `settings.py`**
Configure for production deployment.

---

## 🔧 Part 2: Backend Deployment on Render

### 2.1 Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `warranty-vault-db`
   - **Database**: `warranty_vault`
   - **User**: (auto-generated)
   - **Region**: Choose closest to you
   - **Plan**: **Free**
4. Click **"Create Database"**
5. **Save the credentials** (you'll need them):
   - Internal Database URL
   - External Database URL
   - Username
   - Password

> [!IMPORTANT]
> Free PostgreSQL databases on Render expire after 90 days. You'll need to create a new one and migrate data.

### 2.2 Deploy Django Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `warranty-vault-backend`
   - **Region**: Same as database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn warranty_vault.wsgi:application`
   - **Plan**: **Free**

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   PYTHON_VERSION=3.11.0
   SECRET_KEY=<generate-a-strong-secret-key>
   DEBUG=False
   DATABASE_URL=<paste-internal-database-url-from-step-2.1>
   ALLOWED_HOSTS=<your-render-backend-url>.onrender.com
   CORS_ALLOWED_ORIGINS=<your-vercel-frontend-url>
   EMAIL_HOST_USER=<your-gmail>
   EMAIL_HOST_PASSWORD=<your-gmail-app-password>
   ```

6. Click **"Create Web Service"**

> [!WARNING]
> Free tier services on Render spin down after 15 minutes of inactivity. First request after inactivity may take 50+ seconds.

---

## 🎨 Part 3: Frontend Deployment on Vercel

### 3.1 Prepare Frontend for Deployment

1. Update your frontend API base URL to use environment variables
2. Create a `.env.production` file in the `frontend` directory

### 3.2 Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   ```
   VITE_API_URL=https://<your-backend-name>.onrender.com
   ```

6. Click **"Deploy"**

---

## 🔄 Part 4: Update CORS and Allowed Hosts

After both deployments are complete:

1. **Get your Vercel URL** (e.g., `https://warranty-vault.vercel.app`)
2. **Get your Render backend URL** (e.g., `https://warranty-vault-backend.onrender.com`)

3. **Update Render Environment Variables**:
   - Go to your Render backend service
   - Update `ALLOWED_HOSTS` to include your Render URL
   - Update `CORS_ALLOWED_ORIGINS` to include your Vercel URL
   - Click **"Save Changes"** (this will redeploy)

---

## 🧪 Part 5: Post-Deployment Tasks

### 5.1 Run Database Migrations

1. Go to your Render backend service
2. Click **"Shell"** tab
3. Run:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

### 5.2 Test Your Application

1. Visit your Vercel frontend URL
2. Try to register a new account
3. Try to login
4. Test adding a warranty
5. Check if images upload correctly

---

## ⚠️ Important Notes

### Free Tier Limitations

| Platform | Limitation |
|----------|------------|
| **Render PostgreSQL** | Expires after 90 days, 1GB storage |
| **Render Web Service** | Spins down after 15 min inactivity, 750 hours/month |
| **Vercel** | 100GB bandwidth/month, 6000 build minutes/month |

### OCR Features (Tesseract)

> [!CAUTION]
> Tesseract OCR and Poppler are **NOT available** on Render's free tier because you cannot install system packages. You have two options:

**Option 1: Disable OCR for Production**
- Remove OCR-related code from production
- Keep it for local development only

**Option 2: Use a Different Platform**
- Deploy to **Railway** (has a free trial with $5 credit)
- Deploy to **Heroku** with buildpacks (no longer free)
- Use **Docker** on platforms that support it

### File Uploads

- Render's free tier has **ephemeral storage** (files are deleted on restart)
- For persistent file storage, use:
  - **Cloudinary** (free tier: 25GB storage, 25GB bandwidth)
  - **AWS S3** (free tier: 5GB storage for 12 months)
  - **Supabase Storage** (free tier: 1GB storage)

---

## 🔐 Security Checklist

- [ ] Generate a strong `SECRET_KEY` (use `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
- [ ] Set `DEBUG=False` in production
- [ ] Configure specific `ALLOWED_HOSTS`
- [ ] Configure specific `CORS_ALLOWED_ORIGINS` (not `CORS_ALLOW_ALL_ORIGINS`)
- [ ] Use environment variables for all secrets
- [ ] Never commit `.env` files to Git
- [ ] Use Gmail App Passwords (not your actual password)

---

## 🆘 Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify all environment variables are set
- Ensure `build.sh` has correct permissions

### Database connection fails
- Verify `DATABASE_URL` is correct
- Check if database is in the same region as backend
- Ensure database is not expired (90-day limit)

### Frontend can't connect to backend
- Check CORS settings
- Verify `VITE_API_URL` is correct
- Check browser console for errors
- Ensure backend is awake (free tier spins down)

### Images not persisting
- This is expected on Render free tier (ephemeral storage)
- Implement cloud storage (Cloudinary, S3, etc.)

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [Cloudinary Django Integration](https://cloudinary.com/documentation/django_integration)

---

## 🎉 Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure Cloudinary for persistent file storage
3. Set up monitoring and error tracking (e.g., Sentry)
4. Implement automated backups for your database
5. Add SSL certificate (automatic on Render and Vercel)

---

**Need help?** Check the troubleshooting section or review the platform-specific documentation.
