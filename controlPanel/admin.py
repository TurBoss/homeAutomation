from django.contrib import admin

# Register your models here.

from .models import Output

class OutputAdmin(admin.ModelAdmin):
    fields = ['output_name', 'output_state']
    list_display = ('output_name', 'output_state')


admin.site.register(Output, OutputAdmin)
