# -*- encoding: utf-8 -*-
import json
import requests
import subprocess

from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.http import JsonResponse, HttpResponse, HttpResponseForbidden
from django.db import transaction
from controlPanel.models import Output

@ensure_csrf_cookie
def control(request):
    return render(request, 'index.html')

def systemTask(request):

    if request.is_ajax():

        if request.method == 'POST':

            if request.body == "shutdown":

                command = "/usr/bin/sudo /sbin/shutdown -h now"

            elif request.body == "reboot":

                command = "/usr/bin/sudo /sbin/shutdown -r now"

            process = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
            output = process.communicate()[0]
            print output

            return HttpResponse("OK")
    else:
        return HttpResponseForbidden("NONONONONONONONO")

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
        return HttpResponseForbidden("NONONONONONONONO")

def sendOutputData(request):

    if request.is_ajax():

        if request.method == 'POST':

            data = json.loads(request.body)

            out_id = data["out"]
            state = data["state"]

            with transaction.atomic():

                out = Output.objects.get(id=out_id)
                out.output_state =  state
                out.save()


            output_data = {}
            output_state = {}

            data = Output.objects.all()

            i = 0

            for output in data:

                output_state["out%s" % i] = output.output_state

                i += 1

            output_data["outputs"] = output_state

            out = Output.objects.get(id=out_id)
            server = out.output_server
            state = out.output_state

            print(state)

            if state == 1:
                url = "http://%s/ON" % server
            else:
                url = "http://%s/OFF" % server

            try:
                r = requests.post(url, timeout=0.1)
            except requests.exceptions.Timeout:
                print("Timeout error %s" % server)
            except requests.exceptions.RequestException as e:
                print(e)

            response = JsonResponse(output_data)
            return HttpResponse(response.content)
    else:
        return HttpResponseForbidden("NONONONONONONONO")

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
        return HttpResponseForbidden("NONONONONONONONO")

@csrf_exempt
def turn(request):

    remoteIP = ""

    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        print("HTTP_X_FORWARDED_FOR")
        remoteIP = x_forwarded_for.split(',')[0]
    else:
        print("REMOTE_ADDR")
        remoteIP = request.META.get('REMOTE_ADDR')

    if validIP(remoteIP):
        print("Valid IP")
        if request.method == 'POST':

            print("%s %s" % (request.method, request.body))

            data = json.loads(request.body)

            output = data["out"]
            state = data["state"]
            print("output= %s state= %s" % (output,state))

            with transaction.atomic():

                out = Output.objects.get(id=output)
                out.output_state = state
                out.save()

        return HttpResponse("OK")
    else:
        return HttpResponseForbidden("NONONONONONONONO")


def validIP(ip):

    data = Output.objects.all()

    serverList = ["192.168.0.113"]

    for server in data:
        serverIP = server.output_server.split(':')[0]
        serverList.append(serverIP)

    print(ip)
    print(serverList)

    if ip in serverList:
        return(True)
    else:
        return(False)
