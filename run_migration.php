<?php
$config = require_once __DIR__ . '/server/config/db.php';
$dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $config['username'], $config['password'], $options);
    $sql = file_get_contents(__DIR__ . '/server/migrations/add_app_updates.sql');
    $pdo->exec($sql);
    echo "Migration run successfully.\n";
} catch (\PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
