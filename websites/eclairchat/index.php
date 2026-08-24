<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/auth.php';

$urlPath = explode('?', $_SERVER['REQUEST_URI'])[0];
$url = explode('/', trim($urlPath, '/'));

$first = $url[0] ?? '';

$serveStatic = function($baseDir) use ($url) {
    $path = implode('/', array_slice($url, 1));
    $file = realpath(__DIR__ . '/' . $baseDir . '/' . $path);
    $realBase = realpath(__DIR__ . '/' . $baseDir);

    if (!$file || strpos($file, $realBase) !== 0 || !is_file($file)) {
        http_response_code(404);
        echo 'File not found';
        exit;
    }

    $types = [
        'css'   => 'text/css',
        'js'    => 'application/javascript',
        'png'   => 'image/png',
        'jpg'   => 'image/jpeg',
        'jpeg'  => 'image/jpeg',
        'gif'   => 'image/gif',
        'svg'   => 'image/svg+xml',
        'webp'  => 'image/webp',
        'ico'   => 'image/x-icon',
        'json'  => 'application/json',
        'woff'  => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf'   => 'font/ttf',
        'otf'   => 'font/otf',
        'html'  => 'text/html',
    ];

    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $mime = $types[$ext] ?? mime_content_type($file) ?: 'application/octet-stream';

    header('Content-Type: ' . $mime);
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: public, max-age=1');

    readfile($file);
    exit;
};

switch ($first) {
    case 'routes':
        http_response_code(301);
        header('Location: /');
        echo 'EclairChat does not use legacy /routes system now. Please switch to new route system.';
        break;

    case '':
        require_once __DIR__ . '/routes/chat.php';
        break;

    case 'register':
        require_once __DIR__ . '/routes/register.html';
        break;

    case 'login':
        require_once __DIR__ . '/routes/login.php';
        break;

    case 'api':
        $apiFile = __DIR__ . '/api/' . implode('/', array_slice($url, 1));
        if (str_ends_with($apiFile, '.php') && file_exists($apiFile)) {
            require_once $apiFile;
            exit;
        } else {    
            http_response_code(404);
            echo 'API endpoint not found';
            exit;
        }
        break;

    case 'css':
    case 'js':
        $serveStatic($first);
        break;

    default:
        http_response_code(404);
        echo 'Not found';
        break;
}
