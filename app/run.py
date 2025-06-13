import json
from datetime import datetime, date
import os, random, vlc, time
import urllib.request

#CONFIG_FILE = 'C:\\Users\\juraj\\Documents\\Workplace\\BellScheduler\\app\\config.json'
PATH_ID_FOLDER = 'C:\\Users\\juraj\\Documents\\Workplace\\BellScheduler\\app\\media\\tracks'
PATH_LIBRARY_FOLDER = 'C:\\Users\\juraj\\Documents\\Workplace\\BellScheduler\\app\\media\\libraries'

while True: 

    with urllib.request.urlopen("http://localhost:8000/api/v1/lessons/") as url:
        data = json.load(url)
    
    #with open(CONFIG_FILE, 'r') as file:
    #    data = json.load(file)  

    current_time = datetime.now().time()
    for i in data:
        config_time = datetime.strptime(i["time"], "%H:%M:%S").time() 
        var1 = datetime.combine(date.today(),config_time)
        var2 = datetime.combine(date.today(),current_time)
        dif = var1 - var2
        if dif.seconds < 5:
            id_path = PATH_ID_FOLDER + '\\' + i["track"]["path"]
            p = vlc.MediaPlayer(id_path)
            p.play()
            time.sleep(4)

            library_path = PATH_LIBRARY_FOLDER + '\\' + i["library"]["path"]
            random_track = random.choice(os.listdir(library_path))
            random_track_fullpath = library_path + '\\' + random_track
            p = vlc.MediaPlayer(random_track_fullpath)
            p.play()
            time.sleep(30)




        


        
        




