# ⏰ Scheduled Warranty Notifications Deployment Guide

This guide explains how to set up automated warranty checking and email notifications that run daily at 9 AM after deployment.

---

## 🎯 What You Have

You already have a Django management command that checks warranties and sends notifications:

**Command:** `python manage.py check_warranty_expiry`

**What it does:**
- Checks all warranties for expiry dates
- Creates in-app notifications for warranties expiring in: 30, 20, 10, 3, 2, 1 days, or expired
- Sends email notifications to users
- Prevents duplicate notifications

**Location:** `backend/notifications/management/commands/check_warranty_expiry.py`

---

## ❌ The Problem

**Django doesn't have built-in scheduling.** You need an external scheduler to run this command daily at 9 AM.

---

## ✅ Solutions for Different Platforms

### Option 1: Render Cron Jobs (Recommended for Render)

Render offers free cron jobs that can run scheduled tasks.

#### Step 1: Create Cron Job Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Cron Job"**
3. Configure:
   - **Name**: `warranty-checker`
   - **Repository**: Your GitHub repo
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Command**: `python manage.py check_warranty_expiry`
   - **Schedule**: `0 9 * * *` (9 AM UTC daily)
   - **Region**: Same as your backend
   - **Plan**: **Free**

#### Step 2: Add Environment Variables

Add the same environment variables as your backend:
```
SECRET_KEY=<your-secret-key>
DEBUG=False
DATABASE_URL=<from-render-postgresql>
EMAIL_HOST_USER=<your-gmail>
EMAIL_HOST_PASSWORD=<gmail-app-password>
```

#### Step 3: Adjust for Your Timezone

The schedule `0 9 * * *` runs at 9 AM UTC.

**To run at 9 AM IST (UTC+5:30):**
```
30 3 * * *
```
(9 AM IST = 3:30 AM UTC)

**To run at 9 AM EST (UTC-5):**
```
0 14 * * *
```
(9 AM EST = 2 PM UTC)

**Cron Format:**
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

#### Step 4: Test the Cron Job

1. Go to your cron job service on Render
2. Click **"Trigger Run"** to test manually
3. Check logs to verify it works
4. Wait for scheduled run at 9 AM

**Pros:**
- ✅ Free on Render
- ✅ Easy to set up
- ✅ Integrated with your backend
- ✅ Reliable

**Cons:**
- ❌ Minimum interval is 1 hour
- ❌ Tied to Render platform

---

### Option 2: Django-Crontab (Requires Persistent Server)

**Note:** This won't work on Render free tier because services spin down.

Use this only if you have a persistent server (Railway, VPS, etc.)

#### Step 1: Install django-crontab

Add to `requirements.txt`:
```
django-crontab==0.7.1
```

#### Step 2: Update settings.py

```python
INSTALLED_APPS = [
    # ... existing apps ...
    'django_crontab',
]

CRONJOBS = [
    ('0 9 * * *', 'notifications.management.commands.check_warranty_expiry.Command.handle'),
]
```

#### Step 3: Add Crontab

```bash
python manage.py crontab add
```

#### Step 4: Verify

```bash
python manage.py crontab show
```

**Pros:**
- ✅ Built into Django
- ✅ Easy to manage

**Cons:**
- ❌ Doesn't work on Render free tier (services sleep)
- ❌ Requires persistent server

---

### Option 3: Celery + Celery Beat (Production-Grade)

For production applications with high reliability needs.

#### Step 1: Install Dependencies

Add to `requirements.txt`:
```
celery==5.3.4
redis==5.0.1
django-celery-beat==2.5.0
```

#### Step 2: Create Celery Configuration

Create `backend/warranty_vault/celery.py`:

```python
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'warranty_vault.settings')

app = Celery('warranty_vault')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Scheduled tasks
app.conf.beat_schedule = {
    'check-warranties-daily': {
        'task': 'notifications.tasks.check_warranties_task',
        'schedule': crontab(hour=9, minute=0),  # 9 AM daily
    },
}
```

#### Step 3: Create Task

Create `backend/notifications/tasks.py`:

```python
from celery import shared_task
from .services import check_warranties_and_notify

@shared_task
def check_warranties_task():
    """Celery task to check warranties"""
    result = check_warranties_and_notify()
    return result
```

#### Step 4: Update settings.py

```python
# Celery Configuration
CELERY_BROKER_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Asia/Kolkata'  # Your timezone
```

#### Step 5: Deploy

You'll need:
- Redis instance (Render offers free Redis)
- Celery worker process
- Celery beat process

**Pros:**
- ✅ Production-grade
- ✅ Highly reliable
- ✅ Can handle complex scheduling

**Cons:**
- ❌ Complex setup
- ❌ Requires Redis
- ❌ More expensive (multiple services)

---

### Option 4: External Cron Service (EasyCron, cron-job.org)

Use a free external service to trigger your API endpoint.

#### Step 1: Create API Endpoint

Add to `backend/notifications/views.py`:

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings
from .services import check_warranties_and_notify

@api_view(['POST'])
@permission_classes([AllowAny])
def trigger_warranty_check(request):
    """API endpoint to trigger warranty check (for external cron)"""
    
    # Security: Check secret token
    token = request.headers.get('X-Cron-Token')
    if token != settings.CRON_SECRET_TOKEN:
        return Response({'error': 'Unauthorized'}, status=401)
    
    result = check_warranties_and_notify()
    return Response(result)
```

Add to `backend/notifications/urls.py`:

```python
from django.urls import path
from . import views

urlpatterns = [
    # ... existing urls ...
    path('trigger-check/', views.trigger_warranty_check, name='trigger-warranty-check'),
]
```

Add to `settings.py`:

```python
CRON_SECRET_TOKEN = config('CRON_SECRET_TOKEN', default='change-this-secret-token')
```

#### Step 2: Set Up External Cron

**Using cron-job.org (Free):**

1. Sign up at [cron-job.org](https://cron-job.org)
2. Create new cron job:
   - **URL**: `https://your-backend.onrender.com/api/notifications/trigger-check/`
   - **Schedule**: Daily at 9:00 AM
   - **Method**: POST
   - **Headers**: 
     - `X-Cron-Token: your-secret-token`
3. Save and enable

**Using EasyCron (Free):**

1. Sign up at [easycron.com](https://www.easycron.com)
2. Create new cron job with same settings

**Pros:**
- ✅ Works with any platform
- ✅ Free options available
- ✅ Simple setup
- ✅ Reliable

**Cons:**
- ❌ Depends on external service
- ❌ Requires API endpoint
- ❌ Security considerations

---

### Option 5: GitHub Actions (Free)

Use GitHub Actions to trigger your API endpoint.

#### Step 1: Create API Endpoint
(Same as Option 4 above)

#### Step 2: Create GitHub Action

Create `.github/workflows/check-warranties.yml`:

```yaml
name: Check Warranties Daily

on:
  schedule:
    # Runs at 9:00 AM IST (3:30 AM UTC) every day
    - cron: '30 3 * * *'
  workflow_dispatch:  # Allows manual trigger

jobs:
  check-warranties:
    runs-on: ubuntu-latest
    
    steps:
      - name: Trigger Warranty Check
        run: |
          curl -X POST \
            -H "X-Cron-Token: ${{ secrets.CRON_SECRET_TOKEN }}" \
            https://your-backend.onrender.com/api/notifications/trigger-check/
```

#### Step 3: Add Secret to GitHub

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add new secret:
   - Name: `CRON_SECRET_TOKEN`
   - Value: Your secret token

#### Step 4: Test

1. Go to Actions tab
2. Select "Check Warranties Daily"
3. Click "Run workflow" to test manually

**Pros:**
- ✅ Free
- ✅ Integrated with GitHub
- ✅ Easy to manage
- ✅ No external dependencies

**Cons:**
- ❌ Requires public repository (or GitHub Pro)
- ❌ Minimum interval is 5 minutes
- ❌ May have slight delays

---

## 📊 Comparison Table

| Solution | Cost | Reliability | Complexity | Best For |
|----------|------|-------------|------------|----------|
| **Render Cron Jobs** | Free | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ Easy | Render users |
| **Django-Crontab** | Free | ⭐⭐⭐ | ⭐⭐⭐⭐ Easy | Persistent servers |
| **Celery + Beat** | Paid | ⭐⭐⭐⭐⭐ | ⭐⭐ Complex | Production apps |
| **External Cron** | Free | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ Easy | Any platform |
| **GitHub Actions** | Free | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ Easy | GitHub users |

---

## 🎯 Recommended Solution

### For Render Deployment:
**Use Render Cron Jobs (Option 1)**
- Native integration
- Free
- Most reliable for Render

### For Railway/Fly.io:
**Use Django-Crontab (Option 2)**
- Simple
- Built into Django
- Works on persistent servers

### For Any Platform:
**Use GitHub Actions (Option 5)**
- Free
- Easy to set up
- Works anywhere

---

## 🛠️ Step-by-Step: Setting Up Render Cron Job

### 1. Update render.yaml

Add cron job to your `render.yaml`:

```yaml
services:
  # ... existing database and web service ...

  # Cron Job for Warranty Checking
  - type: cron
    name: warranty-checker
    runtime: python
    schedule: "30 3 * * *"  # 9 AM IST = 3:30 AM UTC
    buildCommand: "pip install -r requirements.txt"
    startCommand: "python manage.py check_warranty_expiry"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: SECRET_KEY
        fromService:
          name: warranty-vault-backend
          type: web
          envVarKey: SECRET_KEY
      - key: DATABASE_URL
        fromDatabase:
          name: warranty-vault-db
          property: connectionString
      - key: EMAIL_HOST_USER
        fromService:
          name: warranty-vault-backend
          type: web
          envVarKey: EMAIL_HOST_USER
      - key: EMAIL_HOST_PASSWORD
        fromService:
          name: warranty-vault-backend
          type: web
          envVarKey: EMAIL_HOST_PASSWORD
```

### 2. Commit and Push

```bash
git add render.yaml
git commit -m "Add cron job for warranty checking"
git push
```

### 3. Deploy

Render will automatically create the cron job service.

### 4. Test

1. Go to Render Dashboard
2. Find "warranty-checker" service
3. Click "Trigger Run"
4. Check logs

### 5. Verify Email

Check if emails are being sent to users with expiring warranties.

---

## 🧪 Testing the Scheduled Task

### Manual Test

Run the command manually:

```bash
# On Render Shell
python manage.py check_warranty_expiry

# Locally
cd backend
python manage.py check_warranty_expiry
```

### Create Test Warranties

Create warranties with expiry dates:
- 30 days from today
- 10 days from today
- 3 days from today
- Tomorrow

Run the command and verify:
- Notifications are created
- Emails are sent
- No duplicates

### Check Logs

Monitor logs for:
- Successful execution
- Number of notifications created
- Number of emails sent
- Any errors

---

## 🔧 Timezone Configuration

### Update Django Timezone

In `settings.py`:

```python
# For India (IST)
TIME_ZONE = 'Asia/Kolkata'
USE_TZ = True

# For US Eastern
TIME_ZONE = 'America/New_York'
USE_TZ = True

# For UK
TIME_ZONE = 'Europe/London'
USE_TZ = True
```

### Calculate UTC Offset

| Your Time | Timezone | UTC Offset | Cron Time (for 9 AM) |
|-----------|----------|------------|----------------------|
| 9 AM IST | Asia/Kolkata | UTC+5:30 | `30 3 * * *` |
| 9 AM EST | America/New_York | UTC-5 | `0 14 * * *` |
| 9 AM GMT | Europe/London | UTC+0 | `0 9 * * *` |
| 9 AM PST | America/Los_Angeles | UTC-8 | `0 17 * * *` |

---

## 🆘 Troubleshooting

### Cron Job Not Running

**Check:**
- Cron schedule syntax is correct
- Service is enabled
- Environment variables are set
- Database connection works

**Solution:**
- Trigger manually to test
- Check service logs
- Verify timezone calculation

### Emails Not Sending

**Check:**
- EMAIL_HOST_USER is set
- EMAIL_HOST_PASSWORD is correct (use App Password)
- Gmail allows less secure apps (if needed)
- Email backend is configured

**Solution:**
- Test email manually: `python manage.py shell`
  ```python
  from django.core.mail import send_mail
  send_mail('Test', 'Test message', 'from@example.com', ['to@example.com'])
  ```

### Duplicate Notifications

**Check:**
- Notification checking logic
- Database queries

**Solution:**
- The code already prevents duplicates
- Clear old notifications if needed

---

## 📚 Additional Resources

- [Render Cron Jobs Documentation](https://render.com/docs/cronjobs)
- [Crontab Guru](https://crontab.guru/) - Cron schedule helper
- [Django Management Commands](https://docs.djangoproject.com/en/5.0/howto/custom-management-commands/)
- [Celery Documentation](https://docs.celeryproject.org/)

---

## ✅ Success Checklist

After setup, verify:

- [ ] Cron job service is created
- [ ] Schedule is correct for your timezone
- [ ] Environment variables are set
- [ ] Manual trigger works
- [ ] Notifications are created
- [ ] Emails are sent
- [ ] No duplicate notifications
- [ ] Logs show successful execution

---

**Your warranty checking will now run automatically every day at 9 AM!** 🎉
