# ************************************************************
# Sequel Pro SQL dump
# Version 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 127.0.0.1 (MySQL 5.5.29-MariaDB)
# Database: barbell
# Generation Time: 2013-07-26 20:43:03 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table classhourly
# ------------------------------------------------------------

DROP TABLE IF EXISTS `classhourly`;

CREATE TABLE `classhourly` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gymid` int(10) NOT NULL,
  `classid` int(10) NOT NULL,
  `service` varchar(50) COLLATE utf8_bin NOT NULL,
  `visits` int(10) DEFAULT NULL,
  `reservations` int(10) NOT NULL,
  `duration` int(3) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `amount` decimal(10,2) DEFAULT '0.00',
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_classid_datetime` (`classid`,`datetime`),
  KEY `id_classid` (`classid`),
  KEY `id_gymid` (`gymid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

LOCK TABLES `classhourly` WRITE;
/*!40000 ALTER TABLE `classhourly` DISABLE KEYS */;

INSERT INTO `classhourly` (`id`, `gymid`, `classid`, `service`, `visits`, `reservations`, `duration`, `price`, `amount`, `datetime`)
VALUES
	(1,22,1,X'4B6172617465',3,6,60,5.00,39.00,'2013-04-11 03:00:00'),
	(2,22,10,X'796F6761',65,70,30,12.00,833.00,'2013-04-12 03:00:00'),
	(3,22,21,X'796F6761',80,90,30,10.00,10.00,'2013-04-10 03:00:00'),
	(4,22,23,X'4B49636B43',320,320,120,23.00,69.00,'2013-04-09 03:00:00'),
	(5,22,10,X'4B726176204D616761',200,210,30,5.00,5.00,'2013-04-08 03:00:00'),
	(6,22,10,X'796F6761',75,90,90,12.00,850.00,'2013-04-13 03:00:00'),
	(42,17,73,X'',0,0,0,0.00,0.00,'2013-04-27 04:00:00'),
	(43,19,26,X'',0,0,0,0.00,0.00,'2013-04-27 04:00:00'),
	(44,19,74,X'',0,0,0,0.00,0.00,'2013-04-27 04:00:00'),
	(45,22,10,X'',0,0,0,0.00,0.00,'2013-04-27 04:00:00'),
	(46,22,101,X'',0,0,0,0.00,0.00,'2013-04-27 04:00:00'),
	(47,22,102,X'',0,0,0,0.00,0.00,'2013-04-27 04:00:00'),
	(48,22,116,X'',0,0,0,0.00,0.00,'2013-04-27 04:00:00'),
	(49,22,117,X'',0,0,0,0.00,0.00,'2013-04-27 04:00:00'),
	(50,30,88,X'',0,0,0,0.00,0.00,'2013-04-27 04:00:00'),
	(78,0,73,X'4B6172617465',0,0,60,0.00,NULL,'2013-04-27 17:00:00'),
	(79,0,26,X'4B726176204D616761',0,0,150,0.00,NULL,'2013-04-27 17:00:00'),
	(80,0,74,X'4B6172617465',0,0,60,0.00,NULL,'2013-04-27 17:00:00'),
	(81,0,10,X'54657374',0,0,30,0.00,NULL,'2013-04-27 17:00:00'),
	(82,0,101,X'596F6761',0,0,20,0.00,NULL,'2013-04-27 17:00:00'),
	(83,0,102,X'4B6172617465',0,0,60,0.00,NULL,'2013-04-27 17:00:00'),
	(84,0,116,X'546573742054696D65',0,0,30,0.00,NULL,'2013-04-27 17:00:00'),
	(85,0,117,X'506F776572207370696E',0,0,35,0.00,NULL,'2013-04-27 17:00:00'),
	(86,0,88,X'4B726176204D616761',0,0,60,0.00,NULL,'2013-04-27 17:00:00');

/*!40000 ALTER TABLE `classhourly` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table demographic
# ------------------------------------------------------------

DROP TABLE IF EXISTS `demographic`;

CREATE TABLE `demographic` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `male` int(10) DEFAULT NULL,
  `female` int(10) DEFAULT NULL,
  `city` varchar(25) COLLATE utf8_bin DEFAULT NULL,
  `state` varchar(2) COLLATE utf8_bin DEFAULT NULL,
  `zipcode` varchar(5) COLLATE utf8_bin DEFAULT NULL,
  `total` int(10) DEFAULT NULL,
  `datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_zipcode_datetime` (`zipcode`,`datetime`),
  KEY `zipcode` (`zipcode`),
  KEY `id_state` (`state`),
  KEY `id_city` (`city`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

LOCK TABLES `demographic` WRITE;
/*!40000 ALTER TABLE `demographic` DISABLE KEYS */;

INSERT INTO `demographic` (`id`, `male`, `female`, `city`, `state`, `zipcode`, `total`, `datetime`)
VALUES
	(1,0,0,NULL,NULL,NULL,0,'2013-01-01 00:00:00'),
	(882,1,0,X'57616C6E757420437265656B',X'4341',X'3934353936',2,'2013-01-10 00:00:00'),
	(870,0,0,X'526F756E6420526F636B',X'5458',X'3738363831',1,'2013-01-09 00:00:00'),
	(13,0,0,X'506C796D6F757468',X'4D41',X'3438373536',1,'2013-01-08 00:00:00'),
	(17,0,0,X'5761747473',X'4361',X'3930303032',1,'2013-01-08 00:00:00'),
	(866,0,0,X'',X'',X'',2,'2013-01-09 00:00:00'),
	(5,0,0,X'477261776E',X'4D49',X'3439363337',1,'2013-01-01 00:00:00'),
	(878,0,0,X'477261776E',X'4D49',X'3439363337',1,'2013-01-10 00:00:00'),
	(871,0,0,X'61757374696E',X'5458',X'3738373031',1,'2013-01-09 00:00:00'),
	(12,0,0,X'636F6C6F6D626F',X'4E42',X'3130313135',1,'2013-01-08 00:00:00'),
	(880,0,0,X'61757374696E',X'5458',X'3738373031',1,'2013-01-10 00:00:00'),
	(15,0,0,X'526F756E6420526F636B',X'5458',X'3738363831',1,'2013-01-08 00:00:00'),
	(868,0,0,X'506C796D6F757468',X'4D41',X'3438373536',1,'2013-01-09 00:00:00'),
	(3,0,0,X'636F6C6F6D626F',X'4E42',X'3130313135',1,'2013-01-01 00:00:00'),
	(881,0,0,X'5761747473',X'4361',X'3930303032',1,'2013-01-10 00:00:00'),
	(2,0,0,X'',X'',X'',2,'2013-01-01 00:00:00'),
	(14,0,0,X'477261776E',X'4D49',X'3439363337',1,'2013-01-08 00:00:00'),
	(869,0,0,X'477261776E',X'4D49',X'3439363337',1,'2013-01-09 00:00:00'),
	(16,0,0,X'61757374696E',X'5458',X'3738373031',1,'2013-01-08 00:00:00'),
	(879,0,0,X'526F756E6420526F636B',X'5458',X'3738363831',1,'2013-01-10 00:00:00'),
	(867,0,0,X'636F6C6F6D626F',X'4E42',X'3130313135',1,'2013-01-09 00:00:00'),
	(4,0,0,X'506C796D6F757468',X'4D41',X'3438373536',1,'2013-01-01 00:00:00'),
	(875,0,0,X'',X'',X'',2,'2013-01-10 00:00:00'),
	(8,0,0,X'5761747473',X'4361',X'3930303032',1,'2013-01-01 00:00:00'),
	(18,1,0,X'57616C6E757420437265656B',X'4341',X'3934353936',2,'2013-01-08 00:00:00'),
	(877,0,0,X'506C796D6F757468',X'4D41',X'3438373536',1,'2013-01-10 00:00:00'),
	(865,0,0,NULL,NULL,NULL,0,'2013-01-09 00:00:00'),
	(6,0,0,X'526F756E6420526F636B',X'5458',X'3738363831',1,'2013-01-01 00:00:00'),
	(9,1,0,X'57616C6E757420437265656B',X'4341',X'3934353936',2,'2013-01-01 00:00:00'),
	(874,0,0,NULL,NULL,NULL,0,'2013-01-10 00:00:00'),
	(876,0,0,X'636F6C6F6D626F',X'4E42',X'3130313135',1,'2013-01-10 00:00:00'),
	(7,0,0,X'61757374696E',X'5458',X'3738373031',1,'2013-01-01 00:00:00'),
	(10,0,0,NULL,NULL,NULL,0,'2013-01-08 00:00:00'),
	(873,1,0,X'57616C6E757420437265656B',X'4341',X'3934353936',2,'2013-01-09 00:00:00'),
	(11,0,0,X'',X'',X'',2,'2013-01-08 00:00:00'),
	(872,0,0,X'5761747473',X'4361',X'3930303032',1,'2013-01-09 00:00:00'),
	(883,0,0,X'',X'',X'',0,'2013-04-27 17:00:00');

/*!40000 ALTER TABLE `demographic` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table gymhourly
# ------------------------------------------------------------

DROP TABLE IF EXISTS `gymhourly`;

CREATE TABLE `gymhourly` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gymid` int(10) NOT NULL,
  `visits` int(10) NOT NULL,
  `views` int(10) NOT NULL,
  `reservations` int(10) NOT NULL,
  `amount` decimal(10,2) DEFAULT '0.00',
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_gymid_datetime` (`gymid`,`datetime`),
  KEY `id_gymid` (`gymid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

LOCK TABLES `gymhourly` WRITE;
/*!40000 ALTER TABLE `gymhourly` DISABLE KEYS */;

INSERT INTO `gymhourly` (`id`, `gymid`, `visits`, `views`, `reservations`, `amount`, `datetime`)
VALUES
	(7,22,39,80,60,700.00,'2013-04-06 03:00:00'),
	(8,22,68,40,89,1040.00,'2013-04-08 03:00:00'),
	(9,22,70,70,70,800.00,'2013-04-09 03:00:00'),
	(10,22,80,70,90,1080.00,'2013-04-10 03:00:00'),
	(11,22,65,100,45,600.00,'2013-04-11 03:00:00'),
	(12,22,90,110,100,1200.00,'2013-04-12 03:00:00'),
	(13,22,100,100,100,1200.00,'2013-04-13 03:00:00'),
	(14,22,50,60,67,760.00,'2013-04-14 03:00:00'),
	(15,22,30,50,80,100.00,'2013-04-08 05:00:00'),
	(122,0,0,0,0,NULL,'2013-04-27 04:00:00'),
	(124,2,0,0,0,0.00,'2013-04-27 04:00:00'),
	(126,17,0,0,0,0.00,'2013-04-27 04:00:00'),
	(128,19,0,0,0,0.00,'2013-04-27 04:00:00'),
	(130,20,0,0,0,0.00,'2013-04-27 04:00:00'),
	(132,21,0,0,0,0.00,'2013-04-27 04:00:00'),
	(134,22,0,0,0,0.00,'2013-04-27 04:00:00'),
	(136,24,0,0,0,0.00,'2013-04-27 04:00:00'),
	(138,25,0,0,0,0.00,'2013-04-27 04:00:00'),
	(140,26,0,0,0,0.00,'2013-04-27 04:00:00'),
	(142,27,0,0,0,0.00,'2013-04-27 04:00:00'),
	(144,28,0,0,0,0.00,'2013-04-27 04:00:00'),
	(146,29,0,0,0,0.00,'2013-04-27 04:00:00'),
	(148,30,0,0,0,0.00,'2013-04-27 04:00:00'),
	(245,1,0,0,0,NULL,'2013-04-27 17:00:00'),
	(246,2,0,0,0,NULL,'2013-04-27 17:00:00'),
	(247,17,0,0,0,NULL,'2013-04-27 17:00:00'),
	(248,19,0,0,0,NULL,'2013-04-27 17:00:00'),
	(249,20,0,0,0,NULL,'2013-04-27 17:00:00'),
	(250,21,0,0,0,NULL,'2013-04-27 17:00:00'),
	(251,22,0,0,0,NULL,'2013-04-27 17:00:00'),
	(252,24,0,0,0,NULL,'2013-04-27 17:00:00'),
	(253,25,0,0,0,NULL,'2013-04-27 17:00:00'),
	(254,26,0,0,0,NULL,'2013-04-27 17:00:00'),
	(255,27,0,0,0,NULL,'2013-04-27 17:00:00'),
	(256,28,0,0,0,NULL,'2013-04-27 17:00:00'),
	(257,29,0,0,0,NULL,'2013-04-27 17:00:00'),
	(258,30,0,0,0,NULL,'2013-04-27 17:00:00');

/*!40000 ALTER TABLE `gymhourly` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table hourly
# ------------------------------------------------------------

DROP TABLE IF EXISTS `hourly`;

CREATE TABLE `hourly` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `visits` int(10) NOT NULL,
  `signups` int(10) NOT NULL,
  `reservations` int(10) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_datetime` (`datetime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

LOCK TABLES `hourly` WRITE;
/*!40000 ALTER TABLE `hourly` DISABLE KEYS */;

INSERT INTO `hourly` (`id`, `visits`, `signups`, `reservations`, `amount`, `datetime`)
VALUES
	(1,5,29,89,1040.00,'2012-12-31 07:00:00'),
	(2,0,0,0,0.00,'2013-04-27 04:00:00'),
	(5,0,0,0,0.00,'2013-04-27 17:00:00');

/*!40000 ALTER TABLE `hourly` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table repeats
# ------------------------------------------------------------

DROP TABLE IF EXISTS `repeats`;

CREATE TABLE `repeats` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `userid` int(10) NOT NULL,
  `gymid` int(10) NOT NULL,
  `classid` int(10) NOT NULL,
  `visits` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_userid_classid` (`userid`,`classid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

LOCK TABLES `repeats` WRITE;
/*!40000 ALTER TABLE `repeats` DISABLE KEYS */;

INSERT INTO `repeats` (`id`, `userid`, `gymid`, `classid`, `visits`)
VALUES
	(1,15,22,10,10),
	(4,15,22,11,4),
	(15,16,22,11,1),
	(5,15,22,12,4);

/*!40000 ALTER TABLE `repeats` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
