<?php

class TransactionController {
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

    public function add() {
        $userId = $this->getUserIdFromToken();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $user = $this->getUserGroup($userId);
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['amount']) || !isset($data['description'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing fields']);
            return;
        }

        $amount = floatval($data['amount']);
        if ($amount <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid amount']);
            return;
        }

        try {
            $this->pdo->beginTransaction();

            // 1. Record Transaction
            $stmt = $this->pdo->prepare("INSERT INTO transactions (group_id, user_id, amount, description) VALUES (?, ?, ?, ?)");
            $stmt->execute([$user['group_id'], $userId, $amount, $data['description']]);

            // 2. Update Balances (Simplified Split)
            // Logic: Payer gets +Amount, Everyone else gets -(Amount / N)
            // Actually, simpler: Payer paid X.
            // Total cost X. Split by N members. Share = X/N.
            // Payer is "owed" (X - Share).
            // Others "owe" (Share).
            
            // Get all members count
            $stmt = $this->pdo->prepare("SELECT count(*) FROM users WHERE group_id = ?");
            $stmt->execute([$user['group_id']]);
            $memberCount = $stmt->fetchColumn();

            if ($memberCount > 0) {
                $share = $amount / $memberCount;

                // Get all members
                $stmt = $this->pdo->prepare("SELECT id FROM users WHERE group_id = ?");
                $stmt->execute([$user['group_id']]);
                $members = $stmt->fetchAll(PDO::FETCH_COLUMN);

                foreach ($members as $mid) {
                    // Check if balance row exists
                    $stmt = $this->pdo->prepare("SELECT id FROM balances WHERE group_id = ? AND user_id = ?");
                    $stmt->execute([$user['group_id'], $mid]);
                    if (!$stmt->fetch()) {
                        $stmt = $this->pdo->prepare("INSERT INTO balances (group_id, user_id, balance) VALUES (?, ?, 0)");
                        $stmt->execute([$user['group_id'], $mid]);
                    }

                    if ($mid == $userId) {
                        // Payer: + (Amount - Share)
                        $change = $amount - $share;
                    } else {
                        // Others: - Share
                        $change = -$share;
                    }

                    $stmt = $this->pdo->prepare("UPDATE balances SET balance = balance + ? WHERE group_id = ? AND user_id = ?");
                    $stmt->execute([$change, $user['group_id'], $mid]);
                }
            }

            $this->pdo->commit();
            echo json_encode(['message' => 'Transaction added']);

        } catch (Exception $e) {
            $this->pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add transaction: ' . $e->getMessage()]);
        }
    }

    public function list() {
        $userId = $this->getUserIdFromToken();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $user = $this->getUserGroup($userId);

        // Get recent transactions
        $stmt = $this->pdo->prepare("
            SELECT t.*, u.name as user_name 
            FROM transactions t 
            JOIN users u ON t.user_id = u.id 
            WHERE t.group_id = ? 
            ORDER BY t.created_at DESC 
            LIMIT 20
        ");
        $stmt->execute([$user['group_id']]);
        $transactions = $stmt->fetchAll();

        // Get balances
        $stmt = $this->pdo->prepare("
            SELECT b.balance, u.name 
            FROM balances b 
            JOIN users u ON b.user_id = u.id 
            WHERE b.group_id = ?
        ");
        $stmt->execute([$user['group_id']]);
        $balances = $stmt->fetchAll();

        // Get my balance
        $myBalance = 0;
        foreach ($balances as $b) {
            if ($b['name'] === $this->getUserName($userId)) { // Optimization: fetch name in getUserGroup or separate query
                 // Actually, we need to know which one is ME.
                 // Let's just filter by user_id in a separate query or loop if we had IDs.
                 // Re-query for strict correctness or add ID to balance query
            }
        }
        // Better:
        $stmt = $this->pdo->prepare("SELECT balance FROM balances WHERE user_id = ?");
        $stmt->execute([$userId]);
        $myBal = $stmt->fetchColumn();

        echo json_encode([
            'transactions' => $transactions,
            'balances' => $balances,
            'my_balance' => $myBal ?: 0
        ]);
    }
    
    private function getUserName($id) {
         $stmt = $this->pdo->prepare("SELECT name FROM users WHERE id = ?");
         $stmt->execute([$id]);
         return $stmt->fetchColumn();
    }
}
