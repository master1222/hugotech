
from django.core.management.base import BaseCommand
from django.conf import settings
from bell_scheduler import models
import random
import time
import os
import subprocess
from datetime import datetime, date
from cachetools import cached, TTLCache
from nava import play, stop, NavaBaseError
import holidays


class Command(BaseCommand):

        cacheParamBell   = TTLCache(maxsize=100, ttl=3600)
        cacheParamLesson = TTLCache(maxsize=100, ttl=60)
        cacheParamSong   = TTLCache(maxsize=100, ttl=1800)
        cacheParamConfig = TTLCache(maxsize=100, ttl=5) 

        @cached(cacheParamBell)
        def get_bells(self):
            return list(models.Track.objects.filter(bell=True))
        
        @cached(cacheParamLesson)
        def get_lessons(self): 
            return list(models.Lesson.objects.all())
        
        @cached(cacheParamSong)
        def get_songs(self,id):
            return list(models.Song.objects.filter(library__id__exact=id))

        @cached(cacheParamConfig)
        def get_config(self):
            return models.Config.objects.first()

        def should_play_today(self, config, holiday_calendar):
            today = datetime.today()
            if not config.playWeekend and today.weekday() > 4:
                return False
            if not config.playHoliday and holiday_calendar.get(today):
                return False
            return True
        
        

        def get_holidays(self, config):
            if config != None:
                match config.country:
                    case "SK":
                        return holidays.SK()
                    case "CZ":
                        return holidays.CZ()
                    case "PL":
                        return holidays.PL()
                    case "HU":
                        return holidays.HU()
                    case _:
                        return holidays.SK()
        
        def set_gpio(self, pin, state):
            subprocess.run(["gpioset", "gpiochip0", f"{pin}={state}"])

        def play_audio(self, path, duration):
            try:
                self.stdout.write(str(path))
                sound_id = play(str(path),async_mode=True)
                time.sleep(duration)
                stop(sound_id)
            except NavaBaseError as e:
                self.stdout.write(f"Playback error: {path} - {str(e)}")
            

        def handle(self,*args,**options):
            
            config = self.get_config()
            while True:

                if config:
                    self.stdout.write((str(config.pin)))
                    holidays_param = self.get_holidays(config)

                    if self.should_play_today(config,holidays_param):              

                        self.set_gpio(config.pin,0)
                        time.sleep(1)

                        bell_path = ""
                        bell_list = self.get_bells()

                        if len(bell_list):  
                            picked_bell = random.choice(bell_list)
                            if picked_bell:
                                bell_path = os.path.join(settings.MEDIA_ROOT,str(picked_bell.media))

                        lesson_list = self.get_lessons()

                        for obj in lesson_list:
                    
                            dif = datetime.combine(date.today(),obj.time) - datetime.combine(date.today(),datetime.now().time())
                            self.stdout.write(str(datetime.combine(date.today(),obj.time)))
                            self.stdout.write(str(datetime.combine(date.today(),datetime.now().time())))
                            self.stdout.write(str(dif))
                            if 0 <= dif.total_seconds() <= config.pinBeforeSeconds:

                                self.set_gpio(config.pin,1)

                                if bell_path != "":                         
                                    self.play_audio(bell_path,config.bellPlaySeconds)

                                if obj.track.media: 
                                    track_path = os.path.join(str(settings.MEDIA_ROOT),str(obj.track.media))
                                    self.play_audio(track_path,config.trackPlaySeconds)
                                
                        
                                if obj.library:
                                    picked_songs_list = []
                                    song_list = self.get_songs(obj.library.id)
                                    for s in song_list:
                                        picked_songs_list.append(s.media)

                                    try:
                                        song_lib_list = os.listdir(obj.library.path)
                                    except FileNotFoundError:
                                        self.stdout.write(f"Library path not found: {obj.library.path}")
                                    if song_lib_list:
                                        for s in song_lib_list:
                                            picked_songs_list.append(s)

                                    if len(picked_songs_list):
                                        picked_song = random.choice(picked_songs_list)
                                    
                                        song_path = ""
                                        self.stdout.write(str(picked_song))
                                        if not str(picked_song).startswith("libraries/"):
                                            song_path = os.path.join(obj.library.path, picked_song)
                                        else:
                                            song_path = os.path.join(settings.MEDIA_ROOT, picked_song)
                                        self.play_audio(song_path,config.songPlaySeconds)

                                self.set_gpio(config.pin,0)
                    else:
                        self.stdout.write("Is weekend or blank holiday!")
                        time.sleep(3600)
                else:
                    config = self.get_config()