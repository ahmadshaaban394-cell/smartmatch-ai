-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 23, 2026 at 09:45 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smartmatch_ai`
--

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` int(11) NOT NULL,
  `freelancer_id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`id`, `freelancer_id`, `job_id`, `status`, `created_at`) VALUES
(1, 1, 1, 'accepted', '2026-05-23 16:50:04'),
(2, 3, 2, 'accepted', '2026-05-23 16:50:04'),
(3, 2, 3, 'pending', '2026-05-23 16:50:04'),
(4, 4, 4, 'pending', '2026-05-23 16:50:04'),
(5, 5, 5, 'accepted', '2026-05-23 16:50:04');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `user_id`, `company_name`, `created_at`) VALUES
(1, 1, 'Noor Services', '2026-05-23 16:50:04'),
(2, 2, 'Shaaban Home Projects', '2026-05-23 16:50:04');

-- --------------------------------------------------------

--
-- Table structure for table `freelancers`
--

CREATE TABLE `freelancers` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `expected_salary` decimal(10,2) DEFAULT NULL,
  `availability` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `pdf_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `freelancers`
--

INSERT INTO `freelancers` (`id`, `user_id`, `expected_salary`, `availability`, `location`, `pdf_path`, `created_at`) VALUES
(1, 3, 500.00, 'Full time', 'Tripoli', '/uploads/1779556629705-painter_cv.pdf', '2026-05-23 16:50:04'),
(2, 4, 500.00, '700', 'Saida', '/uploads/1780475932014-mechanic_cv.pdf', '2026-05-23 16:50:04'),
(3, 5, 700.00, 'Available Immediately', 'Beirut', '/uploads/tile_cv.pdf', '2026-05-23 16:50:04'),
(4, 6, 800.00, 'full time', 'Beirut', '/uploads/electrician_cv.pdf', '2026-05-23 16:50:04'),
(5, 7, 650.00, 'part time', 'Tripoli', '/uploads/plumber_cv.pdf', '2026-05-23 16:50:04');

-- --------------------------------------------------------

--
-- Table structure for table `freelancer_skills`
--

CREATE TABLE `freelancer_skills` (
  `freelancer_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `freelancer_skills`
--

INSERT INTO `freelancer_skills` (`freelancer_id`, `skill_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 15),
(2, 8),
(2, 9),
(2, 11),
(3, 5),
(3, 6),
(3, 7),
(4, 10),
(4, 11),
(5, 12),
(5, 13),
(5, 14);

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `budget_min` decimal(10,2) DEFAULT NULL,
  `budget_max` decimal(10,2) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `pdf_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`id`, `client_id`, `title`, `description`, `budget_min`, `budget_max`, `location`, `pdf_path`, `created_at`) VALUES
(1, 1, 'Painter Needed', 'Need a professional painter for an apartment. The work includes interior painting, exterior painting, wall finishing, and clean finishing.', 500.00, 1100.00, 'Tripoli', '/uploads/client_painter_job.pdf', '2026-05-23 16:50:04'),
(2, 1, 'Tile Worker Needed', 'Need an experienced tile worker for floor tiles and ceramic tiles installation in a kitchen and bathroom.', 500.00, 900.00, 'Beirut', '/uploads/client_tile_job.pdf', '2026-05-23 16:50:04'),
(3, 2, 'Car Mechanic Needed', 'Need a mechanic for engine repair, car maintenance, diagnostics, and general vehicle service.', 400.00, 850.00, 'Saida', '/uploads/client_mechanic_job.pdf', '2026-05-23 16:50:04'),
(4, 2, 'Electrician Needed', 'Need an electrician for home wiring, electrical repair, lighting installation, and maintenance.', 500.00, 1000.00, 'Beirut', '/uploads/client_electrician_job.pdf', '2026-05-23 16:50:04'),
(5, 1, 'Plumber Needed', 'Need a plumber for bathroom repair, water pipes installation, and leakage fixing.', 400.00, 800.00, 'Tripoli', '/uploads/client_plumber_job.pdf', '2026-05-23 16:50:04'),
(6, 1, ' Painter', 'Looking for a professional painter for interior painting and finishing.', 500.00, 1200.00, ' Tripoli', '/uploads/1779556405147-painter_job.pdf', '2026-05-23 17:13:25'),
(7, 1, ' Car Mechanic Needed', 'Need a mechanic for engine maintenance, inspection, and repairs', 500.00, 700.00, 'Saida', '/uploads/1780475817735-mechanic_job.pdf', '2026-06-03 08:36:57');

-- --------------------------------------------------------

--
-- Table structure for table `job_required_skills`
--

CREATE TABLE `job_required_skills` (
  `job_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_required_skills`
--

INSERT INTO `job_required_skills` (`job_id`, `skill_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(2, 5),
(2, 6),
(2, 7),
(3, 8),
(3, 9),
(3, 11),
(4, 10),
(4, 11),
(5, 12),
(5, 13),
(5, 14),
(6, 15),
(6, 16),
(6, 17);

-- --------------------------------------------------------

--
-- Table structure for table `matches`
--

CREATE TABLE `matches` (
  `id` int(11) NOT NULL,
  `freelancer_id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `match_score` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `matches`
--

INSERT INTO `matches` (`id`, `freelancer_id`, `job_id`, `match_score`, `created_at`) VALUES
(1, 1, 1, 66.55, '2026-05-23 16:50:04'),
(2, 1, 2, 5.01, '2026-05-23 16:50:04'),
(3, 1, 5, 5.51, '2026-05-23 16:50:04'),
(4, 3, 2, 91.00, '2026-05-23 16:50:04'),
(5, 3, 1, 20.75, '2026-05-23 16:50:04'),
(6, 2, 3, 50.31, '2026-05-23 16:50:04'),
(7, 2, 4, 8.36, '2026-05-23 16:50:04'),
(8, 4, 4, 89.40, '2026-05-23 16:50:04'),
(9, 4, 2, 10.50, '2026-05-23 16:50:04'),
(10, 5, 5, 92.70, '2026-05-23 16:50:04'),
(11, 5, 1, 11.00, '2026-05-23 16:50:04'),
(12, 5, 6, 2.03, '2026-05-23 17:13:25'),
(13, 4, 6, 0.00, '2026-05-23 17:13:25'),
(14, 3, 6, 0.00, '2026-05-23 17:13:25'),
(15, 2, 6, 11.94, '2026-05-23 17:13:25'),
(16, 1, 6, 50.81, '2026-05-23 17:13:25'),
(17, 1, 4, 4.08, '2026-05-23 17:17:10'),
(18, 1, 3, 3.65, '2026-05-23 17:17:10'),
(19, 5, 7, 0.00, '2026-06-03 08:36:58'),
(20, 4, 7, 4.86, '2026-06-03 08:36:58'),
(21, 3, 7, 0.00, '2026-06-03 08:36:58'),
(22, 2, 7, 61.07, '2026-06-03 08:36:58'),
(23, 1, 7, 3.33, '2026-06-03 08:36:58'),
(24, 2, 5, 1.57, '2026-06-03 08:38:52'),
(25, 2, 2, 2.32, '2026-06-03 08:38:52'),
(26, 2, 1, 2.16, '2026-06-03 08:38:52');

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

CREATE TABLE `profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `phone_number` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`id`, `user_id`, `full_name`, `bio`, `profile_picture`, `location`, `phone_number`, `created_at`) VALUES
(1, 1, 'Ali Noor', 'Client looking for skilled workers for finishing and maintenance jobs.', NULL, 'Beirut', '03-123456', '2026-05-23 16:50:04'),
(2, 2, 'Ahmad Shaaban', 'Client posting professional service jobs.', NULL, 'Tripoli', '70-111222', '2026-05-23 16:50:04'),
(3, 3, 'Mohammad Painter', 'Professional painter for apartments, offices, and wall finishing.', '/uploads/1779556702545-74534-wall-painting.avif', 'Tripoli', '70-888777', '2026-05-23 16:50:04'),
(4, 4, 'Ali Mechanic', 'Car mechanic specialized in maintenance, engine repair, and diagnostics.', NULL, 'Saida', '76-222111', '2026-05-23 16:50:04'),
(5, 5, 'Ahmad Tiler', 'Experienced tile worker for floors, walls, kitchens, and bathrooms.', NULL, 'Beirut', '71-555444', '2026-05-23 16:50:04'),
(6, 6, 'Hassan Electrician', 'Electrician specialized in home wiring, repair, and maintenance.', NULL, 'Beirut', '81-444555', '2026-05-23 16:50:04'),
(7, 7, 'Omar Plumber', 'Plumber specialized in water pipe installation and bathroom repair.', NULL, 'Tripoli', '03-987654', '2026-05-23 16:50:04');

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `id` int(11) NOT NULL,
  `skill_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `skills`
--

INSERT INTO `skills` (`id`, `skill_name`) VALUES
(17, ' Car Mechanic '),
(14, 'Bathroom Repair'),
(8, 'Car Mechanics'),
(6, 'Ceramic Tiles'),
(10, 'Electrical Wiring'),
(9, 'Engine Repair'),
(3, 'Exterior Painting'),
(7, 'Floor Tiles'),
(11, 'Home Maintenance'),
(2, 'Interior Painting'),
(15, 'Painter'),
(1, 'Painting'),
(16, 'pinter'),
(12, 'Plumbing'),
(5, 'Tile Installation'),
(4, 'Wall Finishing'),
(13, 'Water Pipes');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` enum('client','freelancer') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'client1@test.com', '123456', 'client', '2026-05-23 16:50:04'),
(2, 'client2@test.com', '123456', 'client', '2026-05-23 16:50:04'),
(3, 'painter@test.com', '123456', 'freelancer', '2026-05-23 16:50:04'),
(4, 'mechanic@test.com', '123456', 'freelancer', '2026-05-23 16:50:04'),
(5, 'tile@test.com', '123456', 'freelancer', '2026-05-23 16:50:04'),
(6, 'electrician@test.com', '123456', 'freelancer', '2026-05-23 16:50:04'),
(7, 'plumber@test.com', '123456', 'freelancer', '2026-05-23 16:50:04');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_application` (`freelancer_id`,`job_id`),
  ADD KEY `job_id` (`job_id`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `freelancers`
--
ALTER TABLE `freelancers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `freelancer_skills`
--
ALTER TABLE `freelancer_skills`
  ADD PRIMARY KEY (`freelancer_id`,`skill_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indexes for table `job_required_skills`
--
ALTER TABLE `job_required_skills`
  ADD PRIMARY KEY (`job_id`,`skill_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- Indexes for table `matches`
--
ALTER TABLE `matches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_match` (`freelancer_id`,`job_id`),
  ADD KEY `job_id` (`job_id`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `skill_name` (`skill_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `freelancers`
--
ALTER TABLE `freelancers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `matches`
--
ALTER TABLE `matches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `profiles`
--
ALTER TABLE `profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `skills`
--
ALTER TABLE `skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`freelancer_id`) REFERENCES `freelancers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `freelancers`
--
ALTER TABLE `freelancers`
  ADD CONSTRAINT `freelancers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `freelancer_skills`
--
ALTER TABLE `freelancer_skills`
  ADD CONSTRAINT `freelancer_skills_ibfk_1` FOREIGN KEY (`freelancer_id`) REFERENCES `freelancers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `freelancer_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `jobs`
--
ALTER TABLE `jobs`
  ADD CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `job_required_skills`
--
ALTER TABLE `job_required_skills`
  ADD CONSTRAINT `job_required_skills_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `job_required_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `matches`
--
ALTER TABLE `matches`
  ADD CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`freelancer_id`) REFERENCES `freelancers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `matches_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
