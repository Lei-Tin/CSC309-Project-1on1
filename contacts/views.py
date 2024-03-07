from django.shortcuts import render

# Create your views here.

from django.http import HttpResponse
from django.views.generic import TemplateView

class contactListView(TemplateView):
    def get(self, request):
        # TDOO: Add logic to this
        return render(request, 'contact/contact.html')
    
    def post(self, request):
        return HttpResponse('POST request')

class addContactView(TemplateView):
    def get(self, request):
        # TDOO: Add logic to this
        return render(request, 'contact/contact_add.html')
    
    def post(self, request):
        return HttpResponse('POST request')

class inviteContactView(TemplateView):
    def get(self, request):
        # TDOO: Add logic to this
        return render(request, 'contact/contact_invite.html')
    
    def post(self, request):
        return HttpResponse('POST request')