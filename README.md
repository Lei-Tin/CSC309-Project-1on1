# One on One Project Root

## Layout

```
OneOnOne: The actual project
docs.pdf: Documentation of all API endpoints, methods, payloads, etc.
run.sh: A script to start the server
startup.sh: A script to setup the current environment to run the code
```

## Superuser

The startup script creates a superuser with the following credentials: 

```
DJANGO_SUPERUSER_USERNAME=test
DJANGO_SUPERUSER_PASSWORD=123
DJANGO_SUPERUSER_EMAIL="test@example.com"
```

## VM Startup

The VM used here is Ubuntu 20.04.6 LTS emulated on Windows Machine. 

If you are using VirtualBox or any other VM platforms, please look into installing the additional tools for the platform for a better experience. 

### Setup instructions

Enabling file sharing
```
su
sudo adduser $USER vboxsf
```

(Restart VM)

```
su
sh startup.sh
sh run.sh
```

The documentations for our API calls can be found at `127.0.0.1:8000/docs` once the server is running (after `sh run.sh`). 

A brief documentation of our model layout and API documentations can be found in `docs.pdf`. 

### Project Phase 3 Update and instructions

The setup is still the same as previous, install all dependencies with `make setup`

Then, run `make react` to start the react server, and run `make django` to start the django server. You need to do this in two different terminals.

You can run `make load` to load the pre-generated data that we have provided. Other make commands exist, please take a look at `Makefile` to understand more about it. 

Then, have fun using our project in the development server! 

The deployed server is available at [http://34.229.224.62/](http://34.229.224.62/). 