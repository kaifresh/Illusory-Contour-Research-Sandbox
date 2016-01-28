#!/usr/bin/python

import cgi, cgitb
import subprocess
import os
import datetime


def decode_base64(data):
    """Decode base64, padding being optional.

    :param data: Base64 data as an ASCII byte string
    :returns: The decoded byte string.

    """
    missing_padding = 4 - len(data) % 4
    if missing_padding:
        data += b'='* missing_padding
    return data.decode('base64')

def pad_zeros(name):

    idx = name

    try:
        # print "padding: " + str(name)

        if int(name) < 10:
            idx = "00" + str(name)

        elif int(name) < 100:
            idx = "0" + str(name)

    except:
        pass

    return str(idx)


def execute(command):
    popen = subprocess.Popen(command, stdout=subprocess.PIPE)
    lines_iterator = iter(popen.stdout.readline, b"")
    for line in lines_iterator:
        print(line) # yield line

def executePrintStdErr(command):
    popen = subprocess.Popen(command, stderr=subprocess.PIPE)
    lines_iterator = iter(popen.stderr.readline, b"")
    for line in lines_iterator:
        print(line) # yield line

##########################################

cgitb.enable()
data = cgi.FieldStorage()

print "Content-type: text/html\n\n"

images = data.getvalue("data[]")

print("Keys sent via POST: ")
for key in data.keys():
    print(key)

doDeleteImages = data["doDeleteImages"].value
# print "DO DELETE IMAGES " + str(doDeleteImages)


print "\n\n\n\nFileCount: "
print len(images)

baseName = "im"
filetype = ".png"

fileNamesForDeletion = []

for i in xrange(0, len(images)):
    headerEnd = images[i].find(',')
    decodedImage = images[i][headerEnd:].decode('base64') #1. remove header, 2. decode from base 64

    indexWithZeros = pad_zeros(i)

    fileName = baseName + indexWithZeros + filetype
    fileNamesForDeletion.append(fileName)

    fp = open(fileName, 'wb')
    fp.write(decodedImage)
    fp.close()


outname = "out.mov"

try:
    os.remove(outname) #just coz overwriting doens't seem to be working
except OSError:
    pass

frameRate = 60

#TIme the shit to check for dreamhost killing your vibe
convertStart = datetime.datetime.now()

executePrintStdErr(['ffmpeg',
                       '-f', "image2",              #format?
                        '-r', str(frameRate),                #Frame rate of the input
                       '-i', baseName+"%03d"+filetype,   #file name of the output
                       '-r', str(frameRate),             #frame rate of the output
                       '-b', '5000k',
                       '-vcodec', 'libx264',
                       '-preset','slow',
                        '-pix_fmt', 'yuv420p',
                       outname])

convertEnd = datetime.datetime.now()

print "Conversion took: " , convertEnd - convertStart

# # #Delete all files you just created
if doDeleteImages:
    for name in fileNamesForDeletion:
        try:
            os.remove(name)
        except OSError:
            pass


print outname
