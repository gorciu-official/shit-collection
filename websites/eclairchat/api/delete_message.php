<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_login();

$user = current_user();

if ($_SERVER['REQUEST_METHOD'] !== 'GET' || !isset($_GET['id'])) {
    echo json_encode(['success' => false, 'error' => 'Nieprawidłowe żądanie.']);
    exit;
}

$message_id = (int)$_GET['id'];

$stmt = $db->prepare('SELECT author_id FROM messages WHERE id = ?');
$stmt->execute([$message_id]);
$message = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$message) {
    echo json_encode(['success' => false, 'error' => 'Nie znaleziono wiadomości.']);
    exit;
}

if ($message['author_id'] !== $user['id'] && !$user['is_admin']) {
    echo json_encode(['success' => false, 'error' => 'Brak uprawnień do usunięcia tej wiadomości.']);
    exit;
}

$stmt = $db->prepare('DELETE FROM attachments WHERE message_id = ?');
$stmt->execute([$message_id]);

$stmt = $db->prepare('DELETE FROM messages WHERE id = ?');
$stmt->execute([$message_id]);

echo json_encode(['success' => true]);
