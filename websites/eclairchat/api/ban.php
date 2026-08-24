<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/ban.php';
require_login();

$user = current_user();

require_admin($user);

$user = $_GET['user'] ?? '';

if ($user === '') exit('Brak użytkownika.');

banUser($db, $user);

echo json_encode(['success' => true]);
