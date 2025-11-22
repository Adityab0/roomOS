CREATE TABLE `app_updates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `version` varchar(20) NOT NULL,
  `download_url` text NOT NULL,
  `release_notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `app_updates` (`version`, `download_url`, `release_notes`) VALUES
('1.0.0', 'https://example.com/download', 'Initial release');
