<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/ban.php';
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/security.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';


    $stmt = $db->prepare('SELECT * FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!validateTurnstile($_POST['cf-turnstile-response'] ?? '', $configuration_cloudflare_secret, $_SERVER['REMOTE_ADDR'])['success']) {
        $error = "A skąd mam wiedzieć ty baranie czy robotem nie jesteś?";
    } else if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user'] = $user;
        header('Location: /');
        exit;
    } else {
        $error = "Nieprawidłowy login lub hasło.";
    }
}
?>
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Logowanie</title>
    <link rel="stylesheet" href="/css/global.css">
</head>
<body>
<div class="container">
    <h1>💬 Logowanie</h1>
    <form method="POST">
        <input type="text" name="username" placeholder="Nazwa użytkownika" required>
        <input type="password" name="password" placeholder="Hasło" required>
        <div class="cf-turnstile" data-sitekey="0x4AAAAAAB6qOABomZLXAWum"></div>
        <button type="submit">Zaloguj</button>
    </form>
    <?php if (!empty($error)) echo "<p style='color:var(--error);text-align:center;'>$error</p>"; ?>
    <p style="text-align:center;">Nie masz konta? <a href="/register">Zarejestruj się</a></p>
</div>
<script
  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
  async
  defer
></script>
</body>
</html>
