.PHONY: setup django react clean load dump migrate

setup:
	# Add setup commands here
	# Install Python
	echo "Installing Python..."
	apt install python3 -y
	apt install python3-pip -y

	# Install necessary stuffs
	echo "Installing necessary dependencies..."
	pip3 install -r requirements.txt

	# Make migrations for Django
	python3 django/manage.py makemigrations
	python3 django/manage.py migrate

	# Remove superuser if exists
	# Otherwise do nothing
	echo "Removing superuser..."
	python3 django/manage.py shell -c "from django.contrib.auth.models import User; User.objects.filter(username='test').delete()"

	# Create superuser
	echo "Creating superuser..."
	DJANGO_SUPERUSER_USERNAME=test \
	DJANGO_SUPERUSER_PASSWORD=123 \
	DJANGO_SUPERUSER_EMAIL="test@example.com" \
	python3 django/manage.py createsuperuser --noinput

	# Install Nodejs
	echo "Installing Nodejs..."
	apt install nodejs -y

	# Install npm
	echo "Installing npm..."
	apt install npm -y

	# Install necessary dependencies
	echo "Installing necessary dependencies..."

	# Install necessary dependencies
	npm install --prefix react

django:
	# Add Django start command here
	python3 django/manage.py runserver

react:
	# Add React start command here
	npm start --prefix react

clean: 
	# Add clean commands here
	# Removed the __pycache__ and migrations files
	rm -rf django/*/__pycache__/ django/*/*/__pycache__ django/*/migrations/0*.py django/db.sqlite3

migrate: 
	python3 django/manage.py makemigrations
	python3 django/manage.py migrate

load: clean
	# Add load commands here
	# Apply clean first
	
	# Load the data into the database
	python3 django/manage.py makemigrations
	python3 django/manage.py migrate
	python3 django/manage.py loaddata data.json

dump:
	python3 django/manage.py dumpdata > data.json
