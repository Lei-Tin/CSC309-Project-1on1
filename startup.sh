# Install Python
echo "Installing Python..."
apt install python3 -y
apt install python3-pip -y

# Install necessary stuffs
echo "Installing necessary dependencies..."
pip3 install -r requirements.txt

# Make migrations for Django
python3 OneOnOne/manage.py makemigrations
python3 OneOnOne/manage.py migrate

# Remove superuser if exists
# Otherwise do nothing
echo "Removing superuser..."
python3 OneOnOne/manage.py shell -c "from django.contrib.auth.models import User; 
User.objects.filter(username='test').delete()"

# Create superuser
echo "Creating superuser..."
DJANGO_SUPERUSER_USERNAME=test \
DJANGO_SUPERUSER_PASSWORD=123 \
DJANGO_SUPERUSER_EMAIL="test@example.com" \
python3 OneOnOne/manage.py createsuperuser --noinput


# Install Nodejs
echo "Installing Nodejs..."
apt install nodejs -y

# Install npm
echo "Installing npm..."
apt install npm -y

# Install necessary dependencies
echo "Installing necessary dependencies..."

# Change directory into frontend
cd OneOnOne/one_on_one/one_on_one_rc

# Install necessary dependencies
npm install