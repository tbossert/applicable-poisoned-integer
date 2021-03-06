DELIMITER ;;
CREATE PROCEDURE `checkin` (IN phoneNum VARCHAR(10), IN pin VARCHAR(50), IN gymid int(10), IN dateTime datetime)
BEGIN

DECLARE transMess VARCHAR(100);
DECLARE uid INT;
DECLARE sid INT;
DECLARE cid INT;
DECLARE EXIT HANDLER FOR SQLEXCEPTION,SQLWARNING
BEGIN
  ROLLBACK;
  SELECT transMess;
  
END;


START TRANSACTION;

SET transMess = "invalid phone/pincode";
SELECT u.id INTO uid FROM users u WHERE phone = AES_ENCRYPT(phoneNum,'oniud9duhfd&bhsdbds&&%bdudbds5;odnonoiusdbuyd$') AND u.pincode = pin;
IF FOUND_ROWS() > 0 THEN
	SET transMess = "no scheduled activity";
	SELECT s.id,s.classid INTO sid,cid FROM users u INNER JOIN schedule s ON u.id = s.userid WHERE u.id = uid AND s.datetime >= NOW() AND s.datetime <= NOW() + INTERVAL 30 MINUTE ORDER BY s.datetime LIMIT 1;
	IF FOUND_ROWS() < 1 THEN
		SELECT s.id,s.classid INTO sid,cid FROM users u INNER JOIN schedule s ON u.id = s.userid WHERE u.id = uid AND DATE(s.datetime) = DATE(dateTime) AND c.daypass = 1 ORDER BY s.datetime LIMIT 1;
		IF FOUND_ROWS() < 1 THEN
			ROLLBACK;
		END IF;
	END IF;
	set transMess = "already checked in";
	INSERT INTO checkin (userid,gymid,datetime,scheduleid,classid) VALUES (uid,gymid,NOW(),sid,cid);
	IF ROW_COUNT() < 1 THEN
		set transMess = "checkin failed";
		ROLLBACK;
	END IF;
ELSE
	set transMess = "invalid phone/pincode";
	ROLLBACK;
END IF;

COMMIT;
SET transMess = "success";
SELECT transMess;
END;;
DELIMITER ;