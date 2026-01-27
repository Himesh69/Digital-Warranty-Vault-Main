import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'warranty_vault.settings')
django.setup()

from warranties.models import Warranty

# Check if warranty exists with the given share token
share_token = '7d8ab295-83f1-453b-9056-974925ae9330'
w = Warranty.objects.filter(share_token=share_token).first()
print(f'Warranty with token {share_token}:', w)

# List all warranties
print('\nAll warranties in database:')
for warranty in Warranty.objects.all():
    print(f'  ID: {warranty.id}, Share Token: {warranty.share_token}, Product: {warranty.product_name}')
