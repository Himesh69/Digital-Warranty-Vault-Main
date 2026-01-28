# OCR Setup Guide

This guide explains how to set up OCR (Optical Character Recognition) for receipt scanning in the Digital Warranty Vault application.

## Local Development Setup

### Option 1: Using Tesseract OCR (Recommended for Local)

Tesseract is already installed on your system at:
```
C:\Program Files\Tesseract-OCR\tesseract.exe
```

The `.env` file has been configured with the correct path. The OCR should now work locally!

### Testing Local OCR

1. **Restart the backend server** to load the new configuration:
   ```bash
   # Stop the current server (Ctrl+C)
   cd backend
   .\venv\Scripts\Activate.ps1
   python manage.py runserver
   ```

2. **Test the OCR feature**:
   - Open the frontend at http://localhost:5173
   - Log in to your account
   - Go to "Add Warranty" page
   - Click "Scan Receipt" button
   - Upload a receipt image (JPG, PNG, or PDF)
   - The form should auto-fill with extracted data

## Production Deployment Setup

### Cloud OCR API (Required for Railway/Render)

Since Tesseract cannot be installed on free hosting platforms, you need to set up a cloud OCR API:

#### Step 1: Get Free OCR.space API Key

1. Visit: https://ocr.space/ocrapi
2. Click "Register for free API key"
3. Fill in your email address
4. You'll receive an API key (25,000 requests/month free)

#### Step 2: Configure for Production

Add these environment variables to your Railway/Render deployment:

```bash
USE_CLOUD_OCR=True
OCR_API_KEY=your_api_key_here
```

**For Railway:**
1. Go to your project dashboard
2. Click on "Variables" tab
3. Add the two variables above

**For Render:**
1. Go to your web service dashboard
2. Click on "Environment" tab
3. Add the two variables above

## How It Works

The OCR service automatically:
1. **Tries Tesseract first** (if installed locally)
2. **Falls back to Cloud OCR** (if Tesseract fails or unavailable)
3. **Shows helpful error** (if neither is configured)

This means:
- ✅ Local development uses free Tesseract (no API calls)
- ✅ Production uses Cloud OCR API (works on any platform)
- ✅ Automatic fallback ensures reliability

## Troubleshooting

### "Failed to extract text from image: [WinError 87]"
- **Cause**: Tesseract path is incorrect or not configured
- **Fix**: Check that `TESSERACT_CMD` in `.env` points to the correct location

### "OCR is not configured"
- **Cause**: Neither Tesseract nor Cloud OCR is set up
- **Fix**: Either install Tesseract locally OR get a cloud OCR API key

### "Cloud OCR error: Invalid API key"
- **Cause**: OCR.space API key is missing or incorrect
- **Fix**: Get a valid API key from https://ocr.space/ocrapi

### OCR extracts incorrect data
- **Tip**: OCR accuracy depends on image quality
- **Best practices**:
  - Use high-resolution images
  - Ensure good lighting
  - Keep receipt flat and straight
  - Avoid blurry or damaged receipts

## API Rate Limits

**OCR.space Free Tier:**
- 25,000 requests per month
- 500 requests per day
- Should be sufficient for most personal use

If you need more, consider:
- Upgrading to paid plan
- Using Google Cloud Vision API
- Implementing request caching

## Next Steps

After configuration:
1. Restart your backend server
2. Test OCR with a sample receipt
3. Deploy to production with cloud OCR configured
4. Monitor API usage in OCR.space dashboard
