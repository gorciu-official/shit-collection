<?php
require_once __DIR__ . '/../includes/config.php';

@session_start();
$_SESSION['user_creditentials_register_username'] = $_POST['username'] ?? '';
$_SESSION['user_creditentials_register_password'] = $_POST['password'] ?? '';

$params = [
    'client_id' => $discord_client_id,
    'redirect_uri' => $discord_redirect_uri,
    'response_type' => 'code',
    'scope' => 'identify guilds'
];

header('Location: https://discord.com/api/oauth2/authorize?' . http_build_query($params));
exit;
?>