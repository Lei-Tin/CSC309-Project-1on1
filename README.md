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