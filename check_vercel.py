import urllib.request
import re

try:
    html = urllib.request.urlopen('https://www.motherslove.site/').read().decode('utf-8')
    js_files = re.findall(r'src="(/assets/index-[^"]+\.js)"', html)
    if js_files:
        js_url = 'https://www.motherslove.site' + js_files[0]
        js_content = urllib.request.urlopen(js_url).read().decode('utf-8')
        if '127.0.0.1:8000' in js_content:
            print('FOUND 127.0.0.1:8000 in JS bundle!')
        else:
            print('127.0.0.1:8000 NOT FOUND.')
            
        if 'motherslove.onrender.com' in js_content:
            print('FOUND motherslove.onrender.com in JS bundle!')
        else:
            print('motherslove.onrender.com NOT FOUND.')
except Exception as e:
    print('Error:', e)
