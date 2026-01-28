"""
OCR Service for extracting warranty information from receipts.
Uses Tesseract OCR to extract text from images and PDFs.
"""

import pytesseract
from PIL import Image
from pdf2image import convert_from_path
import PyPDF2
import re
from datetime import datetime, timedelta
from django.conf import settings
import os
import tempfile
import requests
import base64


class ReceiptOCRService:
    """Service for processing receipt images and extracting warranty data."""
    
    CATEGORY_KEYWORDS = {
        'Electronics': ['laptop', 'computer', 'phone', 'mobile', 'tablet', 'camera', 'headphone', 
                       'speaker', 'monitor', 'keyboard', 'mouse', 'printer', 'scanner', 'tv', 
                       'television', 'smartwatch', 'earbuds', 'charger', 'electronics'],
        'Home Appliances': ['refrigerator', 'fridge', 'washing machine', 'washer', 'dryer', 
                           'microwave', 'oven', 'dishwasher', 'vacuum', 'air conditioner', 'ac',
                           'heater', 'fan', 'blender', 'mixer', 'toaster', 'appliance'],
        'Furniture': ['sofa', 'couch', 'chair', 'table', 'desk', 'bed', 'mattress', 'cabinet',
                     'shelf', 'wardrobe', 'furniture', 'dresser'],
        'Automotive': ['car', 'vehicle', 'auto', 'tire', 'battery', 'automotive', 'motorcycle',
                      'bike', 'scooter'],
        'Accessories': ['watch', 'bag', 'wallet', 'belt', 'sunglasses', 'jewelry', 'accessory'],
    }
    
    WARRANTY_KEYWORDS = ['warranty', 'guarantee', 'coverage', 'protection plan']
    
    def __init__(self):
        """Initialize OCR service with Tesseract configuration."""
        self.tesseract_available = False
        self.use_cloud_ocr = getattr(settings, 'USE_CLOUD_OCR', False)
        self.ocr_api_key = getattr(settings, 'OCR_API_KEY', '')
        
        # Try to configure Tesseract
        if hasattr(settings, 'TESSERACT_CMD') and settings.TESSERACT_CMD:
            if os.path.exists(settings.TESSERACT_CMD):
                pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
                self.tesseract_available = True
            else:
                print(f"Warning: Tesseract not found at {settings.TESSERACT_CMD}")
        
        # If Tesseract not available and no cloud OCR configured, warn
        if not self.tesseract_available and not (self.use_cloud_ocr and self.ocr_api_key):
            print("Warning: Neither Tesseract nor Cloud OCR is configured. OCR functionality will be limited.")
    
    def extract_text_from_image_cloud(self, image_path):
        """Extract text from an image using cloud OCR API (OCR.space)."""
        try:
            with open(image_path, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode()
            
            payload = {
                'apikey': self.ocr_api_key,
                'base64Image': f'data:image/png;base64,{image_data}',
                'language': 'eng',
                'isOverlayRequired': False,
                'detectOrientation': True,
                'scale': True,
                'OCREngine': 2,
            }
            
            response = requests.post(
                'https://api.ocr.space/parse/image',
                data=payload,
                timeout=30
            )
            
            result = response.json()
            
            if result.get('IsErroredOnProcessing'):
                raise Exception(f"Cloud OCR error: {result.get('ErrorMessage', 'Unknown error')}")
            
            if result.get('ParsedResults'):
                return result['ParsedResults'][0].get('ParsedText', '')
            
            raise Exception("No text extracted from image")
            
        except Exception as e:
            raise Exception(f"Failed to extract text using cloud OCR: {str(e)}")
    
    def extract_text_from_image(self, image_path):
        """Extract text from an image file using Tesseract OCR or cloud OCR."""
        try:
            # Try Tesseract first if available
            if self.tesseract_available:
                try:
                    image = Image.open(image_path)
                    # Preprocess image for better OCR results
                    image = image.convert('L')  # Convert to grayscale
                    text = pytesseract.image_to_string(image)
                    return text
                except Exception as tesseract_error:
                    print(f"Tesseract OCR failed: {tesseract_error}")
                    # Fall through to cloud OCR if available
            
            # Try cloud OCR if configured
            if self.use_cloud_ocr and self.ocr_api_key:
                return self.extract_text_from_image_cloud(image_path)
            
            # If neither is available, raise error
            raise Exception(
                "OCR is not configured. Please install Tesseract locally or configure cloud OCR API. "
                "See OCR_SETUP_GUIDE.md for instructions."
            )
            
        except Exception as e:
            raise Exception(f"Failed to extract text from image: {str(e)}")
    
    def extract_text_from_pdf(self, pdf_path):
        """Extract text from a PDF file."""
        try:
            # First try to extract text directly from PDF
            text = ""
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text()
            
            # If no text found, convert PDF to images and use OCR
            if not text.strip():
                poppler_path = getattr(settings, 'POPPLER_PATH', None)
                images = convert_from_path(pdf_path, poppler_path=poppler_path)
                for image in images:
                    text += pytesseract.image_to_string(image)
            
            return text
        except Exception as e:
            raise Exception(f"Failed to extract text from PDF: {str(e)}")
    
    def extract_text(self, file_path, file_type):
        """Extract text from file based on type."""
        if file_type.lower() in ['jpg', 'jpeg', 'png', 'bmp', 'tiff']:
            return self.extract_text_from_image(file_path)
        elif file_type.lower() == 'pdf':
            return self.extract_text_from_pdf(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
    
    def parse_product_name(self, text):
        """Extract product name from receipt text."""
        lines = text.split('\n')
        # Look for product names (usually in first few lines or after keywords)
        for line in lines[:15]:  # Check first 15 lines
            line = line.strip()
            if len(line) > 3 and not line.isdigit() and not re.match(r'^\d+[\/\-]\d+', line):
                # Skip lines that are just dates, prices, or store names
                if not re.search(r'^\$?\d+\.?\d*$', line) and not re.search(r'receipt|invoice|bill', line, re.I):
                    # This might be a product name
                    if len(line) > 5:
                        return line[:100]  # Limit length
        return ""
    
    def parse_brand(self, text):
        """Extract brand name from receipt text."""
        # Common brand indicators
        brand_patterns = [
            r'brand[:\s]+([A-Za-z0-9\s]+)',
            r'manufacturer[:\s]+([A-Za-z0-9\s]+)',
            r'make[:\s]+([A-Za-z0-9\s]+)',
        ]
        
        for pattern in brand_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()[:50]
        
        # If no explicit brand, try to find capitalized words
        words = text.split()
        for word in words[:20]:
            if word.isupper() and len(word) > 2:
                return word[:50]
        
        return ""
    
    def parse_date(self, text):
        """Extract purchase date from receipt text."""
        # Common date patterns
        date_patterns = [
            r'(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})',  # MM/DD/YYYY or DD/MM/YYYY
            r'(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})',    # YYYY/MM/DD
            r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}',  # Month DD, YYYY
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                date_str = match.group(0)
                # Try to parse the date
                try:
                    # Try different date formats
                    for fmt in ['%m/%d/%Y', '%d/%m/%Y', '%Y/%m/%d', '%m-%d-%Y', '%d-%m-%Y', '%Y-%m-%d', '%B %d, %Y', '%b %d, %Y']:
                        try:
                            parsed_date = datetime.strptime(date_str, fmt)
                            return parsed_date.strftime('%Y-%m-%d')
                        except:
                            continue
                except:
                    pass
        
        # Default to today if no date found
        return datetime.now().strftime('%Y-%m-%d')
    
    def parse_warranty_period(self, text):
        """Extract warranty period from receipt text."""
        # Look for warranty period patterns
        warranty_patterns = [
            r'(\d+)\s*year[s]?\s*warranty',
            r'(\d+)\s*month[s]?\s*warranty',
            r'warranty[:\s]+(\d+)\s*year[s]?',
            r'warranty[:\s]+(\d+)\s*month[s]?',
            r'(\d+)\s*yr[s]?\s*warranty',
        ]
        
        for pattern in warranty_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                period = int(match.group(1))
                # Check if it's years or months
                if 'year' in match.group(0).lower() or 'yr' in match.group(0).lower():
                    return period * 12  # Convert years to months
                return period
        
        # Default to 12 months if not found
        return 12
    
    def detect_category(self, text):
        """Auto-detect product category based on keywords."""
        text_lower = text.lower()
        
        # Count keyword matches for each category
        category_scores = {}
        for category, keywords in self.CATEGORY_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                category_scores[category] = score
        
        # Return category with highest score
        if category_scores:
            return max(category_scores, key=category_scores.get)
        
        return 'Other'
    
    def parse_receipt(self, file_path, file_type):
        """
        Main method to parse receipt and extract warranty data.
        Returns a dictionary with extracted information.
        """
        try:
            # Extract text from file
            text = self.extract_text(file_path, file_type)
            
            # Parse individual fields
            product_name = self.parse_product_name(text)
            brand = self.parse_brand(text)
            purchase_date = self.parse_date(text)
            warranty_period = self.parse_warranty_period(text)
            category = self.detect_category(text)
            
            return {
                'success': True,
                'extracted_text': text[:500],  # First 500 chars for reference
                'data': {
                    'product_name': product_name,
                    'brand': brand,
                    'purchase_date': purchase_date,
                    'warranty_period': warranty_period,
                    'category': category,
                },
                'confidence': self._calculate_confidence(product_name, brand, purchase_date)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'data': {}
            }
    
    def _calculate_confidence(self, product_name, brand, purchase_date):
        """Calculate confidence score based on extracted data quality."""
        score = 0
        if product_name and len(product_name) > 5:
            score += 40
        if brand and len(brand) > 2:
            score += 30
        if purchase_date:
            score += 30
        return min(score, 100)
