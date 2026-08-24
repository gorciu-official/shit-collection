<?php

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/security.php';
require_login();

$user = current_user();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['message'], $_POST['channel_id'], $_POST['replies_to'])) {
    echo json_encode(['success' => false, 'error' => "No message or wrong method."]);
    exit;
}

$msg = trim($_POST['message']);
$channel_id = (int)$_POST['channel_id'];
$replies_to = (int)$_POST['replies_to'];

if ($replies_to == 0) {
    $replies_to = null;
}

if ($msg === '' && empty($_POST['attachment_urls'])) {
    echo json_encode(['success' => false, 'error' => 'Nie można wysłać pustej wiadomości.']);
    exit;
}

$stmtLast = $db->prepare('
    SELECT content, created_at FROM messages
    WHERE author_id = ? AND channel_id = ?
    ORDER BY created_at DESC
    LIMIT 1
');
$stmtLast->execute([$user['id'], $channel_id]);
$lastMessage = $stmtLast->fetch(PDO::FETCH_ASSOC);

if ($lastMessage) {
    $lastTimestamp = (int)$lastMessage['created_at'];
    if (time() - $lastTimestamp < 2 && !is_admin($user)) { 
        echo json_encode(['success' => false, 'error' => 'Nie możesz wysłać wiadomości tak szybko.']);
        exit;
    }
}

$stmtCheck = $db->prepare('
    SELECT COUNT(*) FROM messages
    WHERE author_id = ? AND channel_id = ? AND content = ? AND created_at >= DATETIME("now", "-10 minutes")
');
$stmtCheck->execute([$user['id'], $channel_id, $msg]);
$count = (int)$stmtCheck->fetchColumn();

if ($count >= 3) {
    echo json_encode(['success' => false, 'error' => 'Zbyt wiele takich samych wiadomości.']);
    exit;
}

function isFloodMessage(string $msg, int $maxRepeats = 3): bool {
    $words = preg_split('/\s+/', strtolower($msg)); 
    $counts = [];
    foreach ($words as $w) {
        if ($w === '') continue;
        $counts[$w] = ($counts[$w] ?? 0) + 1;
        if ($counts[$w] > $maxRepeats) {
            return true; 
        }
    }
    return false;
}

if (isFloodMessage($msg, 4)) {
    echo json_encode(['success' => false, 'error' => 'Flood...']);
    exit;
}

if (!validateTurnstile($_POST['cf-turnstile-response'] ?? '', $configuration_cloudflare_secret, $_SERVER['REMOTE_ADDR'])['success']) {
    echo json_encode(['success' => false, 'error' => 'Cloudflare myśli że jesteś botem. Pewnie ma rację.']);
    exit;
}

// sr i don't like this but this is required ig
$db->prepare('UPDATE users SET ip = ? WHERE username = ?')->execute([$_SERVER['REMOTE_ADDR'], $user['username']]);

$shadowBanned = in_array($user['username'], $configuration_shadow_banned);

if (!$shadowBanned) {
    $db->beginTransaction();

    $stmt = $db->prepare('INSERT INTO messages (author_id, channel_id, content, reference_msg_id) VALUES (?, ?, ?, ?)');
    $stmt->execute([$user['id'], $channel_id, $msg, $replies_to]);
    $message_id = $db->lastInsertId();

    $attachments = [];
    if (!empty($_POST['attachment_urls']) && is_array($_POST['attachment_urls'])) {
        $stmtAttach = $db->prepare('INSERT INTO attachments (message_id, file_name, file_url) VALUES (?, ?, ?)');
        foreach ($_POST['attachment_urls'] as $url) {
            $filename = basename(parse_url($url, PHP_URL_PATH));
            $stmtAttach->execute([$message_id, $filename, $url]);
            $attachments[] = $url;
        }
    }

    $db->commit();

    if ($configuration_shall_send_webhook) {
        $channel_stmt = $db->prepare('SELECT name FROM channels WHERE id = ?');
        $channel_stmt->execute([$channel_id]);
        $channel_name = $channel_stmt->fetchColumn();

        $avatar_stmt = $db->prepare('SELECT avatar_url FROM users WHERE id = ?');
        $avatar_stmt->execute([$user['id']]);
        $avatar_url = $avatar_stmt->fetchColumn() ?? 'https://files.catbox.moe/fxlx35.gif';

        $embeds = [];
        foreach ($attachments as $url) {
            $embeds[] = ['image' => ['url' => $url]];
        }

        $payload = json_encode([
            'username' => $user['display_name'] ?? $user['username'],
            'content' => "`#$channel_name` na [EclairChat](<http://eclairchat.x10.network/>): $msg",
            'embeds' => $embeds,
            'allowed_mentions' => ['parse' => []],
            'avatar_url' => $avatar_url
        ]);

        $ch = curl_init($configuration_webhook_url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_exec($ch);
        curl_close($ch);
    }
}

echo json_encode(['success' => true]);
exit;