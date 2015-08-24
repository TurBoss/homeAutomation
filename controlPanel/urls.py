from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.control, name='control'),
    url(r'^getData$', views.getData, name='getData'),
    url(r'^sendOutputData$', views.sendOutputData, name='sendOutputData'),
    url(r'^sendNameData$', views.sendNameData, name='sendNameData'),
    url(r'^turn$', views.turn, name='turn'),
    url(r'^systemTask$', views.systemTask, name='systemTask'),

]
