<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/config.php';
require_login();

$user = current_user();

if (isset($_GET['channels'])) {
    $channels = $db->query('SELECT id, name FROM channels ORDER BY position ASC')->fetchAll(PDO::FETCH_ASSOC);
    header('Content-Type: application/json');
    echo json_encode($channels);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['move_channel'])) {
    require_admin($user);

    $id = (int)$_GET['move_channel'];
    $new_position = (int)($_POST['position'] ?? 0);

    $stmt = $db->prepare('UPDATE channels SET position = ? WHERE id = ?');
    $stmt->execute([$new_position, $id]);

    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['rename_channel'])) {
    require_admin($user);
    $id = filter_var($_GET['rename_channel'], FILTER_VALIDATE_INT);
    $new_name = isset($_POST['name']) ? trim($_POST['name']) : '';

    if ($id === false || $id === null || $id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Niepoprawne id kanału']);
        exit;
    }
    if ($new_name === '' || mb_strlen($new_name, 'UTF-8') > 100) {
        http_response_code(400);
        echo json_encode(['error' => 'Nowa nazwa nie może być pusta i musi mieć <=100 znaków']);
        exit;
    }
    $stmt = $db->prepare('UPDATE channels SET name = ? WHERE id = ?');
    $stmt->execute([$new_name, $id]);
    echo json_encode(['success' => true]);
    exit;
}

if (isset($_GET['delete_channel'])) {
    require_admin($user);
    $id = filter_var($_GET['delete_channel'], FILTER_VALIDATE_INT);
    if ($id === false || $id === null || $id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Niepoprawne id kanału']);
        exit;
    }
    $stmt = $db->prepare('DELETE FROM channels WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['create_channel'])) {
    require_admin($user);
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $topic = isset($_POST['topic']) ? trim($_POST['topic']) : '';

    if ($name === '' || mb_strlen($name, 'UTF-8') > 100) {
        http_response_code(400);
        echo json_encode(['error' => 'Nazwa kanału nie może być pusta i musi mieć <=100 znaków']);
        exit;
    }

    $stmt = $db->prepare('INSERT INTO channels (name, topic) VALUES (?, ?)');
    $stmt->execute([$name, $topic]);
    echo json_encode(['success' => true]);
    exit;
}