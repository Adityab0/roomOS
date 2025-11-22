<?php

class UpdateController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function check() {
        // Get the latest update
        $stmt = $this->pdo->prepare("SELECT * FROM app_updates ORDER BY created_at DESC LIMIT 1");
        $stmt->execute();
        $update = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($update) {
            echo json_encode([
                'success' => true,
                'update' => $update
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'update' => null
            ]);
        }
    }
}
