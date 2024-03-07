from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import TemplateView

# Create your views here.
class registerView(TemplateView):
    def get(self, request):
        # TDOO: Add logic to this
        return render(request, 'account/register.html')
    
    def post(self, request):
        # TODO: Add logic to this, from the post request from the form
        return HttpResponse('POST request')
    
class loginView(TemplateView):
    def get(self, request):
        # TDOO: Add logic to this
        return render(request, 'account/login.html')
    
    def post(self, request):
        # TODO: Add logic to this
        return HttpResponse('POST request')
    
class profileView(TemplateView):
    def get(self, request):
        # TDOO: Add logic to this
        return render(request, 'account/profile.html')
    
    def post(self, request):
        return HttpResponse('POST request')