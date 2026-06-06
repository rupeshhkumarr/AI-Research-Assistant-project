import urllib.request, json, os, urllib.error

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Load API key from environment for safety
key = os.environ.get('GOOGLE_API_KEY')
if not key:
    raise RuntimeError('GOOGLE_API_KEY is not set. Please create a .env file with GOOGLE_API_KEY="your_key" or set it in your terminal.')
models = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-flash-latest']
for m in models:
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={key}'
    req = urllib.request.Request(url, data=json.dumps({'contents':[{'parts':[{'text':'hi'}]}]}).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        urllib.request.urlopen(req)
        print(f'{m}: SUCCESS')
    except urllib.error.HTTPError as e:
        print(f'{m}: {e.read().decode()[:100]}')

