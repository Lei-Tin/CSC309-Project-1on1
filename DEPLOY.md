# This is the file to instruct how to deploy on Amazon EC2

I will assume that you have already created an Amazon EC2 instance, and can already log into it. 

Steps: 

1. `sudo su`, get into super user mode
2. `apt install make`, install make
3. `apt update`, update apt to ensure that we can find the right packages
4. `apt install gh`, install GitHub CLI to clone from private repo. Then use whatever method for `gh auth login` to login. 
5. `apt install nginx -y`, install nginx first
6. `cd /var/www/`, cd to our root
7. `git clone ${REPOSITORY LINK}`, this assumes you have logged in with `gh auth login`
8. `make setup`, get the setup for Python and NPM ready, press `enter` for any installs

Optional test: `python3 django runserver 0.0.0.0:80` and see if you can access the webpage at `PUBLIC_IP`. 

7. 