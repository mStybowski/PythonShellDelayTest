import json
import sys

for line in sys.stdin:
    clean = ''.join(line.split())  # remove all white characters
    timestamp = json.loads(clean)['timestamp']
    print(timestamp)
