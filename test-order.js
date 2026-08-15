const http = require('http');

const postData = JSON.stringify({
  customer_name: 'Live Test Order',
  medicine_list: [
    { medicine_id: 1, quantity: 5 }
  ]
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('RESPONSE:', data);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
