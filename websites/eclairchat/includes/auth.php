<?php
@session_start();

function current_user() {
    return $_SESSION['user'] ?? null;
}

function require_login() {
    if (!isset($_SESSION['user'])) {
        header("Location: /login");
        exit;
    }
}

function require_admin($user) {
    if (!is_admin($user)) {
        http_response_code(403);
        echo json_encode(['error' => 'Brak uprawnień administracyjnych']);
        exit;
    }
}

function is_admin($user) {
    if (empty($user['is_admin']) || !$user['is_admin']) return false;
    return true;
}

?>
