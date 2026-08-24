<?php

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file_uploader'])) {
    $file = $_FILES['file_uploader'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'error' => 'Upload error code: ' . $file['error']]);
        exit;
    }

    $ch = curl_init('https://catbox.moe/user/api.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) ChatUploader/1.0'
    ]);

    $post = [
        'reqtype' => 'fileupload',
        'fileToUpload' => curl_file_create($file['tmp_name'], $file['type'], $file['name']),
    ];

    curl_setopt($ch, CURLOPT_POSTFIELDS, $post);

    $response = curl_exec($ch);
    $error = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($response && $httpCode === 200 && !$error) {
        echo json_encode(['success' => true, 'url' => trim($response)]);
    } else {
        echo json_encode(['success' => false, 'error' => $error ?: "HTTP $httpCode"]);
    }

    exit;
} else {
    echo json_encode(['success' => false, 'error' => "No file or wrong method."]);
}