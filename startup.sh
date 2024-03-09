# TODO: Install necessary stuffs
pip3 install -r requirements.txt
python3 OneOnOne/manage.py makemigrations
python3 OneOnOne/manage.py migrate

# Create superuser
DJANGO_SUPERUSER_USERNAME=test \
DJANGO_SUPERUSER_PASSWORD=123 \
DJANGO_SUPERUSER_EMAIL="test@example.com" \
python3 OneOnOne/manage.py createsuperuser --noinput