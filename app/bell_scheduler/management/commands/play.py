
from django.core.management.base import BaseCommand
from bell_scheduler import models
from time import sleep 
import random, vlc, time
from datetime import datetime, date
class Command(BaseCommand):


        def handle(self,*args,**options):
            while True:
                for obj in models.Lesson.objects.all():
                    self.stdout.write(str(obj.time))
                    self.stdout.write(str(obj.track.name))
                    dif = datetime.combine(date.today(),obj.time) - datetime.combine(date.today(),datetime.now().time())
                    if dif.seconds < 5:
                        p = vlc.MediaPlayer(obj.track.media)
                        p.play()
                        time.sleep(4)

                        library_path = PATH_LIBRARY_FOLDER + '\\' + i["library"]["path"]
                        random_track = random.choice(os.listdir(library_path))
                        random_track_fullpath = library_path + '\\' + random_track
                        p = vlc.MediaPlayer(random_track_fullpath)
                        p.play()
                        time.sleep(30)
                sleep(2)