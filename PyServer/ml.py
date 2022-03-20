from sklearn import linear_model
from random import random 
import pickle

model = linear_model.LinearRegression()
x = [ [i + random(), i + random()] for i in range(0, 100)]
#y=x1+x2
y = [i[0] + i[1] + random() for i in x]
# print(x)
# print(y)
model.fit(x, y)
print(model.coef_)
pickle.dump(model, open('model', 'wb'))

loaded_model = pickle.load(open('model', 'rb'))
print(loaded_model.coef_)