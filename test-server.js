const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'test-app')));

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-app', 'login.html'));
});

app.get('/secure', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-app', 'secure.html'));
});

app.get('/forgot-password', (req, res) => {
    res.send(`
        <html>
            <head><title>Password Recovery</title></head>
            <body>
                <h1>Password Recovery</h1>
                <p>Password recovery functionality would be here.</p>
                <a href="/login">Back to Login</a>
            </body>
        </html>
    `);
});

app.get('/register', (req, res) => {
    res.send(`
        <html>
            <head><title>Registration</title></head>
            <body>
                <h1>User Registration</h1>
                <p>User registration functionality would be here.</p>
                <a href="/login">Back to Login</a>
            </body>
        </html>
    `);
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Test server running on http://localhost:${PORT}`);
        console.log(`📝 Login page: http://localhost:${PORT}/login`);
        console.log(`🔐 Valid credentials: tomsmith / SuperSecretPassword!`);
    });
}

module.exports = app;
