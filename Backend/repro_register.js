const http = require('http');

const data = JSON.stringify({
    firstName: "Test",
    lastName: "Donor",
    email: "newdonor@example.com",
    password: "password123",
    phone: "(555) 987-6543",
    role: "donor",
    organization: "Helping Hands"
});

const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
