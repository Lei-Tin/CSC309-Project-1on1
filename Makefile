.PHONY: setup django react clean load

setup:
	# Add setup commands here
	sh startup.sh

django:
	# Add Django start command here
	sh run_django.sh

react:
	# Add React start command here
	sh run_react.sh

clean: 
	# Add clean commands here
	# Removed the __pycache__ and migrations files
	rm -rf OneOnOne/*/__pycache__/ OneOnOne/*/*/__pycache__ OneOnOne/*/migrations/0*.py

load: clean
	# Add load commands here
	# Apply clean first
	
	# Load the data into the database
	python3 ./OneOnOne/manage.py makemigrations
	python3 ./OneOnOne/manage.py migrate
	python3 ./OneOnOne/manage.py loaddata data.json

dump:
	python3 ./OneOnOne/manage.py dumpdata > data.json
