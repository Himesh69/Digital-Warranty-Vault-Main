# 🔍 OCR Feature Deployment Guide

This guide explains how to make the OCR (Optical Character Recognition) feature work after deployment, since Tesseract is not available on Render's free tier.

---

## ❌ Why OCR Doesn't Work on Render Free Tier

**Problem:** Render's free tier doesn't allow installing system packages like:
- Tesseract OCR
- Poppler (for PDF processing)

**Impact:** Receipt scanning and automatic data extraction won't work in production.

---

## ✅ Solutions (Choose One)

### Option 1: Use Railway (Recommended for OCR)

Railway supports buildpacks that allow installing system packages.

#### Step 1: Create Railway Account
1. Sign up at [railway.app](https://railway.app)
2. Connect your GitHub account
3. You get $5 trial credit (enough for ~1 month)

#### Step 2: Create Buildpack Configuration
Create `Aptfile` in your backend directory:

```bash
# backend/Aptfile
tesseract-ocr
tesseract-ocr-eng
poppler-utils
```

#### Step 3: Deploy to Railway
1. Create new project on Railway
2. Add PostgreSQL service
3. Add backend service:
   - Connect GitHub repository
   - Set root directory to `backend`
   - Railway will auto-detect Django

#### Step 4: Configure Environment Variables
Add these in Railway:
```
SECRET_KEY=<your-secret-key>
DEBUG=False
DATABASE_URL=<from-railway-postgresql>
ALLOWED_HOSTS=<your-railway-domain>
CORS_ALLOWED_ORIGINS=<your-frontend-url>
EMAIL_HOST_USER=<your-gmail>
EMAIL_HOST_PASSWORD=<gmail-app-password>
TESSERACT_CMD=/usr/bin/tesseract
POPPLER_PATH=/usr/bin
```

#### Step 5: Deploy Frontend to Vercel
Same as before, but update `VITE_API_URL` to your Railway backend URL.

**Pros:**
- ✅ OCR works perfectly
- ✅ Easy setup
- ✅ Good documentation

**Cons:**
- ❌ Only $5 trial credit (not free forever)
- ❌ Costs ~$5-10/month after trial

---

### Option 2: Use Fly.io (Free with Docker)

Fly.io supports Docker, allowing you to install any system packages.

#### Step 1: Create Dockerfile
Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --no-input

# Expose port
EXPOSE 8000

# Run gunicorn
CMD ["gunicorn", "warranty_vault.wsgi:application", "--bind", "0.0.0.0:8000"]
```

#### Step 2: Install Fly CLI
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

#### Step 3: Deploy to Fly.io
```bash
# Login
fly auth login

# Launch app
fly launch

# Set environment variables
fly secrets set SECRET_KEY=<your-secret-key>
fly secrets set DEBUG=False
fly secrets set EMAIL_HOST_USER=<your-gmail>
fly secrets set EMAIL_HOST_PASSWORD=<gmail-app-password>

# Deploy
fly deploy
```

**Pros:**
- ✅ Free tier available
- ✅ OCR works perfectly
- ✅ Full control with Docker

**Cons:**
- ❌ Requires Docker knowledge
- ❌ More complex setup
- ❌ Credit card required (even for free tier)

---

### Option 3: Use Cloud OCR API (Keep Render)

Use a cloud OCR service instead of Tesseract.

#### Recommended Services:

**1. Google Cloud Vision API**
- Free tier: 1,000 requests/month
- Very accurate
- Requires Google Cloud account

**2. Microsoft Azure Computer Vision**
- Free tier: 5,000 requests/month
- Good accuracy
- Requires Azure account

**3. OCR.space API**
- Free tier: 25,000 requests/month
- Simple API
- No credit card required

#### Implementation Example (OCR.space):

Update `backend/warranties/ocr_service.py`:

```python
import requests
from django.conf import settings

def extract_text_from_image_cloud(image_file):
    """Extract text using OCR.space API"""
    api_key = settings.OCR_SPACE_API_KEY
    
    url = 'https://api.ocr.space/parse/image'
    
    files = {'file': image_file}
    data = {
        'apikey': api_key,
        'language': 'eng',
        'isOverlayRequired': False,
    }
    
    response = requests.post(url, files=files, data=data)
    result = response.json()
    
    if result.get('IsErroredOnProcessing'):
        raise Exception('OCR processing failed')
    
    text = result['ParsedResults'][0]['ParsedText']
    return text
```

Add to `requirements.txt`:
```
requests==2.31.0
```

Add to environment variables:
```
OCR_SPACE_API_KEY=<your-api-key>
```

**Pros:**
- ✅ Works on Render free tier
- ✅ No system packages needed
- ✅ Often more accurate than Tesseract

**Cons:**
- ❌ Requires API key
- ❌ Limited free tier requests
- ❌ Requires internet connection

---

### Option 4: Disable OCR in Production (Simplest)

Keep OCR for local development only, disable in production.

#### Step 1: Update Upload View
Modify `backend/warranties/views.py`:

```python
from django.conf import settings

class WarrantyViewSet(viewsets.ModelViewSet):
    # ... existing code ...
    
    def create(self, request, *args, **kwargs):
        # Check if OCR is available
        ocr_available = hasattr(settings, 'TESSERACT_CMD') and settings.TESSERACT_CMD
        
        if request.data.get('use_ocr') and not ocr_available:
            return Response(
                {'error': 'OCR is not available in production. Please enter details manually.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ... rest of the code ...
```

#### Step 2: Update Frontend
Modify `frontend/src/pages/AddWarranty.jsx`:

```javascript
// Check if OCR is available (production vs development)
const OCR_AVAILABLE = import.meta.env.DEV;

// In your component:
{OCR_AVAILABLE && (
    <button onClick={handleOCRScan}>
        Scan Receipt
    </button>
)}

{!OCR_AVAILABLE && (
    <div className="ocr-disabled-notice">
        📝 OCR scanning is only available in development. 
        Please enter warranty details manually.
    </div>
)}
```

**Pros:**
- ✅ Simple solution
- ✅ No additional costs
- ✅ Works on Render free tier

**Cons:**
- ❌ No OCR in production
- ❌ Users must enter data manually

---

## 📊 Comparison Table

| Solution | Cost | OCR Works | Complexity | Recommended For |
|----------|------|-----------|------------|-----------------|
| **Railway** | $5-10/month | ✅ Yes | ⭐⭐⭐⭐ Easy | Production apps |
| **Fly.io** | Free (with limits) | ✅ Yes | ⭐⭐⭐ Medium | Docker users |
| **Cloud OCR API** | Free tier available | ✅ Yes | ⭐⭐⭐⭐ Easy | API-friendly apps |
| **Disable OCR** | Free | ❌ No | ⭐⭐⭐⭐⭐ Very Easy | MVP/Portfolio |

---

## 🎯 Recommended Approach

### For Portfolio/Learning:
**Option 4** - Disable OCR in production
- Keep it simple
- Focus on other features
- Mention OCR works locally in README

### For Real Users:
**Option 3** - Use Cloud OCR API
- Best balance of cost and functionality
- Works on free tier
- Easy to implement

### For Professional App:
**Option 1** - Use Railway
- Most reliable
- Full feature support
- Worth the cost for production

---

## 🛠️ Implementation Steps

### If Choosing Railway:

1. **Create Aptfile:**
   ```bash
   cd backend
   echo "tesseract-ocr" > Aptfile
   echo "tesseract-ocr-eng" >> Aptfile
   echo "poppler-utils" >> Aptfile
   ```

2. **Update settings.py:**
   ```python
   # For Railway deployment
   TESSERACT_CMD = config('TESSERACT_CMD', default='/usr/bin/tesseract')
   POPPLER_PATH = config('POPPLER_PATH', default='/usr/bin')
   ```

3. **Commit and push:**
   ```bash
   git add backend/Aptfile
   git commit -m "Add Aptfile for Railway buildpack"
   git push
   ```

4. **Deploy to Railway** (follow Railway deployment guide)

### If Choosing Cloud OCR:

1. **Sign up for OCR.space:**
   - Go to [ocr.space](https://ocr.space/ocrapi)
   - Get free API key

2. **Update code** (see Option 3 above)

3. **Add environment variable:**
   ```
   OCR_SPACE_API_KEY=your-api-key-here
   ```

4. **Deploy to Render** (OCR will work via API)

---

## 🧪 Testing OCR After Deployment

1. **Upload a receipt image**
2. **Click "Scan Receipt" button**
3. **Verify extracted data appears**
4. **Check for errors in logs**

### Test Receipt Images:
Use clear, high-quality images with:
- Product name clearly visible
- Date of purchase
- Store name
- Price information

---

## 📚 Additional Resources

- [Railway Buildpacks](https://docs.railway.app/deploy/builds#buildpacks)
- [Fly.io Dockerfile Guide](https://fly.io/docs/languages-and-frameworks/dockerfile/)
- [OCR.space API Documentation](https://ocr.space/ocrapi)
- [Google Cloud Vision](https://cloud.google.com/vision/docs/ocr)

---

## 🆘 Troubleshooting

**OCR not working on Railway:**
- Check if Aptfile is in the correct location
- Verify buildpack detected in logs
- Ensure TESSERACT_CMD points to `/usr/bin/tesseract`

**Cloud OCR API errors:**
- Verify API key is correct
- Check free tier limits
- Ensure image format is supported

**Docker build fails:**
- Check Dockerfile syntax
- Verify base image is correct
- Review build logs for errors

---

**Need help?** Choose the solution that best fits your needs and budget!
