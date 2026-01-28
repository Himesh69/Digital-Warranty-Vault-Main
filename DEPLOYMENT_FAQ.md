# 🚀 Quick Answers to Your Deployment Questions

## Question 1: How to make OCR feature work after deployment?

### ❌ The Problem
Tesseract OCR **won't work** on Render's free tier because you can't install system packages.

### ✅ Solutions (Choose One)

#### **Option A: Use Railway (Recommended - $5/month)**
- Railway supports system packages via buildpacks
- Create `backend/Aptfile` with:
  ```
  tesseract-ocr
  tesseract-ocr-eng
  poppler-utils
  ```
- Deploy to Railway instead of Render
- **OCR will work perfectly**

#### **Option B: Use Cloud OCR API (Free)**
- Use OCR.space API (25,000 requests/month free)
- Replace Tesseract with API calls
- Works on Render free tier
- **Recommended for free deployment**

#### **Option C: Disable OCR in Production (Simplest)**
- Keep OCR for local development only
- Users enter warranty details manually in production
- Mention in README that OCR works locally
- **Best for portfolio/MVP**

### 📖 Full Guide
See **[OCR_DEPLOYMENT_GUIDE.md](OCR_DEPLOYMENT_GUIDE.md)** for detailed instructions on each option.

---

## Question 2: Will the 9 AM warranty check work after deployment?

### ✅ Yes! Here's How:

#### **Recommended: Use Render Cron Jobs (Free)**

I've already added a cron job to your `render.yaml` file that will:
- ✅ Run daily at 9 AM IST (3:30 AM UTC)
- ✅ Check all warranties for expiry
- ✅ Create in-app notifications
- ✅ Send email notifications to users
- ✅ Prevent duplicate notifications

#### **What Happens Automatically:**

When you deploy to Render, it will create 3 services:
1. **PostgreSQL Database** - Stores your data
2. **Web Service** - Your Django backend
3. **Cron Job** - Runs warranty check daily at 9 AM

#### **The Cron Job Will:**
- Check warranties expiring in: 30, 20, 10, 3, 2, 1 days
- Send email notifications to users
- Create in-app notifications
- Run automatically every day

#### **Adjusting the Time:**

The schedule is set for **9 AM IST** (India Standard Time).

To change to your timezone, edit `render.yaml`:

```yaml
# 9 AM IST (UTC+5:30)
schedule: "30 3 * * *"

# 9 AM EST (UTC-5)
schedule: "0 14 * * *"

# 9 AM GMT (UTC+0)
schedule: "0 9 * * *"

# 9 AM PST (UTC-8)
schedule: "0 17 * * *"
```

### 📖 Full Guide
See **[SCHEDULED_TASKS_GUIDE.md](SCHEDULED_TASKS_GUIDE.md)** for:
- Alternative scheduling methods
- Timezone calculations
- Testing instructions
- Troubleshooting

---

## 🎯 What You Need to Do

### For OCR:

**If you want OCR in production:**
1. Choose Option A (Railway) or Option B (Cloud API)
2. Follow the guide in `OCR_DEPLOYMENT_GUIDE.md`

**If you don't need OCR in production:**
1. Do nothing - OCR will work locally
2. Users will enter data manually in production

### For Scheduled Warranty Checking:

**Nothing!** It's already configured in `render.yaml`.

When you deploy to Render:
1. The cron job will be created automatically
2. It will run daily at 9 AM IST
3. Emails will be sent to users with expiring warranties

**To test after deployment:**
1. Go to Render Dashboard
2. Find "warranty-checker" service
3. Click "Trigger Run" to test manually
4. Check logs to verify it works

---

## 📋 Deployment Checklist Update

Add these steps to your deployment process:

### After Backend Deployment:

**For Scheduled Tasks:**
- [ ] Verify "warranty-checker" cron job was created
- [ ] Adjust schedule for your timezone (if needed)
- [ ] Add EMAIL_HOST_USER and EMAIL_HOST_PASSWORD to cron job
- [ ] Test by clicking "Trigger Run"
- [ ] Verify emails are sent

**For OCR (if using Railway):**
- [ ] Create `backend/Aptfile`
- [ ] Deploy to Railway instead of Render
- [ ] Test OCR feature with a receipt

**For OCR (if using Cloud API):**
- [ ] Sign up for OCR.space
- [ ] Get API key
- [ ] Add OCR_SPACE_API_KEY to environment variables
- [ ] Update code to use API (see guide)
- [ ] Test OCR feature

---

## 🔍 Quick Reference

### Email Notifications Will Be Sent For:
- ✅ Warranties expiring in 30 days
- ✅ Warranties expiring in 20 days
- ✅ Warranties expiring in 10 days
- ✅ Warranties expiring in 3 days
- ✅ Warranties expiring in 2 days
- ✅ Warranties expiring in 1 day
- ✅ Warranties that expired today

### Email Contains:
- Product name and brand
- Purchase date
- Expiry date
- Days remaining
- Warranty details
- Beautiful HTML formatting

### Cron Job Runs:
- **When:** Daily at 9 AM (your timezone)
- **What:** `python manage.py check_warranty_expiry`
- **Where:** Render Cron Job service
- **Cost:** Free

---

## 🆘 Troubleshooting

### Emails Not Sending?

**Check:**
1. EMAIL_HOST_USER is set in cron job environment variables
2. EMAIL_HOST_PASSWORD is your Gmail App Password (not regular password)
3. Gmail 2-Step Verification is enabled
4. App Password is generated correctly

**How to get Gmail App Password:**
1. Google Account → Security
2. Enable 2-Step Verification
3. Search "App Passwords"
4. Generate password for "Mail"
5. Copy the 16-character password
6. Use this in EMAIL_HOST_PASSWORD

### Cron Job Not Running?

**Check:**
1. Service is created on Render
2. Schedule syntax is correct
3. Environment variables are set
4. Trigger manually to test

**Test manually:**
1. Render Dashboard → warranty-checker
2. Click "Trigger Run"
3. Check logs

### OCR Not Working?

**On Render Free Tier:**
- OCR won't work (Tesseract not available)
- Use Railway or Cloud API instead

**On Railway:**
- Check if Aptfile exists
- Verify buildpack detected in logs
- Check TESSERACT_CMD path

---

## 📚 Documentation Index

| Guide | Purpose |
|-------|---------|
| **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** | Main deployment steps |
| **[OCR_DEPLOYMENT_GUIDE.md](OCR_DEPLOYMENT_GUIDE.md)** | OCR feature deployment |
| **[SCHEDULED_TASKS_GUIDE.md](SCHEDULED_TASKS_GUIDE.md)** | Automated warranty checking |
| **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** | Platform overview |
| **[DEPLOYMENT_ALTERNATIVES.md](DEPLOYMENT_ALTERNATIVES.md)** | Alternative platforms |

---

## ✅ Summary

### OCR Feature:
- ❌ Won't work on Render free tier
- ✅ Works on Railway ($5/month)
- ✅ Works with Cloud API (free)
- ✅ Works locally always

### Scheduled Warranty Checking:
- ✅ Already configured in `render.yaml`
- ✅ Will run daily at 9 AM IST
- ✅ Sends email notifications automatically
- ✅ Free on Render

### What You Need to Do:
1. **For OCR:** Choose a solution from the guide
2. **For Scheduled Tasks:** Nothing! Already set up
3. **Deploy:** Follow the deployment checklist

---

**Need more details?** Check the full guides linked above! 🚀
