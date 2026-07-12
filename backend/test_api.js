/*const http = require('http');

const run = async () => {
    // Register
    await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test_admin@test.com', password: 'password', name: 'Test', role: 'Fleet Manager' })
    });
    
    // Login
    const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test_admin@test.com', password: 'password' })
    });
    const data = await res.json();
    const token = data.token;
    console.log("Logged in:", !!token);

    const endpoints = ['vehicles', 'drivers', 'trips', 'maintenance', 'expenses', 'fuel'];
    for (const ep of endpoints) {
        const epRes = await fetch('http://localhost:5000/api/' + ep, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const text = await epRes.text();
        console.log(`\n--- ${ep.toUpperCase()} [${epRes.status}] ---`);
        console.log(text.substring(0, 200) + (text.length > 200 ? '...' : ''));
    }
};
run();
*/