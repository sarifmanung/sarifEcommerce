-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 31, 2022 at 06:02 PM
-- Server version: 10.4.17-MariaDB
-- PHP Version: 8.0.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `DB_ecommerce`
--

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `id` int(11) NOT NULL,
  `ts` timestamp NOT NULL DEFAULT current_timestamp(),
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IC` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DOB` date DEFAULT NULL,
  `phone_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `treatment_start_date` date DEFAULT NULL,
  `treatment_end_date` date DEFAULT NULL,
  `membership_expire_date` date DEFAULT NULL,
  `barcode_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`id`, `ts`, `first_name`, `last_name`, `IC`, `DOB`, `phone_number`, `email`, `treatment_start_date`, `treatment_end_date`, `membership_expire_date`, `barcode_number`, `status`) VALUES
(1, '2022-08-10 02:53:35', 'sarif~', 'manung', '19599008765431', '1996-01-12', '09876543211', 'sarif@gmail.com1', '2022-07-14', '2021-04-02', '2023-01-01', '06-22-11111', 'active'),
(2, '2022-08-10 03:01:44', 'dickson', 'gorgor', '19599003456782', '2022-08-23', '09876543212', 'dickson.it@drclearaligner.com2', '2022-08-01', '2022-12-29', '2023-05-24', '06-22-22222', 'active'),
(3, '2022-08-10 03:54:22', 'mint', 'koranit', '19599887765433', '2022-08-24', '09678954323', 'mint.koranit@gmail.com3', '2022-08-10', '2022-08-31', '2023-03-18', '06-22-33333', 'active'),
(4, '2022-08-10 04:01:08', 'Chris Tan', 'Big Boss', '19599009876544', '2020-02-04', '09876567894', 'Christan@gmail.com4', '2022-08-22', '2022-08-22', '2022-08-22', '06-22-44444', 'active'),
(5, '2022-08-10 04:40:35', 'yuchen', 'gorgor', '19599008765435', '2022-08-16', '09876567895', 'yuchen@gmail.com5', '2022-08-13', '2022-08-26', '2022-08-01', '06-22-55555', 'active'),
(6, '2022-08-12 10:09:55', 'garou', 'gorgor', '19599007876566', '2022-08-09', '09876543216', 'pain@gmail.com6', '2022-08-26', '2022-08-09', '2022-09-02', '06-22-66666', 'active'),
(7, '2022-08-12 11:25:10', 'one', 'two', '19599001234567', '2022-08-10', '01234567897', 'test@gmail.com7', '2021-08-22', '2022-08-24', '2024-12-27', '', 'active'),
(8, '2022-08-12 11:34:55', 'ซารีฟ', 'มะนุง', '19699005654328', '2022-08-09', '01234567898', 'admin@admin.com8', '2022-09-02', '2022-08-04', '2023-12-23', '', 'active'),
(9, '2022-08-12 11:35:39', 'afrah', 'uma', '1234567899', '0004-03-12', '1234567899', 'afrah@gmail.com9', '2022-08-16', '2022-08-02', '2022-09-10', '', 'active'),
(10, '2022-08-12 11:58:22', 'ahama', 'daoh', '21345678910', '2022-08-20', '012345678910', 'admin@admin.com10', '2022-08-27', '2022-08-25', '2022-09-03', '', 'active'),
(11, '2022-08-12 14:47:09', 'muneeroh', 'manung', '196338878654311', '2022-08-25', '012345678911', '406168026@yru.ac.th11', '2022-08-18', '2022-08-18', '2022-09-03', '', 'active'),
(12, '2022-08-12 15:16:55', 'Imteenan', 'byhe', '195990012345612', '2022-08-25', '012345678912', 'sarif@gmail.com12', '2022-08-24', '2022-09-02', '2022-09-01', '', 'active'),
(13, '2022-08-12 16:40:58', '1tset', '1wewewe', '113', '2022-08-19', '113', 'admin@admin.com13', '2022-08-27', '2022-08-11', '2022-08-04', '', 'active'),
(14, '2022-08-13 16:38:53', 'suraiya22', 'samoh', '195990087654314', '2022-08-20', '012345678914', 'admin@admin.com14', '2022-08-20', '2022-08-17', '2022-09-03', '', 'active'),
(15, '2022-08-16 08:44:29', 'Munee', 'Sukrit', '1959988654876115', '2022-08-23', '098765432115', 'munee@gmail.com15', '2022-08-19', '2022-08-19', '2022-08-19', '', 'active'),
(16, '2022-08-17 09:36:45', 'Muneeroh', 'Manung', '195990076534616', '2018-10-17', '092523998716', 'munee@bgmail.com16', '2022-08-31', '2022-08-27', '2023-10-31', '', 'active'),
(17, '2022-08-23 06:55:12', 'One', 'R', '098132647317', '2022-08-23', '012345678917', '406168026@yru.ac.th17', '2022-08-23', '2022-08-23', '2022-08-23', '1959900876543121', 'active'),
(18, '2022-08-23 06:56:16', '2', '2', '218', '2022-08-23', '218', 'admin@admin.com18', '2022-08-23', '2022-08-23', '2022-08-23', '', 'removed'),
(19, '2022-08-23 07:16:06', '2', '2', '219', '2022-08-07', '219', 'sarif@sarif.com19', '2022-08-13', '2022-08-09', '2022-08-12', '', 'removed'),
(20, '2022-08-23 07:19:16', '4', '4', '420', '2022-08-20', '012345678920', 'sarif@gmail.com20', '2022-08-20', '2022-08-01', '2022-09-10', '', 'removed'),
(21, '2022-08-24 02:10:41', 'sarif', 'manung', '196338878654321', '2022-08-11', '034234279113121', 'hello@gmail.com21', '2022-08-12', '2022-08-16', '2022-08-05', '', 'active'),
(22, '2022-08-24 03:17:01', 'smile', 'samadee', '1963388786543989343422', '2022-08-04', '012345678923232322', 'admin@admin.com22', '2022-08-13', '2022-08-19', '2022-08-20', '06-22-xxxx', 'active'),
(23, '2022-08-24 03:18:51', 'haris', 'samadeee', '195990056789023', '2022-08-25', '09856473823', 'haris@gmail.com23', '2022-08-13', '2022-08-26', '2022-08-12', NULL, 'active'),
(24, '2022-08-24 04:12:14', 'dd', 'dddd', '1963388786543232323224', '2022-08-13', '0123456789232324', '406168026@yru.ac.th.com24', '2022-08-11', '2022-08-09', '2022-08-09', NULL, 'active'),
(25, '2022-08-24 04:23:33', 'smile', 'muhammad', '1963388786525', '2022-08-11', '243243243425', 'dickson@gmail.comccc25', '2022-08-12', '2022-08-09', '2022-08-27', '60-22-1234x', 'active'),
(26, '2022-08-24 04:27:35', 'newsarif', 'manung', '19599001234562342326', '2022-08-23', '09252399087626', '40616802612@yru.ac.th26', '2022-08-04', '2022-08-15', '2022-08-06', NULL, 'active'),
(27, '2022-08-24 04:45:16', 'newafrah', 'hama', '1959900474849127', '2022-08-20', '083423990827', 'newafrah@gmail.com27', '2022-08-04', '2022-08-14', '2022-09-02', '60-22-777777', 'active'),
(28, '2022-08-24 07:00:23', 'smiler', 'tan', '1959900474352628', '2002-12-24', '081762534728', 'ninami@gmail.com28', '2022-08-24', '2022-08-24', '2022-08-24', '60-22-12345', 'active'),
(29, '2022-08-30 07:55:39', 'maganga', 'rov', '19633887865432343429', '2022-08-17', '0123456789903429', 'maganga@gmail.com29', '2022-08-16', '2022-08-09', '2022-08-13', '60-22-000032', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `id` int(11) NOT NULL,
  `ts` timestamp NOT NULL DEFAULT current_timestamp(),
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'merchant',
  `phone_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DOB` date DEFAULT NULL,
  `IC` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`id`, `ts`, `first_name`, `last_name`, `user_name`, `password`, `role`, `phone_number`, `email`, `DOB`, `IC`, `status`) VALUES
(1, '2022-08-11 09:57:47', 'SARIF', 'manung', 'sarif', 'password', 'admin', '09678954321', 'hellosarif@gamil.com1', '1996-01-12', '19599001234561', 'active'),
(2, '2022-08-17 07:50:57', 'chrisTan', 'bigBoss', 'chris2', 'password', 'admin', '01234567892', 'chris@chris.com2', '2022-09-03', '19599001234562', 'active'),
(3, '2022-08-17 08:07:55', 'dickson', 'gorgor', 'dickson3', 'password', 'admin', '01234567893', 'dickson@gmail.com3', '2022-08-22', '19633887865433', 'active'),
(6, '2022-08-18 02:32:55', 'yuchen', 'gorgor', 'yuchen4', 'password', 'admin', '01234567894', 'yuchen@gmail.com4', '2022-09-02', '19633887865434', 'active'),
(7, '2022-08-18 02:35:09', 'admin', 'admin', 'admin5', 'password', 'admin', '01234567895', 'admin@admin.gmail.com5', '2022-09-03', '19633887865435', 'active'),
(12, '2022-08-18 02:51:06', 'munee', 'manung', 'munee6', 'password', 'admin', '01234567896', 'munee@munee.com6', '1995-03-08', '19633887865436', 'active'),
(13, '2022-08-18 02:52:51', 'suhaime', 'asstro', 'suhaime7', 'password', 'admin', '01234567897', 'suhaime@gmail.com7', '1996-06-19', '19088771817657', 'active'),
(14, '2022-08-18 02:54:32', 'yoga', 'yoga', 'sarif8', 'password', 'admin', '01234567898', 'yoga@gmail.com8', '2022-08-01', '19599001234568', 'active'),
(15, '2022-08-19 07:51:25', 'merchant', 'mechant', 'merchant', 'password', 'merchant', '01234567899', 'merchant@gmail.com9', '2022-08-19', '19599002325469', 'active'),
(16, '2022-08-22 03:04:35', 'munee', 'manung', 'dickson10', 'password', 'admin', '012345678910', 'admin@admin.com10', '2022-08-13', '196338878654310', 'active'),
(17, '2022-08-22 03:07:42', 'ryan', 'boss', 'ryan11', 'password', 'admin', '012345678911', 'ryan@gmail.com11', '2022-08-03', '196338878654311', 'active'),
(18, '2022-08-22 03:08:21', 'merchant2', 'merchant2', 'merchant212', 'password', 'merchant', '012345678912', 'merchant@gmail.com12', '2022-08-24', '195990012345612', 'active'),
(19, '2022-08-23 07:00:39', 'hello1212', 'lolo', 'sarif13', 'password', 'admin', '012345678913', 'admin@admin.com13', '2022-09-09', '190887718176513', 'active'),
(20, '2022-08-23 07:20:24', '1', '1', 'chris14', 'password', 'admin', '114', 'sarif@gmail.com14', '2022-09-10', '195990012345614', 'removed'),
(21, '2022-08-30 10:03:29', 'newadmin', 'newadmin', 'admin215', 'password', 'admin', '098765682415', 'admin2@admin2.com15', '2022-08-06', '295990024581315', 'active');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
