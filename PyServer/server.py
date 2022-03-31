from pymongo import MongoClient
import redis
import pickle
import os
import json
import time

if 'MODELID' in os.environ.keys():
	modelId = os.environ['MODELID']
else:
	modelId = 'sinervikby'

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

def main():
	while(True):
		error = ''
		print(f'requests-{modelId}')
		request_id_byte = redisClient.blpop(f'requests-{modelId}', 0)[1]

		start_time = time.time()

		request_id = request_id_byte.decode('utf-8')
		print(request_id)

		try:
			data_byte = redisClient.blpop(f'request-{request_id}-{modelId}', 2)[1]
		except Exception as e:
			responce = {'status': 'internal_error', 'error': 'data from redis is null'}
			redisClient.rpush(f'response-{request_id}-{modelId}', json.dumps(responce))
			continue

		data_str = data_byte.decode('utf-8')
		data = json.loads(data_str)
		print(data)

		try:
			predict = model.predict(data)
			print(predict)
		except Exception as e:
			error = e.__str__()

		delta = time.time() - start_time

		if error:
			responce = {'status': 'error', 'time': delta, 'error': error}
		else:
			responce = {'status': 'ok', 'time': delta, 'prediction': predict.tolist()}

		redisClient.rpush(f'response-{request_id}-{modelId}', json.dumps(responce))


redisClient = redis.Redis(redisUrl, redisPort)

try:
	mongo = MongoClient(connectionString)
	mainApiDB = mongo['MainApi']
	aiservicesCollection = mainApiDB['aiservices']
	service = aiservicesCollection.find_one({'modelId': modelId})

	if os.path.isfile('model'): 
		os.remove('model')

	with open('model', 'wb') as f:
		f.write(service['model'])

	model = pickle.load(open('model', 'rb'))

	if os.path.isfile('model'): 
		os.remove('model')
	
	print('ready')
except Exception as e:
		error = e.__str__()
		redisClient.rpush('errors', f'{modelId} - {error} in model loading')
		raise Exception

while(True):
	try:
		main()
	except Exception as e:
		error = e.__str__()
		redisClient.rpush('errors', f'{modelId} - {error} in execution')