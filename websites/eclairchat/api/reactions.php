<?php

require_once  __DIR__ . '/../includes/db.php';

$message_id = intval($_GET['id'] ?? 0);

$stmt = $db->prepare('
    SELECT emoji, COUNT(*) as count
    FROM reactions
    WHERE message_id = ?
    GROUP BY emoji
');
$stmt->execute([$message_id]);
$reactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($reactions);