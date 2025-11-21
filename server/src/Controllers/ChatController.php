<?php

class ChatController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    private function getUserIdFromToken() {
        $headers = getallheaders();
        if (!isset($headers['Authorization'])) return null;
        
        $token = str_replace('Bearer ', '', $headers['Authorization']);
        
        $stmt = $this->pdo->prepare("SELECT user_id FROM sessions WHERE token = ? AND expires_at > NOW()");
        $stmt->execute([$token]);
        $session = $stmt->fetch();
        
        return $session ? $session['user_id'] : null;
    }

    private function getUserGroup($userId) {
        $stmt = $this->pdo->prepare("SELECT group_id FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        return $stmt->fetch();
    }

    public function send() {
        $userId = $this->getUserIdFromToken();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $user = $this->getUserGroup($userId);
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['message']) || empty(trim($data['message']))) {
            http_response_code(400);
            echo json_encode(['error' => 'Message empty']);
            return;
        }

        try {
            $stmt = $this->pdo->prepare("INSERT INTO chat_messages (group_id, user_id, message) VALUES (?, ?, ?)");
            $stmt->execute([$user['group_id'], $userId, trim($data['message'])]);
            
            echo json_encode(['message' => 'Sent', 'id' => $this->pdo->lastInsertId()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to send']);
        }
    }

    public function since() {
        $userId = $this->getUserIdFromToken();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $user = $this->getUserGroup($userId);
        $lastId = isset($_GET['last_id']) ? intval($_GET['last_id']) : 0;

        $stmt = $this->pdo->prepare("
            SELECT c.id, c.message, c.created_at, u.name, u.id as sender_id 
            FROM chat_messages c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.group_id = ? AND c.id > ? 
            ORDER BY c.id ASC
        ");
        $stmt->execute([$user['group_id'], $lastId]);
        $messages = $stmt->fetchAll();

        echo json_encode(['messages' => $messages]);
    }
}
