DROP TABLE IF EXISTS api_keys;
DROP TABLE IF EXISTS users;

-- Tabel untuk menyimpan data pengguna (Admin & User)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user', -- 'admin' atau 'user'
    status TEXT DEFAULT 'pending', -- 'pending', 'active', 'rejected'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk menyimpan API Key dan Limit
CREATE TABLE api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    api_key TEXT UNIQUE NOT NULL,
    daily_limit INTEGER DEFAULT 100,
    usage_count INTEGER DEFAULT 0,
    last_reset DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Default Super Admin
INSERT INTO users (name, email, password, role, status) 
VALUES ('Super Admin', 'admin@melolo.com', 'admin123', 'admin', 'active');
