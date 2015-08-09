# -*- encoding: utf-8 -*-
import json

from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse, HttpResponse
from django.db import transaction
from controlPanel.models import Output

@ensure_csrf_cookie
def control(request):
    return render(request, 'index.html')

def getData(request):
    if request.is_ajax():

        if request.method == 'GET':

            output_data = {}
            output_state = {}
            output_name = {}

            data = Output.objects.all()

            i = 0

            for output in data:

                output_state["out%s"%i] = output.output_state
                output_name["out%s"%i] = output.output_name

                i += 1

            output_data["outputs"] = output_state
            output_data["zoneName"] = output_name

            response = JsonResponse(output_data)
            return HttpResponse(response.content)

    else:
        return HttpResponse("NONONONONONONONO")

def sendOutputData(request):
    if request.is_ajax():

        if request.method == 'POST':
            data = json.loads(request.body)

            with transaction.atomic():
                i = 1
                for outs in data["outputs"]:

                    out = Output.objects.get(id=i)
                    out.output_state =  data["outputs"][outs]
                    out.save()
                    i += 1

            response = JsonResponse(data)
            return HttpResponse(response.content)
    else:
        return HttpResponse("NONONONONONONONO")

def sendNameData(request):
    if request.is_ajax():

        if request.method == 'POST':

            #print(request.body)
            data = json.loads(request.body)
            with transaction.atomic():

                i = 1
                for outs in data["outputs"]:

                    out = Output.objects.get(id=i)
                    out.output_name =  data["outputs"][outs]
                    out.save()
                    i += 1

            return HttpResponse("OK")
    else:
        return HttpResponse("NONONONONONONONO")
