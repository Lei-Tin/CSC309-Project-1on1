# This is the file to instruct how to deploy on Amazon EC2

I will assume that you have already created an Amazon EC2 instance, and can already log into it. 

Steps: 

1. `sudo apt install make`, install make
2. `sudo su`, get into super user mode
3. `apt update`, update apt to ensure that we can find the right packages
4. `apt install gh`, install GitHub CLI to clone from private repo
4. `make setup`, get the setup for python ready
5. 