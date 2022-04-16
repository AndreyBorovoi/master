var request = require('request');

var options = {
  'method': 'GET',
  'url': 'http://localhost:3000/aiservice/request/fsgoyghuqr',
  'headers': {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "data": [
      [10,110],
      [0,0],
      [1,11],
      [1,1]
    ]
  })
};

const getRequest = () =>{
  const timeStart = Date.now();

  request(options, function (error, response) {
    if(error){
      console.log(error);
    }
    if(response){
      // console.log(JSON.parse(response.body).status);
      if(JSON.parse(response.body).status === 200){
        successful += 1
      }
      else{
        unsuccessful += 1
      }
      const timeFinish = Date.now();
      responseTime.push((timeFinish - timeStart))
    }
  });
}

const interval = 100
const countPerInterval = 50
const time = 5000

let intervals = 0
const responseTime = [];
let successful = 0
let unsuccessful = 0


let timerId = setInterval(() => {
  intervals += 1
  for (let index = 0; index < countPerInterval; index++) {
    // console.log('new request');
    getRequest()
  }
}, interval);

setTimeout(() => {
  clearTimeout(timerId)
}, time);

process.on('beforeExit', (code) => {
  console.log('Process beforeExit event with code: ', code);
  let sum = 0;
  for(let i=0; i < responseTime.length; i++) {
    sum += responseTime[i];
  }

  const allRequests = intervals*countPerInterval
  console.log(sum/responseTime.length);
  console.log(responseTime.length/allRequests, responseTime.length, allRequests);
  console.log('successful', successful);
  console.log('unsuccessful', unsuccessful);
});


