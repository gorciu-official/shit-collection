<?php

function banUser(PDO $db, int $user_id): bool {
    $stmt = $db->prepare("SELECT ip FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $ip = $stmt->fetchColumn();

    if (!$ip) return false;
    $stmt = $db->prepare("INSERT OR IGNORE INTO ip_bans (ip) VALUES (?)");
    $stmt->execute([$ip]);

    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$user_id]);

    return true;
}

function isTorExitNode(string $ip): bool {
    if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) return false;

    // https://community.torproject.org/onion-services/advanced/dns/
    $reverseIp = implode('.', array_reverse(explode('.', $ip)));
    $check = $reverseIp . '.dnsel.torproject.org';
    $result = dns_get_record($check, DNS_A);

    if (!empty($result) && isset($result[0]['ip']) && $result[0]['ip'] === '127.0.0.2') {
        return true;
    }

    return false;
}

function isIpBanned(PDO $db, string $ip, array $user = []): bool {
    if (isTorExitNode($ip)) {
        $stmt = $db->prepare("INSERT OR IGNORE INTO ip_bans (ip) VALUES (?)");
        $stmt->execute([$ip]);
        if (count(array_values($user)) !== 0) {
            banUser($db, $user['id']);
        }
        return true;
    }
    $stmt = $db->prepare("SELECT COUNT(*) FROM ip_bans WHERE ip = ?");
    $stmt->execute([$ip]);
    return $stmt->fetchColumn() > 0;
}