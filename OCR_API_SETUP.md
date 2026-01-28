# Getting OCR.space API Key for Production

Follow these steps to get a free OCR API key for production deployment:

## Step 1: Visit OCR.space

Go to: **https://ocr.space/ocrapi**

## Step 2: Register for Free API Key

1. Scroll down to the "Free OCR API" section
2. Click on **"Register for free API key"** button
3. Fill in the registration form:
   - **Email address**: Your email
   - **Use case**: Select "Personal/Educational"
   - **Monthly volume**: Select appropriate tier (free tier is 25,000 requests/month)

## Step 3: Receive API Key

1. Check your email inbox
2. You'll receive an email with your API key
3. The API key will look something like: `K12345678901234`

## Step 4: Configure for Production

### For Railway Deployment:

1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to **"Variables"** tab
4. Add these environment variables:
   ```
   USE_CLOUD_OCR=True
   OCR_API_KEY=your_api_key_here
   ```
5. Click **"Deploy"** to restart with new variables

### For Render Deployment:

1. Go to your Render dashboard
2. Select your web service
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add:
   - Key: `USE_CLOUD_OCR`, Value: `True`
   - Key: `OCR_API_KEY`, Value: `your_api_key_here`
6. Click **"Save Changes"** - service will auto-redeploy

## Step 5: Verify Configuration

After deployment:
1. Open your deployed app
2. Try to scan a receipt
3. Check the logs to confirm it's using cloud OCR
4. You should see: "Using cloud OCR API" in the logs

## API Limits (Free Tier)

- **25,000 requests per month**
- **500 requests per day**
- **Max file size**: 1MB
- **Supported formats**: JPG, PNG, GIF, PDF, BMP

## Monitoring Usage

1. Log in to OCR.space dashboard
2. View your API usage statistics
3. Monitor remaining requests
4. Upgrade if needed

## Alternative: Google Cloud Vision API

If you need more requests or better accuracy:

1. Go to: https://cloud.google.com/vision
2. Enable Cloud Vision API
3. Create service account and download JSON key
4. Update the OCR service to use Google Vision API instead

## Troubleshooting

**"Invalid API key" error:**
- Double-check the API key is correct
- Ensure no extra spaces in the environment variable
- Verify the key is active in OCR.space dashboard

**"Rate limit exceeded":**
- You've hit the daily/monthly limit
- Wait for the limit to reset
- Consider upgrading to paid tier

**"File too large" error:**
- Compress images before uploading
- Maximum file size is 1MB for free tier
- Consider resizing images on the frontend

## Cost Considerations

**Free Tier**: Perfect for personal use and testing
**Paid Tiers**: Starting at $6/month for 100,000 requests

For most personal warranty management use cases, the free tier should be sufficient!
