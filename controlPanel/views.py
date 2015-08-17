# -*- encoding: utf-8 -*-
import json
import requests

from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.http import JsonResponse, HttpResponse
from django.db import transaction
from controlPanel.models import Output, Port

@ensure_csrf_cookie
def control(request):
    return render(request, 'index.html')

def getData(request):
    if request.is_ajax():

        if request.method == 'GET':

            output_data = {}
            output_state = {}
            output_name = {}
            output_server = {}

            data = Output.objects.all()

            numOutputs = Output.objects.all().count()

            i = 0

            for output in data:

                output_state["out%s"%i] = output.output_state
                output_name["out%s"%i] = output.output_name
                output_server["out%s"%i] = output.output_server

                i += 1

            output_data["outputs"] = output_state
            output_data["numOutputs"] = numOutputs
            output_data["zoneName"] = output_name
            output_data["zoneServer"] = output_server

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
                    out.output_server =  data["servers"][outs]

                    out.save()

                    i += 1

            return HttpResponse("OK")
    else:
        return HttpResponse("NONONONONONONONO")

@csrf_exempt
def turn(request):

    if checkValidIP(request):

        if request.method == 'POST':

            data = json.loads(request.body)

            output = data["out"]
            state = data["state"]

            with transaction.atomic():

                out = Output.objects.get(id=output)
                out.output_state = state
                out.save()


    return HttpResponse("OK")

def checkValidIP(request):

    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        print("HTTP_X_FORWARDED_FOR")
        remoteIP = x_forwarded_for.split(',')[0]
    else:
        print("REMOTE_ADDR")
        remoteIP = request.META.get('REMOTE_ADDR')


    data = Output.objects.all()

    serverList = []


    for server in data:
        serverIP = server.output_server.split(':')[0]
        serverList.append(serverIP)

    print(remoteIP)
    print(serverList)

    if remoteIP in serverList:
        return(True)
    else:
        return(False)
