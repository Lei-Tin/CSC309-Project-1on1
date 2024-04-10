from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import TemplateView

# Create your views here.
class indexView(TemplateView):
    def get(self, request):
        return render(request, 'index.html')
    
    def post(self, request):
        return HttpResponse('POST request')