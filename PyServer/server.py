from flask import Flask
from flask import request

from pymongo import MongoClient

import pickle
import os


CONNECTION_STRING = "mongodb+srv://testuser:testuser@cluster0.og9pt.mongodb.net/MainApi?retryWrites=true&w=majority"
mongo = MongoClient(CONNECTION_STRING)
mainApiDB = mongo['MainApi']
aiservicesCollection = mainApiDB['aiservices']

# modelId = os.environ['MODELID']
modelId = 'vxgjdqwtip'
service = aiservicesCollection.find_one({"modelId": modelId})

with open('model', 'wb') as f:
	f.write(service['model'])

loaded_model = pickle.load(open('model', 'rb'))
print(loaded_model.coef_)

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