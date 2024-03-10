# TODO: Install necessary stuffs
echo "Installing necessary dependencies..."
pip3 install -r requirements.txt
python3 OneOnOne/manage.py makemigrations
python3 OneOnOne/manage.py migrate

# Remove superuser
# It removes if exist, otherwise do nothing
echo "Removing superuser..."
python3 OneOnOne/manage.py shell -c "from django.contrib.auth.models import User; 
User.objects.filter(username='test').delete()"

# Create superuser
echo "Creating superuser..."
DJANGO_SUPERUSER_USERNAME=test \
DJANGO_SUPERUSER_PASSWORD=123 \
DJANGO_SUPERUSER_EMAIL="test@example.com" \
python3 OneOnOne/manage.py createsuperuser --noinput