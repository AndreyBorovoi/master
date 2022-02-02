from flask import Flask
from flask import request
import os

app = Flask(__name__)

if 'PORT' in os.environ.keys():
	PORT = os.environ['PORT']
else:
	PORT = 5000

@app.route('/', methods=['GET'])
def main():
  return {'params': request.json, 'port': PORT}


if __name__ == '__main__':
	app.run(debug=True, host='0.0.0.0', port=PORT)