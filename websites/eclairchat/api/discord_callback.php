<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/config.php';
@@session_start();

$username = $_SESSION['user_creditentials_register_username'] ?? '';
$password = $_SESSION['user_creditentials_register_password'] ?? '';

if ($username === '' || $password === '') {
    $error = 'Niepoprawne dane rejestracji.';
    require_once __DIR__ . '/../routes/login.php';
    exit;
}

if (strlen($username) < 3 || strlen($username) > 32) {
    $error = 'Nazwa użytkownika musi mieć od 3 do 32 znaków.';
    require_once __DIR__ . '/../routes/login.php';
    exit;
}

if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    $error = 'Nazwa użytkownika może zawierać tylko litery, cyfry i _.';
    require_once __DIR__ . '/../routes/login.php';
    exit;
}

if (strlen($password) < 6) {
    $error = 'Hasło musi mieć co najmniej 6 znaków.';
    require_once __DIR__ . '/../routes/login.php';
    exit;
}

if (!isset($_GET['code']) || trim($_GET['code']) === '') {
    http_response_code(400);
    $error = 'Brak kodu autoryzacyjnego Discord.';
    require_once __DIR__ . '/../routes/login.php';
    exit;
}

$code = $_GET['code'];

$token_request = curl_init('https://discord.com/api/oauth2/token');
curl_setopt_array($token_request, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query([
        'client_id' => $discord_client_id,
        'client_secret' => $discord_client_secret,
        'grant_type' => 'authorization_code',
        'code' => $code,
        'redirect_uri' => $discord_redirect_uri,
    ]),
    CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded']
]);

$response = curl_exec($token_request);

if ($response === false) {
    $error = 'Nie udało się połączyć z Discord.';
    require_once __DIR__ . '/../routes/login.php';
    exit;
}
curl_close($token_request);

$token_data = json_decode($response, true);
if (!is_array($token_data) || !isset($token_data['access_token'])) {
    $error = 'Nie udało się uzyskać tokenu Discord. (' . htmlspecialchars($response) . ')';
    require_once __DIR__ . '/../routes/login.php';
    exit;
}

$access_token = $token_data['access_token'];

$user_request = curl_init('https://discord.com/api/users/@me');
curl_setopt_array($user_request, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ["Authorization: Bearer $access_token"]
]);
$user_info_json = curl_exec($user_request);
curl_close($user_request);

$user_info = json_decode($user_info_json, true);
if (!is_array($user_info) || !isset($user_info['id'])) {
    $error = 'Nie udało się pobrać danych użytkownika Discord.';
    require_once __DIR__ . '/../routes/login.php';
    exit;
}

$guilds_request = curl_init('https://discord.com/api/users/@me/guilds');
curl_setopt_array($guilds_request, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ["Authorization: Bearer $access_token"]
]);
$guilds_json = curl_exec($guilds_request);
curl_close($guilds_request);

$guilds = json_decode($guilds_json, true);
$in_server = false;

if (is_array($guilds)) {
    foreach ($guilds as $guild) {
        if (isset($guild['id']) && $guild['id'] === $configuration_server_id) {
            $in_server = true;
            break;
        }
    }
}

if (!$in_server) {
    $error = 'Musisz być na serwerze Discord, aby się zarejestrować.';
    require_once __DIR__ . '/../routes/login.php';
    exit;
}

$discord_id = $user_info['id'];
$stmt = $db->prepare('SELECT * FROM users WHERE discord_id = ?');
$stmt->execute([$discord_id]);
$existing_user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($existing_user) {
    $_SESSION['user'] = $existing_user;
    header('Location: /');
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $db->prepare('INSERT INTO users (username, password_hash, ip, discord_id) VALUES (?, ?, ?, ?)');
    $stmt->execute([$username, $hash, $_SERVER['REMOTE_ADDR'], $discord_id]);

    $stmt = $db->prepare('SELECT * FROM users WHERE discord_id = ?');
    $stmt->execute([$discord_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    $_SESSION['user'] = $user;

    unset($_SESSION['user_creditentials_register_username']);
    unset($_SESSION['user_creditentials_register_password']);

    header('Location: /');
    exit;
} catch (PDOException $e) {
    $error = 'Nazwa użytkownika jest już zajęta lub konto Discord istnieje.';
    require_once __DIR__ . '/../routes/login.php';
    exit;
}
?>