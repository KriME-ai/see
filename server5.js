const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = 5500;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public1'));

// Database setup
const db = new sqlite3.Database('./ebook_platform.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create tables if not exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user'
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            price REAL,
            file_url TEXT NOT NULL,
            uploaded_by INTEGER,
            FOREIGN KEY (uploaded_by) REFERENCES users (id)
        )
    `);
});

// Default admin account setup
const defaultAdmin = {
    username: 'Admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
};

db.serialize(() => {
    db.get('SELECT * FROM users WHERE role = "admin"', (err, admin) => {
        if (!admin) {
            bcrypt.hash(defaultAdmin.password, 10, (err, hashedPassword) => {
                if (err) console.error('Error hashing admin password:', err.message);
                db.run(
                    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                    [defaultAdmin.username, defaultAdmin.email, hashedPassword, defaultAdmin.role],
                    (err) => {
                        if (err) {
                            console.error('Error creating default admin:', err.message);
                        } else {
                            console.log('Default admin account created.');
                        }
                    }
                );
            });
        } else {
            console.log('Admin account already exists.');
        }
    });
});

// Helper functions
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(403).send('Access denied.');

    jwt.verify(token, 'secret_key', (err, decoded) => {
        if (err) return res.status(403).send('Invalid token.');
        req.user = decoded;
        next();
    });
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Access denied. Admins only.');
    }
    next();
};

// Multer setup for file uploads
const upload = multer({
    dest: './uploads', // Save files to the 'uploads' folder
});

// Routes

// Signup route
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
            [username, email, hashedPassword],
            (err) => {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(409).send('User already exists.');
                    }
                    return res.status(500).send('Internal Server Error.');
                }
                res.status(201).send('Signup successful.');
            }
        );
    } catch (error) {
        res.status(500).send('An error occurred during signup.');
    }
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) {
            return res.status(401).send('Invalid email or password.');
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).send('Invalid email or password.');
        }

        const token = jwt.sign({ id: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });
        res.json({ message: 'Login successful!', token, role: user.role });
    });
});

// Check admin status
app.get('/isAdmin', authenticateToken, (req, res) => {
    res.status(200).send({ isAdmin: req.user.role === 'admin' });
});

// Admin panel route
app.get('/admin', authenticateToken, authorizeAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html')); // Ensure 'admin.html' exists in the project root
});

app.post('/upload', authenticateToken, authorizeAdmin, upload.single('file'), (req, res) => {
    const { title, description, price } = req.body;
    const filePath = req.file?.path || '/uploads/default.pdf';

    db.run(
        `INSERT INTO books (title, description, price, file_url, uploaded_by) VALUES (?, ?, ?, ?, ?)`,
        [title, description, price, filePath, req.user.id],
        (err) => {
            if (err) return res.status(500).send('Failed to upload book.');
            res.status(201).send('Book uploaded successfully.');
        }
    );
});

// Fetch book details by ID
app.get('/book/:id', (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM books WHERE id = ?`, [id], (err, book) => {
        if (err) {
            return res.status(500).send('Error fetching book details.');
        }
        if (!book) {
            return res.status(404).send('Book not found.');
        }
        res.json(book);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});