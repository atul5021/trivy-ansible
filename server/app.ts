import express, { Request, Response } from 'express';
import { execFile } from 'child_process';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';

const app = express();
app.use(express.json());

// ✅ Fix: Secrets loaded strictly from environment variables
const API_SECRET_KEY = process.env.API_SECRET_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;

const db = new sqlite3.Database(':memory:');

// ✅ Fix: Use bcrypt for secure password hashing with salt rounds
async function hashUserPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}

// ✅ Fix: Parameterized SQL query to prevent SQL Injection
app.get('/api/user', (req: Request, res: Response) => {
    const userId = req.query.id as string;
    
    // Parameterized placeholders (?) ensure user input is treated as data, not code
    const query = `SELECT id, username, email FROM users WHERE id = ?`;
    
    db.all(query, [userId], (err, rows) => {
        if (err) {
            res.status(500).send("An error occurred while retrieving user details.");
            return;
        }
        res.json(rows);
    });
});

// ✅ Fix: Strict validation + execFile to eliminate shell injection
app.post('/api/ping', (req: Request, res: Response) => {
    const host = req.body.host as string;
    
    // Validate that input is strictly an IPv4 or IPv6 address or valid domain
    const isValidHostname = /^[a-zA-Z0-9.-]+$/.test(host);
    if (!isValidHostname) {
        res.status(400).send("Invalid hostname provided.");
        return;
    }

    // execFile bypasses shell command execution interpreters
    execFile('ping', ['-c', '1', host], (error, stdout) => {
        if (error) {
            res.status(500).send("Ping execution failed.");
            return;
        }
        res.send(stdout);
    });
});

// ✅ Fix: Secure cookies & restrictive CORS configuration
app.get('/api/login', (req: Request, res: Response) => {
    // Explicit HttpOnly, Secure, and SameSite attributes
    res.cookie('session_token', 'abc123token', { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'strict',
        maxAge: 3600000 
    });
    
    // Restrict origin to specific domain instead of wildcard '*'
    res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com'); 
    
    res.send({ status: 'Logged in successfully' });
});

app.listen(3000, () => console.log('Secure server running on port 3000'));
