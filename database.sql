-- Step 1: Create a new table
CREATE TABLE users_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL
);

-- Step 2: Copy data from old table
INSERT INTO users_new (id, username, email, password, role)
SELECT id, username, email, password, role FROM users;

-- Step 3: Drop the old table
DROP TABLE users;

-- Step 4: Rename the new table
ALTER TABLE users_new RENAME TO users;

