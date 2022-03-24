from pymongo import MongoClient
import redis
import pickle
import os
import json

if 'MODELID' in os.environ.keys():
	modelId = os.environ['MODELID']
else:
	modelId = 'vxgjdqwtip'

if 'MONGODB' in os.environ.keys():
	connectionString = os.environ['MONGODB']
else:
	connectionString = 'mongodb+srv://testuser:testuser@cluster0.og9pt.mongodb.net/MainApi?retryWrites=true&w=majority'

if 'REDIS_URL' in os.environ.keys():
	redisUrl = os.environ['REDIS_URL']
else:
	redisUrl = 'localhost'

if 'REDIS_PORT' in os.environ.keys():
	redisPort = os.environ['REDIS_PORT']
else:
	redisPort = '6379'

mongo = MongoClient(connectionString)
mainApiDB = mongo['MainApi']
aiservicesCollection = mainApiDB['aiservices']
service = aiservicesCollection.find_one({"modelId": modelId})

with open('model', 'wb') as f:
	f.write(service['model'])

model = pickle.load(open('model', 'rb'))

redisClient = redis.Redis(redisUrl, redisPort)

print('ready')

while(True):
	data_byte = redisClient.blpop(f'request-{modelId}', 0)[1]
	print(data_byte)
	data_str = data_byte.decode('utf-8')
	print(data_str)
	data = json.loads(data_str)
	print(data)
	predict = model.predict(data)
	print(predict)
	redisClient.rpush(f'response-{modelId}', json.dumps(predict.tolist()))
