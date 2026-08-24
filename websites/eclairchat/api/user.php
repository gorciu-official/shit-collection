<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/config.php';

require_login();
$user = current_user();

function json_error($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['success'=>false,'error'=>$msg]);
    exit;
}

function json_success($data = []) {
    echo json_encode(array_merge(['success'=>true], $data));
    exit;
}

// Pobierz dane użytkownika
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = [
        'id' => $user['id'],
        'username' => $user['username'],
        'avatar_url' => $user['avatar_url'] ?? null,
        'discord_id' => $user['discord_id'],
        'created_at' => $user['created_at'],
        'display_name' => $user['display_name'] ?? 'Tak zwany ' . $user['username']
    ];
    json_success(['user'=>$data]);
}

// Zmień avatar
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['avatar'])) {
    $file = $_FILES['avatar'];

    if ($file['error'] !== UPLOAD_ERR_OK) json_error('Upload error code: ' . $file['error']);

    $allowed = ['image/png','image/jpeg','image/webp','image/gif'];
    if (!in_array($file['type'], $allowed)) json_error('Nieobsługiwany typ pliku');

    $ch = curl_init('https://catbox.moe/user/api.php');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => ['User-Agent: ChatUploader/1.0'],
        CURLOPT_POSTFIELDS => [
            'reqtype' => 'fileupload',
            'fileToUpload' => curl_file_create($file['tmp_name'], $file['type'], $file['name']),
        ],
    ]);
    $response = curl_exec($ch);
    $error = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if (!$response || $error || $httpCode !== 200) json_error($error ?: "HTTP $httpCode");

    $avatar_url = trim($response);

    $stmt = $db->prepare('UPDATE users SET avatar_url = ? WHERE id = ?');
    $stmt->execute([$avatar_url, $user['id']]);

    // Aktualizacja zmiennej $user
    $user['avatar_url'] = $avatar_url;

    json_success(['avatar' => $avatar_url]);
}

// Update username
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['update_username'])) {
    $newUsername = trim($_POST['username'] ?? '');
    if ($newUsername === '' || mb_strlen($newUsername) > 50 || !ctype_alnum($newUsername)) {
        json_error('Niepoprawna nazwa użytkownika. Musi być alfanumeryczna i <= 50 znaków.');
    }

    $stmt = $db->prepare('SELECT id FROM users WHERE username = ? AND id != ?');
    $stmt->execute([$newUsername, $user['id']]);
    if ($stmt->fetch()) json_error('Nazwa użytkownika jest już zajęta.');

    $stmt = $db->prepare('UPDATE users SET username = ? WHERE id = ?');
    $stmt->execute([$newUsername, $user['id']]);

    $user['username'] = $newUsername; // aktualizacja zmiennej
    json_success(['username' => $newUsername]);
} 

// Update display_name
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['update_display_name'])) {
    $newDisplayName = trim($_POST['display_name'] ?? '');
    if ($newDisplayName === '' || mb_strlen($newDisplayName) > 100) {
        json_error('Niepoprawny display name. Musi mieć <= 100 znaków.');
    }

    $stmt = $db->prepare('UPDATE users SET display_name = ? WHERE id = ?');
    $stmt->execute([$newDisplayName, $user['id']]);

    $user['display_name'] = $newDisplayName; // aktualizacja zmiennej
    json_success(['display_name' => $newDisplayName]);
}

// Update password – tutaj nie ma potrzeby aktualizacji $user, bo hasło nie jest w użyciu

// Zmień hasło
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['update_password'])) {
    $current = $_POST['current_password'] ?? '';
    $new = $_POST['new_password'] ?? '';

    if (!password_verify($current, $user['password_hash'])) json_error('Błędne aktualne hasło');
    if (strlen($new) < 6) json_error('Hasło musi mieć min. 6 znaków');

    $hash = password_hash($new,PASSWORD_DEFAULT);
    $stmt = $db->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    $stmt->execute([$hash,$user['id']]);

    json_success();
}

json_error('Nieznana akcja', 404);
