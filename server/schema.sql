-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 28, 2025 at 11:54 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fuel_pos_electron`
--

-- --------------------------------------------------------

--
-- Table structure for table `daily_closings`
--

CREATE TABLE `daily_closings` (
  `id` int NOT NULL,
  `date` date NOT NULL,
  `total_sales` decimal(10,2) DEFAULT '0.00',
  `cash_sales` decimal(10,2) DEFAULT '0.00',
  `transfer_sales` decimal(10,2) DEFAULT '0.00',
  `credit_sales` decimal(10,2) DEFAULT '0.00',
  `total_expenses` decimal(10,2) DEFAULT '0.00',
  `net_income` decimal(10,2) DEFAULT '0.00',
  `closed_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `closed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `daily_closings`
--

INSERT INTO `daily_closings` (`id`, `date`, `total_sales`, `cash_sales`, `transfer_sales`, `credit_sales`, `total_expenses`, `net_income`, `closed_by`, `created_at`, `closed_at`) VALUES
(1, '2025-11-27', '8900.56', '7400.56', '1500.00', '0.00', '1200.00', '7700.56', 1, '2025-11-27 18:28:57', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `dispensers`
--

CREATE TABLE `dispensers` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `status` enum('available','busy','offline') DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `dispensers`
--

INSERT INTO `dispensers` (`id`, `name`, `status`, `created_at`) VALUES
(1, 'ตู้จ่ายด้านหน้า 1', 'available', '2025-11-26 18:46:54'),
(2, 'ตู้จ่ายด้านหน้า 2', 'available', '2025-11-26 18:46:54'),
(3, 'ตู้จ่ายด้านหลัง 1', 'available', '2025-11-26 18:46:54'),
(4, 'ตู้จ่ายด้านหลัง 2', 'available', '2025-11-26 18:46:54');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `note` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `title`, `amount`, `category`, `date`, `note`, `created_at`) VALUES
(1, 'ค่าขนส่ง', '1200.00', 'general', '2025-11-27 18:12:00', '', '2025-11-27 18:12:16');

-- --------------------------------------------------------

--
-- Table structure for table `fuel_imports`
--

CREATE TABLE `fuel_imports` (
  `id` int NOT NULL,
  `supplier_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `tank_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `price_per_unit` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `import_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `import_batch_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `fuel_imports`
--

INSERT INTO `fuel_imports` (`id`, `supplier_id`, `product_id`, `tank_id`, `amount`, `price_per_unit`, `total_price`, `import_date`, `created_at`, `import_batch_id`) VALUES
(1, 1, 3, NULL, '2000.00', '30.75', '61500.00', '2025-11-28 02:22:09', '2025-11-27 19:22:09', NULL),
(2, 1, 3, 3, '2000.00', '30.78', '61560.00', '2025-11-28 02:44:24', '2025-11-27 19:44:24', 3);

-- --------------------------------------------------------

--
-- Table structure for table `held_sales`
--

CREATE TABLE `held_sales` (
  `id` int NOT NULL,
  `nozzle_id` int NOT NULL,
  `sale_data` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `import_batches`
--

CREATE TABLE `import_batches` (
  `id` int NOT NULL,
  `supplier_id` int DEFAULT NULL,
  `import_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `shipping_cost` decimal(10,2) DEFAULT '0.00',
  `status` enum('pending','received') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `profit_status` enum('pending','calculated') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `total_sales` decimal(15,2) DEFAULT '0.00',
  `net_profit` decimal(15,2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `import_batches`
--

INSERT INTO `import_batches` (`id`, `supplier_id`, `import_date`, `shipping_cost`, `status`, `profit_status`, `total_sales`, `net_profit`) VALUES
(3, 1, '2025-11-28 02:44:24', '4500.00', 'received', 'pending', '0.00', '0.00');

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `id` int NOT NULL,
  `phone` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `points` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_line_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`id`, `phone`, `name`, `points`, `created_at`, `user_line_id`) VALUES
(1, '0812345678', 'Somchai Jai-dee', 82, '2025-11-27 12:21:50', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `nozzles`
--

CREATE TABLE `nozzles` (
  `id` int NOT NULL,
  `dispenser_id` int NOT NULL,
  `nozzle_number` varchar(50) NOT NULL,
  `product_id` int NOT NULL,
  `status` enum('idle','active','locked') DEFAULT 'idle',
  `tank_id` int DEFAULT NULL,
  `meter_reading` decimal(15,2) DEFAULT '0.00',
  `lock_reason` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `nozzles`
--

INSERT INTO `nozzles` (`id`, `dispenser_id`, `nozzle_number`, `product_id`, `status`, `tank_id`, `meter_reading`, `lock_reason`) VALUES
(1, 1, '1', 1, 'idle', 1, '28.17', NULL),
(2, 1, '2', 2, 'idle', 2, '52.81', NULL),
(7, 3, '1', 1, 'idle', 1, '0.00', NULL),
(10, 4, '1', 2, 'idle', 1, '0.00', NULL),
(12, 4, '2', 2, 'idle', 3, '0.00', NULL),
(19, 2, '1', 2, 'idle', NULL, '152.80', NULL),
(21, 2, '2', 2, 'idle', NULL, '50.00', NULL),
(22, 3, '2', 3, 'idle', NULL, '0.00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` decimal(10,2) NOT NULL DEFAULT '0.00',
  `color` varchar(20) DEFAULT 'blue',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `type` enum('fuel','goods') NOT NULL DEFAULT 'goods',
  `image_url` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `stock`, `color`, `created_at`, `type`, `image_url`, `active`) VALUES
(1, 'แก๊สโซฮอล 95', '35.50', '10000.00', '#ff6600', '2025-11-26 18:46:54', 'fuel', '', 1),
(2, 'ดีเซล', '32.20', '10000.00', '#000dc2', '2025-11-26 18:46:54', 'fuel', '', 1),
(3, 'Gasohol 91', '34.80', '14000.00', '#018417', '2025-11-26 18:46:54', 'fuel', '', 0),
(4, 'น้ำเปล่า 600ml', '10.00', '-5.00', 'blue', '2025-11-27 09:41:51', 'goods', '/uploads/1764270539530-486071737.png', 1),
(5, 'โค๊ก 325ml', '15.00', '0.00', 'blue', '2025-11-27 09:41:51', 'goods', '/uploads/1764270655847-393001260.png', 1),
(6, 'ขนมเลย์', '20.00', '-2.00', 'blue', '2025-11-27 09:41:51', 'goods', '/uploads/1764270704729-366419228.jpg', 1),
(9, 'Trans Product 00a4d824', '40.00', '0.00', '#000', '2025-11-27 20:23:37', 'fuel', 'x', 0),
(11, 'Tank Product 70aa3b54', '50.00', '0.00', '#FF0000', '2025-11-27 20:23:54', 'fuel', 'http://example.com/fuel.png', 0),
(12, 'Trans Product 0efa6fd8', '40.00', '0.00', '#000', '2025-11-27 20:23:54', 'fuel', 'x', 0),
(14, 'Tank Product 46566ee8', '50.00', '0.00', '#FF0000', '2025-11-27 20:24:12', 'fuel', 'http://example.com/fuel.png', 0),
(15, 'Trans Product 0f884816', '40.00', '0.00', '#000', '2025-11-27 20:24:12', 'fuel', 'x', 0),
(17, 'Tank Product 20321859', '50.00', '0.00', '#FF0000', '2025-11-27 20:24:25', 'fuel', 'http://example.com/fuel.png', 0),
(18, 'Trans Product b4deb9df', '40.00', '0.00', '#000', '2025-11-27 20:24:25', 'fuel', 'x', 0),
(20, 'Tank Product 79d1bfb2', '50.00', '0.00', '#FF0000', '2025-11-27 20:24:39', 'fuel', 'http://example.com/fuel.png', 0),
(21, 'Trans Product f9c38fce', '40.00', '0.00', '#000', '2025-11-27 20:24:39', 'fuel', 'x', 0),
(24, 'Trans Product b54f5e2e', '40.00', '0.00', '#000', '2025-11-27 20:24:54', 'fuel', 'x', 0),
(25, 'แก๊สโซฮอล 91', '30.25', '0.00', '#599f04', '2025-11-28 10:45:08', 'goods', '', 0),
(26, 'แก๊สโซฮอล 91', '31.25', '0.00', '#0ba800', '2025-11-28 10:46:03', 'fuel', '', 1);

-- --------------------------------------------------------

--
-- Table structure for table `product_stock`
--

CREATE TABLE `product_stock` (
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `min_level` int NOT NULL DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `product_stock`
--

INSERT INTO `product_stock` (`product_id`, `quantity`, `min_level`, `updated_at`) VALUES
(1, 0, 0, '2025-11-27 17:57:01'),
(2, 0, 0, '2025-11-27 17:56:54'),
(3, 0, 0, '2025-11-27 17:56:46'),
(4, 98, 0, '2025-11-27 13:42:25'),
(5, 98, 0, '2025-11-27 13:42:25'),
(6, 99, 0, '2025-11-27 13:33:19'),
(9, 0, 0, '2025-11-27 20:23:37'),
(11, 0, 0, '2025-11-27 20:23:54'),
(12, 0, 0, '2025-11-27 20:23:54'),
(14, 0, 0, '2025-11-27 20:24:12'),
(15, 0, 0, '2025-11-27 20:24:12'),
(17, 0, 0, '2025-11-27 20:24:25'),
(18, 0, 0, '2025-11-27 20:24:25'),
(20, 0, 0, '2025-11-27 20:24:39'),
(21, 0, 0, '2025-11-27 20:24:39'),
(24, 0, 0, '2025-11-27 20:24:54'),
(25, 0, 0, '2025-11-28 10:45:08'),
(26, 0, 0, '2025-11-28 10:46:03');

-- --------------------------------------------------------

--
-- Table structure for table `promotions`
--

CREATE TABLE `promotions` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('discount','freebie') NOT NULL,
  `condition_amount` decimal(10,2) NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `product_id` int DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `promotions`
--

INSERT INTO `promotions` (`id`, `name`, `type`, `condition_amount`, `value`, `product_id`, `start_date`, `end_date`, `active`, `created_at`) VALUES
(1, 'ส่วนลด 0.25 ต่อ ลิตร เมื่อเติมครบ 500 บาท', 'discount', '500.00', '0.25', NULL, '2025-11-25 00:00:00', '2026-11-25 00:00:00', 1, '2025-11-27 12:21:50'),
(2, 'แถมน้ำ', 'freebie', '500.00', '0.00', 4, '2025-11-28 00:00:00', '2026-11-28 00:00:00', 1, '2025-11-27 18:09:30');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int NOT NULL,
  `key_name` varchar(255) NOT NULL,
  `value` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key_name`, `value`, `updated_at`) VALUES
(1, 'company_name', 'บริษัท ตัวอย่าง จำกัด', '2025-11-27 15:48:59'),
(2, 'company_address', '123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพฯ 10000', '2025-11-27 15:48:59'),
(3, 'tax_id', '1234567890123', '2025-11-27 15:48:59'),
(4, 'branch_id', '00000', '2025-11-27 15:48:59'),
(5, 'phone', '02-123-4567', '2025-11-27 15:48:59'),
(6, 'footer_text', 'ขอบคุณที่ใช้บริการ', '2025-11-27 15:48:59');

-- --------------------------------------------------------

--
-- Table structure for table `shifts`
--

CREATE TABLE `shifts` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `start_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `end_time` timestamp NULL DEFAULT NULL,
  `start_cash` decimal(10,2) NOT NULL,
  `end_cash` decimal(10,2) DEFAULT NULL,
  `status` enum('open','closed') DEFAULT 'open'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `shifts`
--

INSERT INTO `shifts` (`id`, `user_id`, `start_time`, `end_time`, `start_cash`, `end_cash`, `status`) VALUES
(1, 1, '2025-11-26 19:23:33', '2025-11-26 21:34:39', '4000.00', '2500.00', 'closed'),
(2, 1, '2025-11-27 08:49:45', '2025-11-27 18:28:19', '4000.00', '4400.56', 'closed'),
(3, 2, '2025-11-27 16:13:02', '2025-11-27 16:13:25', '0.00', '0.00', 'closed'),
(4, 1, '2025-11-27 19:50:39', NULL, '2000.00', NULL, 'open');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `contact_person`, `phone`, `address`, `created_at`) VALUES
(1, 'บริษัท กฤษดาปิโตรเลียม จำกัด', 'ต้า', '0983631398', '200/1 โอเอซิส อาร์ตี้ ต.ท่าตูม อ.ศรีมหาโพธิ จ.ปราจีนบุรี 25140', '2025-11-27 16:47:11');

-- --------------------------------------------------------

--
-- Table structure for table `tanks`
--

CREATE TABLE `tanks` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `product_id` int NOT NULL,
  `capacity` decimal(10,2) NOT NULL DEFAULT '0.00',
  `current_volume` decimal(10,2) NOT NULL DEFAULT '0.00',
  `min_level` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tanks`
--

INSERT INTO `tanks` (`id`, `name`, `product_id`, `capacity`, `current_volume`, `min_level`, `created_at`) VALUES
(1, 'Tank 1 (Gasohol 95)', 1, '10000.00', '4926.78', '1000.00', '2025-11-26 19:56:28'),
(2, 'Tank 2 (Diesel)', 2, '20000.00', '14931.66', '2000.00', '2025-11-26 19:56:28'),
(3, 'Tank 3 (Gasohol 91)', 3, '10000.00', '9000.89', '1000.00', '2025-11-26 19:56:28');

-- --------------------------------------------------------

--
-- Table structure for table `tank_readings`
--

CREATE TABLE `tank_readings` (
  `id` int NOT NULL,
  `tank_id` int NOT NULL,
  `volume` decimal(10,2) NOT NULL,
  `reading_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tank_readings`
--

INSERT INTO `tank_readings` (`id`, `tank_id`, `volume`, `reading_time`) VALUES
(1, 1, '4943.68', '2025-11-27 19:01:29'),
(2, 1, '4954.95', '2025-11-27 15:17:44'),
(3, 1, '4954.95', '2025-11-27 14:52:36'),
(4, 1, '4974.67', '2025-11-27 12:06:14'),
(5, 1, '4988.75', '2025-11-26 20:21:06'),
(6, 1, '4988.75', '2025-11-26 19:12:08'),
(7, 1, '5002.83', '2025-11-26 19:12:00'),
(8, 1, '5016.91', '2025-11-26 19:11:53'),
(9, 1, '5030.99', '2025-11-26 19:11:28'),
(10, 1, '5045.07', '2025-11-26 18:58:22'),
(11, 2, '14968.94', '2025-11-27 19:01:29'),
(12, 2, '14984.47', '2025-11-27 15:17:28'),
(13, 3, '7956.89', '2025-11-27 19:01:29'),
(14, 3, '10000.00', '2025-10-28 19:01:29'),
(15, 3, '9956.89', '2025-11-27 19:22:09'),
(16, 3, '9000.89', '2025-11-27 19:44:35'),
(17, 1, '4940.86', '2025-11-27 19:51:10'),
(24, 2, '14953.41', '2025-11-27 20:48:24'),
(25, 2, '14947.20', '2025-11-27 20:48:36'),
(26, 2, '14944.09', '2025-11-27 20:48:43'),
(27, 2, '14940.98', '2025-11-27 20:49:12'),
(28, 2, '14931.66', '2025-11-27 20:49:32'),
(29, 1, '4926.78', '2025-11-28 05:41:32');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int NOT NULL,
  `dispenser_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `liters` decimal(10,2) NOT NULL,
  `payment_type` enum('cash','promptpay','credit') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'completed',
  `member_id` varchar(50) DEFAULT NULL,
  `received_amount` decimal(10,2) DEFAULT '0.00',
  `change_amount` decimal(10,2) DEFAULT '0.00',
  `start_meter` decimal(10,2) DEFAULT '0.00',
  `end_meter` decimal(10,2) DEFAULT '0.00',
  `promotion_id` int DEFAULT NULL,
  `total_discount` decimal(10,2) DEFAULT '0.00',
  `total_get_free` int DEFAULT '0',
  `points_earned` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `dispenser_id`, `product_id`, `amount`, `liters`, `payment_type`, `created_at`, `status`, `member_id`, `received_amount`, `change_amount`, `start_meter`, `end_meter`, `promotion_id`, `total_discount`, `total_get_free`, `points_earned`) VALUES
(1, 1, 1, '500.00', '14.08', 'promptpay', '2025-11-26 18:58:22', 'completed', NULL, '0.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(2, 1, 1, '500.00', '14.08', 'cash', '2025-11-26 19:11:28', 'completed', NULL, '0.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(3, 1, 1, '500.00', '14.08', 'promptpay', '2025-11-26 19:11:53', 'completed', NULL, '0.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(4, 1, 1, '500.00', '14.08', 'cash', '2025-11-26 19:12:00', 'completed', NULL, '0.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(5, 1, 1, '0.00', '0.00', 'cash', '2025-11-26 19:12:08', 'completed', NULL, '0.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(6, 2, 3, '500.00', '14.37', 'cash', '2025-11-26 20:13:04', 'completed', NULL, '0.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(7, 2, 3, '500.00', '14.37', 'cash', '2025-11-26 20:13:26', 'completed', NULL, '0.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(8, 2, 3, '500.00', '14.37', 'promptpay', '2025-11-26 20:15:14', 'completed', NULL, '0.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(9, 1, 1, '500.00', '14.08', 'cash', '2025-11-26 20:21:06', 'completed', NULL, '0.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(10, 2, 2, '500.00', '15.53', 'cash', '2025-11-26 20:38:35', 'completed', NULL, '0.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(11, 1, 1, '805.00', '19.72', 'cash', '2025-11-27 12:06:14', 'completed', NULL, '0.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(12, 2, 1, '100.00', '2.82', 'cash', '2025-11-27 12:06:24', 'completed', NULL, '0.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(13, 2, 1, '541.48', '14.08', 'cash', '2025-11-27 13:33:19', 'completed', NULL, '1000.00', '455.00', '0.00', '0.00', 1, '3.52', 0, 0),
(14, 2, 1, '496.48', '14.08', 'cash', '2025-11-27 13:33:48', 'completed', NULL, '200.00', '-300.00', '0.00', '0.00', 1, '3.52', 0, 0),
(15, 2, 2, '521.12', '15.53', 'cash', '2025-11-27 13:42:25', 'completed', NULL, '600.00', '75.00', '0.00', '0.00', 1, '3.88', 0, 0),
(16, 2, 1, '496.48', '14.08', 'cash', '2025-11-27 13:50:02', 'completed', NULL, '500.00', '0.00', '0.00', '0.00', 1, '3.52', 0, 0),
(17, 2, 1, '530.00', '14.08', 'cash', '2025-11-27 14:52:12', 'completed', NULL, '600.00', '74.00', '0.00', '14.08', NULL, '0.00', 0, 0),
(18, 1, 1, '10.00', '0.00', 'cash', '2025-11-27 14:52:36', 'completed', NULL, '10.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(19, 1, 2, '500.00', '15.53', 'cash', '2025-11-27 15:17:28', 'completed', NULL, '500.00', '4.00', '0.00', '15.53', NULL, '0.00', 0, 0),
(20, 1, 1, '400.00', '11.27', 'cash', '2025-11-27 15:17:44', 'completed', NULL, '400.00', '0.00', '0.00', '11.27', NULL, '0.00', 0, 0),
(21, 1, 1, '100.00', '2.82', 'promptpay', '2025-11-27 19:51:10', 'completed', NULL, '100.00', '0.00', '11.27', '14.09', NULL, '0.00', 0, 0),
(22, 1, 9, '100.00', '2.50', 'cash', '2025-11-27 20:23:37', 'completed', NULL, '100.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(23, 1, 12, '100.00', '2.50', 'cash', '2025-11-27 20:23:54', 'completed', NULL, '100.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(24, 1, 15, '100.00', '2.50', 'cash', '2025-11-27 20:24:12', 'completed', NULL, '100.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(25, 1, 18, '100.00', '2.50', 'cash', '2025-11-27 20:24:25', 'completed', NULL, '100.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(26, 1, 21, '100.00', '2.50', 'cash', '2025-11-27 20:24:39', 'completed', NULL, '100.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(27, 1, 24, '100.00', '2.50', 'cash', '2025-11-27 20:24:54', 'completed', NULL, '100.00', '0.00', '0.00', '0.00', NULL, '0.00', 0, 0),
(28, 1, 2, '500.00', '15.53', 'cash', '2025-11-27 20:48:24', 'completed', NULL, '500.00', '4.00', '15.53', '31.06', NULL, '0.00', 0, 0),
(29, 1, 2, '200.00', '6.21', 'cash', '2025-11-27 20:48:36', 'completed', NULL, '200.00', '0.00', '31.06', '37.27', NULL, '0.00', 0, 0),
(30, 1, 2, '100.00', '3.11', 'cash', '2025-11-27 20:48:43', 'completed', NULL, '100.00', '0.00', '37.27', '40.38', NULL, '0.00', 0, 0),
(31, 1, 2, '100.00', '3.11', 'cash', '2025-11-27 20:49:12', 'completed', '1', '100.00', '0.00', '40.38', '43.49', NULL, '0.00', 0, 4),
(32, 1, 2, '350.00', '9.32', 'cash', '2025-11-27 20:49:32', 'completed', NULL, '500.00', '150.00', '43.49', '52.81', NULL, '0.00', 0, 0),
(33, 1, 1, '500.00', '14.08', 'credit', '2025-11-28 05:41:32', 'completed', NULL, '500.00', '4.00', '14.09', '28.17', NULL, '0.00', 0, 0),
(34, 2, 2, '500.00', '15.53', 'cash', '2025-11-28 05:48:23', 'completed', '1', '500.00', '4.00', '100.00', '115.53', 1, '0.00', 0, 20),
(35, 2, 2, '500.00', '15.53', 'cash', '2025-11-28 05:48:43', 'completed', NULL, '500.00', '4.00', '115.53', '131.06', NULL, '0.00', 0, 0),
(36, 2, 2, '200.00', '6.21', 'cash', '2025-11-28 06:07:14', 'completed', '1', '200.00', '0.00', '131.06', '137.27', NULL, '0.00', 0, 8),
(37, 2, 2, '500.00', '15.53', 'cash', '2025-11-28 10:47:04', 'completed', NULL, '500.00', '4.00', '137.27', '152.80', NULL, '0.00', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `transaction_items`
--

CREATE TABLE `transaction_items` (
  `id` int NOT NULL,
  `transaction_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `type` enum('fuel','goods') NOT NULL DEFAULT 'goods'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `transaction_items`
--

INSERT INTO `transaction_items` (`id`, `transaction_id`, `product_id`, `quantity`, `price`, `total`, `type`) VALUES
(1, 13, 1, 1, '35.50', '500.00', 'fuel'),
(2, 13, 4, 1, '10.00', '10.00', 'goods'),
(3, 13, 5, 1, '15.00', '15.00', 'goods'),
(4, 13, 6, 1, '20.00', '20.00', 'goods'),
(5, 14, 1, 1, '35.50', '500.00', 'fuel'),
(6, 15, 2, 1, '32.20', '500.00', 'fuel'),
(7, 15, 5, 1, '15.00', '15.00', 'goods'),
(8, 15, 4, 1, '10.00', '10.00', 'goods'),
(9, 16, 1, 1, '35.50', '500.00', 'fuel');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','manager','cashier') NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `active`, `created_at`) VALUES
(1, 'admin', '$2b$10$STxMWjcpSuepKQNmByZ7OOvhvssJ0bzeJl9Sf/dSfJVzp33tkBr4C', 'admin', 1, '2025-11-26 18:55:27'),
(2, 'ch1', '$2b$10$Uj0s.TkECoSOwQ9hoOnn7eizpLTbeFdR1/gfOkhXwupCnpJMnD6yK', 'cashier', 1, '2025-11-27 12:08:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `daily_closings`
--
ALTER TABLE `daily_closings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `date` (`date`),
  ADD KEY `closed_by` (`closed_by`);

--
-- Indexes for table `dispensers`
--
ALTER TABLE `dispensers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `fuel_imports`
--
ALTER TABLE `fuel_imports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `fk_import_batch` (`import_batch_id`),
  ADD KEY `fk_fuel_imports_tank` (`tank_id`);

--
-- Indexes for table `held_sales`
--
ALTER TABLE `held_sales`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `import_batches`
--
ALTER TABLE `import_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- Indexes for table `nozzles`
--
ALTER TABLE `nozzles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dispenser_id` (`dispenser_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_stock`
--
ALTER TABLE `product_stock`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key_name` (`key_name`);

--
-- Indexes for table `shifts`
--
ALTER TABLE `shifts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tanks`
--
ALTER TABLE `tanks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `tank_readings`
--
ALTER TABLE `tank_readings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tank_time` (`tank_id`,`reading_time`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dispenser_id` (`dispenser_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `fk_promotion` (`promotion_id`);

--
-- Indexes for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `daily_closings`
--
ALTER TABLE `daily_closings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `dispensers`
--
ALTER TABLE `dispensers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `fuel_imports`
--
ALTER TABLE `fuel_imports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `held_sales`
--
ALTER TABLE `held_sales`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `import_batches`
--
ALTER TABLE `import_batches`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `nozzles`
--
ALTER TABLE `nozzles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `shifts`
--
ALTER TABLE `shifts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tanks`
--
ALTER TABLE `tanks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `tank_readings`
--
ALTER TABLE `tank_readings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `transaction_items`
--
ALTER TABLE `transaction_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `daily_closings`
--
ALTER TABLE `daily_closings`
  ADD CONSTRAINT `daily_closings_ibfk_1` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `fuel_imports`
--
ALTER TABLE `fuel_imports`
  ADD CONSTRAINT `fk_fuel_imports_tank` FOREIGN KEY (`tank_id`) REFERENCES `tanks` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_import_batch` FOREIGN KEY (`import_batch_id`) REFERENCES `import_batches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fuel_imports_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fuel_imports_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `import_batches`
--
ALTER TABLE `import_batches`
  ADD CONSTRAINT `import_batches_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`);

--
-- Constraints for table `nozzles`
--
ALTER TABLE `nozzles`
  ADD CONSTRAINT `nozzles_ibfk_1` FOREIGN KEY (`dispenser_id`) REFERENCES `dispensers` (`id`),
  ADD CONSTRAINT `nozzles_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `product_stock`
--
ALTER TABLE `product_stock`
  ADD CONSTRAINT `product_stock_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `shifts`
--
ALTER TABLE `shifts`
  ADD CONSTRAINT `shifts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `tanks`
--
ALTER TABLE `tanks`
  ADD CONSTRAINT `tanks_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `tank_readings`
--
ALTER TABLE `tank_readings`
  ADD CONSTRAINT `tank_readings_ibfk_1` FOREIGN KEY (`tank_id`) REFERENCES `tanks` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `fk_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`),
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`dispenser_id`) REFERENCES `dispensers` (`id`),
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD CONSTRAINT `transaction_items_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transaction_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
