const http = require('http');

const data = JSON.stringify({
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    phone: "1234567890",
    subject: "Test Subject",
    message: "This is a test message to check for 500 errors."
});

const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/api/contact',
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
