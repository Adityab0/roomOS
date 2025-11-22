# RoomOS Update System

## How to Release a New Update

The update notification system is fully dynamic and doesn't require a database. All you need to do is edit a single PHP file.

### Steps to Release an Update:

1. **Open the Update Controller**
   - File: `/server/src/Controllers/UpdateController.php`

2. **Edit the Update Information**
   - Locate the section marked "EDIT THESE VALUES TO RELEASE A NEW UPDATE"
   - Update the following values:

   ```php
   $currentVersion = '1.0.0';  // Current stable version
   $latestVersion = '1.1.0';   // Change this to trigger update notification
   $releaseDate = '2025-11-22'; // Release date of the latest version
   $downloadUrl = 'https://github.com/YOUR_USERNAME/roomOS/releases/latest'; // Your download link
   
   $releaseNotes = [
       'New features and improvements',
       'Bug fixes and performance enhancements',
       'UI/UX improvements'
   ];
   ```

3. **Save the File**
   - Once saved, all users will see the update notification popup on their next check

### How It Works:

- **Automatic Checks**: The app checks for updates every 6 hours
- **Immediate Check**: Also checks immediately when the user logs in
- **Smart Dismissal**: If a user clicks "Later", they won't see the popup again for that version
- **Version Comparison**: Uses semantic versioning (e.g., 1.0.0 → 1.1.0)

### Update Popup Features:

✅ Beautiful, modern design matching your app's theme
✅ Shows current vs. latest version
✅ Displays release notes
✅ "Download Now" button opens your download link in a new tab
✅ "Later" button dismisses the popup
✅ Click outside to dismiss

### Example Release:

To release version 1.2.0:

```php
$currentVersion = '1.0.0';
$latestVersion = '1.2.0';  // ← Change this
$releaseDate = '2025-12-01';
$downloadUrl = 'https://github.com/Sumit7739/roomOS/releases/tag/v1.2.0';

$releaseNotes = [
    'Added offline support for expenses and chat',
    'New update notification system',
    'Improved performance and bug fixes',
    'Enhanced UI with better animations'
];
```

### Testing:

1. Set `$latestVersion` to a higher version than `$currentVersion`
2. Reload the app
3. You should see the update popup immediately
4. Click "Later" to dismiss
5. Clear localStorage to see it again: `localStorage.removeItem('dismissed_update_version')`

### API Endpoint:

The update check endpoint is available at:
```
GET /updates/check
```

Returns:
```json
{
    "success": true,
    "current_version": "1.0.0",
    "latest_version": "1.2.0",
    "has_update": true,
    "release_date": "2025-12-01",
    "download_url": "https://github.com/...",
    "release_notes": ["...", "..."]
}
```
