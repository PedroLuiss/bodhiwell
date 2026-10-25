<?php
$secret = getenv('PLEXO_SECRET') ?: '1234567890abcdef';
$payload = file_get_contents(__DIR__ . '/payload.json');
$signature = hash_hmac('sha256', $payload, $secret);
echo "sha256=" . $signature . PHP_EOL;

