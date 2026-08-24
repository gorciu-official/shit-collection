<?php
$db = new PDO('sqlite:' . __DIR__ . '/../db.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$db->exec("PRAGMA foreign_keys = ON;");

$schema = "
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    is_admin INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    topic TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    position INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY,
    author_id INTEGER NOT NULL,
    channel_id INTEGER NOT NULL,
    content TEXT,
    reference_msg_id INTEGER,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    edited_at INTEGER,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (reference_msg_id) REFERENCES messages(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY,
    message_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT,
    file_size INTEGER,
    file_url TEXT NOT NULL,
    uploaded_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reactions (
    id INTEGER PRIMARY KEY,
    message_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    emoji TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (message_id, user_id, emoji)
);

CREATE TABLE IF NOT EXISTS ip_bans (
    id INTEGER PRIMARY KEY,
    ip TEXT NOT NULL
);
";

function addColumnIfNotExists(PDO $db, string $table, string $column, string $definition): void {
    $driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);

    if ($driver === 'sqlite') {
        $stmt = $db->prepare("PRAGMA table_info(`$table`)");
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN, 1); 
        if (in_array($column, $columns)) {
            return;
        }
    } else {
        $stmt = $db->prepare("SHOW COLUMNS FROM `$table` LIKE ?");
        $stmt->execute([$column]);
        if ($stmt->rowCount() > 0) {
            return;
        }
    }

    $sql = "ALTER TABLE `$table` ADD COLUMN `$column` $definition";
    $db->exec($sql);
}

$db->exec($schema);

addColumnIfNotExists($db, 'users', 'ip', 'TEXT');
addColumnIfNotExists($db, 'users', 'discord_id', "TEXT NOT NULL DEFAULT '0'");
?>
