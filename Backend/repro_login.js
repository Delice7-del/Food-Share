const http = require('http');

const data = JSON.stringify({
    email: "test@example.com",
    password: "password123"
});

const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

async function makeRequest(i) {
    return new Promise((resolve) => {
        const req = http.request(options, (res) => {
            // confirm we are getting 200, 401 (invalid creds), or 429
            console.log(`Req ${i} STATUS: ${res.statusCode}`);
            res.resume(); // consume response to free up memory
            resolve();
        });

        req.on('error', (e) => {
            console.error(`Req ${i} error: ${e.message}`);
            resolve();
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    // Make enough requests to trigger rate limit if it's low (default was 100)
    // We'll try 110 rapid requests.
    for (let i = 0; i < 110; i++) {
        await makeRequest(i);
    }
}

run();
