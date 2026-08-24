<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/ban.php';
require_login();

$user = current_user();

function get_client_ip(): string {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($parts[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

$client_ip = get_client_ip();

if (isIpBanned($db, $client_ip, $user)) {
    session_destroy();
    session_unset();
    require_login();
}

function is_emoji(string $str): bool {
    if ($str === '') return false;
    if (mb_strlen($str, 'UTF-8') > 8) return false;
    return (bool)preg_match('/^\p{Emoji}+$/u', $str);
}

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['react'])) {
    $message_id = filter_input(INPUT_POST, 'message_id', FILTER_VALIDATE_INT);
    $emoji = isset($_POST['emoji']) ? trim($_POST['emoji']) : '';

    if ($message_id === false || $message_id === null || $message_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Niepoprawne message_id']);
        exit;
    }

    if (!is_emoji($emoji)) {
        http_response_code(400);
        echo json_encode(['error' => 'Niepoprawna reakcja — użyj emoji']);
        exit;
    }

    $stmt = $db->prepare('SELECT 1 FROM messages WHERE id = ?');
    $stmt->execute([$message_id]);
    if (!$stmt->fetchColumn()) {
        http_response_code(404);
        echo json_encode(['error' => 'Wiadomość nie istnieje']);
        exit;
    }

    $stmt = $db->prepare('SELECT 1 FROM reactions WHERE message_id = ? AND user_id = ? AND emoji = ?');
    $stmt->execute([$message_id, $user['id'], $emoji]);
    $exists = (bool)$stmt->fetchColumn();

    if ($exists) {
        $stmt = $db->prepare('DELETE FROM reactions WHERE message_id = ? AND user_id = ? AND emoji = ?');
        $stmt->execute([$message_id, $user['id'], $emoji]);
    } else {
        $stmt = $db->prepare('INSERT OR IGNORE INTO reactions (message_id, user_id, emoji) VALUES (?, ?, ?)');
        $stmt->execute([$message_id, $user['id'], $emoji]);
    }

    echo json_encode(['success' => true]);
    exit;
}

if (isset($_GET['fetch']) && isset($_GET['channel_id'])) {
    $channel_id = filter_var($_GET['channel_id'], FILTER_VALIDATE_INT);
    if ($channel_id === false || $channel_id === null || $channel_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Niepoprawne channel_id']);
        exit;
    }

    $from_id = isset($_GET['from_id']) ? filter_var($_GET['from_id'], FILTER_VALIDATE_INT) : 0;
    $before_id = isset($_GET['before_id']) ? filter_var($_GET['before_id'], FILTER_VALIDATE_INT) : 0;

    $conditions = ['messages.channel_id = ?'];
    $params = [$channel_id];

    if ($from_id && $from_id > 0) {
        $conditions[] = 'messages.id > ?';
        $params[] = $from_id;
    }
    if ($before_id && $before_id > 0) {
        $conditions[] = 'messages.id < ?';
        $params[] = $before_id;
    }

    $sql = 'SELECT messages.id, messages.content, messages.author_id, users.username, users.display_name, users.avatar_url, messages.created_at, messages.channel_id
            FROM messages
            JOIN users ON messages.author_id = users.id
            WHERE ' . implode(' AND ', $conditions) . '
            ORDER BY messages.id ASC
            LIMIT 500';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($messages)) {
        echo json_encode([]);
        exit;
    }

    $ids = array_column($messages, 'id');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $intIds = array_map('intval', $ids);

    $reactionsStmt = $db->prepare("
        SELECT message_id, emoji, COUNT(*) as count
        FROM reactions
        WHERE message_id IN ($placeholders)
        GROUP BY message_id, emoji
    ");
    foreach ($intIds as $k => $v) {
        $reactionsStmt->bindValue($k + 1, $v, PDO::PARAM_INT);
    }
    $reactionsStmt->execute();
    $reactions = $reactionsStmt->fetchAll(PDO::FETCH_ASSOC);

    $map = [];
    foreach ($reactions as $r) {
        $map[(int)$r['message_id']][] = ['emoji' => $r['emoji'], 'count' => (int)$r['count']];
    }

    $attachmentsStmt = $db->prepare("
        SELECT message_id, file_name, mime_type, file_url
        FROM attachments
        WHERE message_id IN ($placeholders)
    ");
    foreach ($intIds as $k => $v) {
        $attachmentsStmt->bindValue($k + 1, $v, PDO::PARAM_INT);
    }
    $attachmentsStmt->execute();
    $attachments = $attachmentsStmt->fetchAll(PDO::FETCH_ASSOC);

    $attMap = [];
    foreach ($attachments as $a) {
        $attMap[(int)$a['message_id']][] = [
            'file_name' => $a['file_name'],
            'mime_type' => $a['mime_type'],
            'file_url' => $a['file_url']
        ];
    }

    foreach ($messages as &$m) {
        $mid = (int)$m['id'];
        $m['reactions'] = $map[$mid] ?? [];
        $m['attachments'] = $attMap[$mid] ?? [];
    }

    echo json_encode($messages, JSON_UNESCAPED_UNICODE);
    exit;
}

if (isset($_GET['change_password'])) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Metoda niedozwolona']);
        exit;
    }
    $passwd = isset($_POST['passwd']) ? (string)$_POST['passwd'] : '';
    if (mb_strlen($passwd, 'UTF-8') < 8 || mb_strlen($passwd, 'UTF-8') > 256) {
        http_response_code(400);
        echo json_encode(['error' => 'Hasło musi mieć co najmniej 8 znaków']);
        exit;
    }
    $hash = password_hash($passwd, PASSWORD_ARGON2ID);
    if ($hash === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Błąd hashowania']);
        exit;
    }
    $stmt = $db->prepare('UPDATE users SET password_hash = ? WHERE username = ?');
    $stmt->execute([$hash, $user['username']]);
    echo json_encode(['success' => true]);
    exit;
}

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title><?=$configuration_chat_name?></title>
    <meta property="og:title" content="<?=$configuration_chat_name?>">
    <meta name="description" content="Czatuj na <?=$configuration_chat_name?>">
    <meta property="og:description" content="Czatuj na <?=$configuration_chat_name?>">
    <link rel="stylesheet" href="/css/global.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
<div class="chat">
    <div class="sidebar" id="channels"></div>
    <div class="main">
        <div class="chat-messages" id="messages">
            <div style="text-align:center;display:flex;flex-direction:column;align-items:center;">
                <h1>Witaj w <?=$configuration_chat_name?></h1>
                <p>Wybierz kanał, aby zacząć rozmawiać!</p>
            </div>
        </div>
        <form id="msgForm">
            <button type="button" id="attach-btn"><i class="fa-solid fa-paperclip"></i></button>
            <input type="text" id="msgInput" name="message" placeholder="Napisz wiadomość..." autocomplete="off">
            <div class="cf-turnstile" data-sitekey="0x4AAAAAAB6qOABomZLXAWum"></div>
            <button type="submit"><i class="fa-solid fa-paper-plane"></i></button>
        </form>
    </div>
</div>
<script>
    var user = <?=json_encode($user)?>;
    window.isAdmin = <?php echo !empty($user['is_admin']) ? 'true' : 'false'; ?>;
</script>
<script src="/js/chat.js?nocache=<?php echo time(); ?>" type="module"></script>
<script
  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
  async
  defer
></script>
</body>
</html>