from django.contrib import admin

# Register your models here.

from .models import Output, Port

class OutputAdmin(admin.ModelAdmin):
    fields = ['output_name', 'output_state']
    list_display = ('output_name', 'output_state')

class PortAdmin(admin.ModelAdmin):
    fields = ['port_name']
    list_display = ('port_name', )

admin.site.register(Output, OutputAdmin)
admin.site.register(Port, PortAdmin)
