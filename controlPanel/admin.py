from django.contrib import admin

# Register your models here.

from .models import Output

class OutputAdmin(admin.ModelAdmin):
    fields = ['output_name', 'output_state', 'output_server']
    list_display = ('output_name', 'output_state', 'output_server')

admin.site.register(Output, OutputAdmin)
