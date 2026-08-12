import express, { Request, Response } from 'express';
import { exec } from 'child_process';
import crypto from 'crypto';
import sqlite3 from 'sqlite3';

const app = express();
app.use(express.json());

// 🚨 SonarQube Rule: Hardcoded credentials (Security Vulnerability / Hotspot)
const API_SECRET_KEY = "super_secret_aws_key_1234567890_abcdef";
const DB_PASSWORD = "admin_password123";

const db = new sqlite3.Database(':memory:');

// 🚨 Rule: Weak hashing algorithm (MD5 / SHA1)
function hashUserPassword(password: string): string {
    return crypto.createHash('md5').update(password).digest('hex'); // Vulnerability: Weak Cryptography
}

// 🚨 Rule: SQL Injection (Unsanitized query concatenation)
app.get('/api/user', (req: Request, res: Response) => {
    const userId = req.query.id as string;
    
    // Direct string interpolation into SQL query
    const query = `SELECT * FROM users WHERE id = '${userId}'`;
    
    db.all(query, [], (err, rows) => {
        if (err) res.status(500).send(err.message);
        res.json(rows);
    });
});

// 🚨 Rule: Command Injection / Remote Code Execution
app.post('/api/ping', (req: Request, res: Response) => {
    const host = req.body.host;
    
    // Executing system commands with raw user input
    exec(`ping -c 1 ${host}`, (error, stdout) => {
        if (error) {
            res.status(500).send(error.message);
            return;
        }
        res.send(stdout);
    });
});

// 🚨 Rule: Insecure Cookie / Hardcoded JWT Secret & Weak CORS
app.get('/api/login', (req: Request, res: Response) => {
    // Missing HttpOnly and Secure flags on sensitive cookie
    res.cookie('session_token', 'abc123token', { httpOnly: false, secure: false });
    
    // Wildcard CORS origin is a Security Hotspot
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    
    res.send({ status: 'Logged in' });
});

app.listen(3000, () => console.log('Insecure server running on port 3000'));
