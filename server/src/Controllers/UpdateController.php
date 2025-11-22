<?php

class UpdateController
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Get the latest app update information
     * Edit the values below to release a new update
     */
    public function getLatestUpdate()
    {
        // ============================================
        // EDIT THESE VALUES TO RELEASE A NEW UPDATE
        // ============================================
        
        $currentVersion = '1.0.0';  // Current stable version
        $latestVersion = '1.1.0';   // Latest available version (change this to trigger update notification)
        $releaseDate = '2025-11-22'; // Release date of the latest version
        $downloadUrl = 'https://github.com/Sumit7739/roomOS/releases/latest'; // PLACEHOLDER - Add your download link here
        
        $releaseNotes = [
            'Added update notification system',
            'Improved logout confirmation with custom modal',
            'Fixed navigation visibility on login/signup pages',
            'Performance improvements and bug fixes'
        ];
        
        // ============================================
        // DO NOT EDIT BELOW THIS LINE
        // ============================================
        
        $hasUpdate = version_compare($latestVersion, $currentVersion, '>');
        
        $response = [
            'success' => true,
            'current_version' => $currentVersion,
            'latest_version' => $latestVersion,
            'has_update' => $hasUpdate,
            'release_date' => $releaseDate,
            'download_url' => $downloadUrl,
            'release_notes' => $releaseNotes
        ];

        http_response_code(200);
        echo json_encode($response);
    }
}
