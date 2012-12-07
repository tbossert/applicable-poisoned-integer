-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- --------------------------------------------------------------------------------
DELIMITER $$

CREATE DEFINER=`root`@`localhost` PROCEDURE `addEvent`(IN ltype VARCHAR(15), IN token VARCHAR(100), IN price int(5), IN classid int(11), IN gymid int(10), IN dateTime datetime)
BEGIN


DECLARE sID int(11);
DECLARE transMess varchar(100);
DECLARE EXIT HANDLER FOR SQLEXCEPTION,NOT FOUND,SQLWARNING
BEGIN
  ROLLBACK;
  SELECT transMess;
  -- ERROR
END;


START TRANSACTION;
SET @price = price;
SET @aQuery = CONCAT('INSERT INTO uBillingAudit (uid,action,amount,timestamp) SELECT id,0,?,NOW() FROM users WHERE ',ltype,'_token = "', token,'"');
PREPARE pQuery FROM @aQuery;
EXECUTE pQuery USING @price; 
IF ROW_COUNT() > 0 THEN
	SET @gymid = gymid;
	SET @classid = classid;
	SET @price = price;
	SET @dateTime = dateTime;
	SET @aQuery = CONCAT('INSERT INTO schedule (userid,gymid,classid,price,datetime) SELECT id,?,?,?,? FROM users WHERE ',ltype,'_token = "',token,'"');
	PREPARE pQuery FROM @aQuery;
	EXECUTE pQuery USING @gymid,@classid,@price,@dateTime;
	IF ROW_COUNT() < 1 THEN
		SET transMess = "unable to add event1";
		ROLLBACK;
	END IF;
	
	SET sID = LAST_INSERT_ID();
	SET @sID = sID;
	SET @aQuery = CONCAT('UPDATE users u INNER JOIN schedule s ON u.id = s.userid SET u.balance = u.balance - s.price WHERE ',ltype,'_token = "',token,'" AND s.id = ? AND u.balance - s.price >= 0');
	PREPARE pQuery FROM @aQuery;
	EXECUTE pQuery USING @sID;
	IF ROW_COUNT() < 1 THEN
		SET transMess = "insufficient balance";
		ROLLBACK;
	END IF;

	SET @sID = sID;
	SET @gymid = gymid;
	SET @aQuery = CONCAT('UPDATE gymBilling gb INNER JOIN schedule s ON gb.gid = s.gymid INNER JOIN gyms g ON g.id = gb.gid SET zcom = gb.balance + round(s.price * g.commission/100,2), gb.balance = gb.balance + round(s.price - s.price * g.commission/100,2) WHERE gb.gid = ? AND s.id = ?');
	PREPARE pQuery FROM @aQuery;
	EXECUTE pQuery USING @gymid,@sID;
	IF ROW_COUNT() < 1 THEN
		SET transMess = "unable to add event2";
		ROLLBACK;
	END IF;
ELSE
	SET transMess = "unable to add event3";
	ROLLBACK;
END IF;

SET transMess = "success";
COMMIT;

SELECT transMess;
END