
import os
import uuid
import time;
import json;


obj = {}
obj['sounds'] = []

for filename in os.listdir('../project/upload/sounds'):
    if filename.endswith(".mp3"):
      song = {}
      song['key'] = str(uuid.uuid4())
      song['name'] = filename.replace("_", " ").replace(".mp3","").decode('latin-1')
      song['path'] = filename.decode('latin-1')
      obj['sounds'].append(song)

    else:
        continue


obj['lastUpdated'] = int(time.time() * 1000)
out = json.dumps(obj)


with open('../project/upload/overview.json', 'w') as f:
  f.write(out)
  f.close()
print("finished")

