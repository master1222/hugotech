
from django.core.management.base import BaseCommand
from bell_scheduler import models
import random, vlc, time
from datetime import datetime, date
from django.conf import settings
import os
#import RPi.GPIO as GPIO

class Command(BaseCommand):

        # def relay_control(action):

        #     GPIO_CONTROl = 6

        #     if action == True:
        #         time.sleep(1)
        #         GPIO.setmode(GPIO.BCM)
        #         GPIO.setup(GPIO_CONTROl, GPIO.OUT)
        #         GPIO.output(GPIO_CONTROl,True)
        #     else:
        #         try:
        #             GPIO.output(GPIO_CONTROl,False)
        #         except:
        #             GPIO.setmode(GPIO.BCM)
        #             GPIO.setup(GPIO_CONTROl,GPIO.OUT)
        #             GPIO.output(GPIO_CONTROl,False)
            
        #     GPIO.cleanup()
        

        def handle(self,*args,**options):

            while True:

                bell_list = models.Track.objects.filter(bell=True)
                if not bell_list:  
                    bell_path = ""
                else:
                    bell_path = os.path.join(settings.MEDIA_ROOT,str(),random.choice(bell_list).media)
                
                

                for obj in models.Lesson.objects.all():
                    dif = datetime.combine(date.today(),obj.time) - datetime.combine(date.today(),datetime.now().time())
                                        
                    if dif.seconds < 5:

                        if bell_path != "":                         
                            p = vlc.MediaPlayer(bell_path)
                            p.play()
                            time.sleep(5)
                            p.stop()

                        if obj.track.media != None: 
                            track_path = os.path.join(str(settings.MEDIA_ROOT),str(obj.track.media))
                            p = vlc.MediaPlayer(track_path)
                            p.play()
                            time.sleep(5)
                            p.stop()
                        
                        if obj.library != None:
                            song_list = []
                            for s in models.Song.objects.filter( library__id__exact=obj.library.id):
                                song_list.append(s.media)
                            for s in os.listdir(obj.library.path):
                                song_list.append(s)
 
                            picked_song = random.choice(song_list)
                            self.stdout.write(str(picked_song))
                            song_path = settings.MEDIA_ROOT
                            if not str(picked_song).startswith("libraries/"):
                                song_path = os.path.join(song_path, "libraries")
                                song_path = os.path.join(song_path, obj.library.path)
                            song_path = os.path.join(song_path, picked_song)
                            p = vlc.MediaPlayer(song_path)
                            p.play()
                            time.sleep(30)
                        break

                        # self.relay_control(False)
 
                