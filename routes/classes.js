/**
 *  Routes related to classes
 */


////////////// Create memcached of classes and refresh on schedule events or class change/////////////


var config = config = require('config')
  , moment = require('moment')
  , check = require('validator').check
  , sanitize = require('validator').sanitize

// API config settings
var salt = config.Hash.salt;

var dbConn = require('../mysqlConn');
var rmysql = dbConn.rmysql;
var wmysql = dbConn.wmysql;
var amysql = dbConn.amysql;

var memcached = require('../lib/memcached');

module.exports = function(app) {
  var colorArr = ['#FF0000','#8A0808','FF8000','#F7FE2E','#00FF00','#0B610B','#00FFFF','#0000FF','#0B0B61','#FA5882','#380B61','#585858']


  function getColor(token,callback) {
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 
        rmysql.query('SELECT c.color FROM classes c WHERE c.gymid = ' + data.gymid + 'ORDER BY c.id DESC LIMIT 1', function(err, result, fields) {
          colorIndex = colorArr.indexOf(result[0].color) + 1;
          callback(colorArr[colorIndex]);
        });
      }
    });
  }

  app.get('/api/classes/', function(req, res){
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 
        rmysql.query('SELECT c.id,c.gymid,c.service,c.duration,c.price,c.spots FROM classes c WHERE c.gymid = ' + data.gymid + ' ORDER BY service', function(err, result, fields) {
          if(err || result.length < 1) {
            res.send(400,'{"status": "failed", "message": "no class records matched gymid"}');
          } else {
            res.send(result);
          }
        });
      }
    });
  });


  app.get('/api/scheduledClasses/:start/:end/', function(req, res) {
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 
        rmysql.query('SELECT sc.id AS scid,c.id AS cid,c.service,c.color,sc.active,sc.price,sc.spots,sc.datetime FROM classes c INNER JOIN scheduledClass sc ON c.id = sc.classid WHERE sc.datetime >= ' + rmysql.escape(req.body.start) + ' AND sc.datetime <= ' + rmysql.escape(req.body.end) + ' AND  c.gymid = ' + data.gymid, function(err, result, fields) {
         if(err || result.length < 1) {
            res.send(400,'{"status": "failed", "message": "no class records matched gymid"}');
          } else {
            res.send(result);
          }
        });
      }
    });
  });


  /*app.get('/api/partner/:gid/classes', function(req, res){
    try {
      check(req.params.gid).isNumeric();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    var i = 0;
    var search = "";
    if(req.query.search !== undefined) {
      var terms = req.query.search.split(',');
      len = terms.length;
      for (i = 0; i < len; i++){
        search = search + '"' + terms[i] + '",';
      }
    }
    search = search + "service";

    rmysql.query('select id,gymid,service,instructor,duration,price,spots,`desc`,image from classes where gymid = ' + rmysql.escape(req.params.gid) + ' ORDER BY FIELD(service,' + search + ',service) ASC', function(err, result, fields) {
     if(err || result.length < 1) {
        res.send(400,'{"status": "failed", "message": "no gym matched id"}');
      } else {
        res.send(result);
      }
    });
  });*/


  /*app.get('/api/classes/:classId/:datetime/size/', function(req, res){
    rmysql.query('SELECT sc.spots - COUNT(s.sclassid) AS openSpots,sc.spots AS maxSpots FROM schedule s INNER JOIN scheduledClass sc ON s.sclassid = sc.id WHERE s.sclassid = ' + rmysql.escape(req.params.classId) + ' AND s.datetime = "' + rmysql.escape(req.params.datetime) + '"', function(err, result, fields) {
      if(err || result.length < 1) {
        res.send(400,'{"status": "failed", "message": "no class matching id"}');
      } else {
        res.send(result);
      }
    });
  });*/


  app.get('/api/scheduledClasses/:start/:end/', function(req, res) {
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        return res.send(401,'{"status": "failed", "message": "invalid token"}');
      }
    
      var start = rmysql.escape(req.params.start)
        , end = rmysql.escape(req.params.end);
      
      var statement = [
            'SELECT sc.id,sc.classid,sc.active,sc.price,sc.spots,sc.datetime '
          , ' FROM scheduledClass sc'
          , ' INNER JOIN gymUsers gu ON sc.gymid = gu.gymid'
          , ' WHERE gu.token = ' + rmysql.escape(req.header('token'))
          , ((start) ? ' AND sc.datetime >= ' + rmysql.escape(start) : '')
          , ((end) ? ' AND sc.datetime <= ' + rmysql.escape(end) : '')
          , ' ORDER BY sc.datetime'
          ].join(" ");
    
      rmysql.query(statement, function(err, result, fields) {
        if(err) {
          res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}');
        } else {
          res.send(result);
        }
      });
    });
  });


  app.post('/api/scheduledClasses/add/', function(req, res) {
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 
      var classObj = req.body.classObj;

      var statement = [
          'INSERT INTO scheduledClass '
        , '(classid,datetime,active,price,gymid,spots,service,instructor,image,daypass) '
        , 'SELECT ' + wmysql.escape(classObj[item].classId) + ',' + wmysql.escape(classObj[item].datetime) + ',1,price,gymid,spots,service,instructor,image,daypass '
        , 'FROM classes WHERE id = ' + wmysql.escape(classObj[item].classId) + ' AND gymid = ' + data.gymid
        ].join(" ");

        for( var item in classObj) {
          wmysql.query(statement, function(err, result, fields) {    
            if(err) {
              res.send(400,'{"status": "failed", "message": "insert of scheduled class record failed: ' + err + '"}');
            } else {
              res.send('{"status": "success"}');
            }
          });
        }
      }
    }); 
  });       


  app.get('/api/scheduledClasses/:classId/participants/', function(req, res) {
    try {
      check(req.params.classId).isNumeric();
      check(req.header('token')).notNull();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    
    memcached.isMemAuth(req.header('token'), function(err,data) {

      if(err) {
        return res.send(401,'{"status": "failed", "message": "invalid token"}');
      }
      
      var statement = [
          'SELECT u.id,s.id AS sid,s.checkin,u.first_name,u.last_name'
        , 'FROM users u'
        , 'INNER JOIN schedule s'
        , 'ON u.id = s.userid'
        , 'WHERE s.sclassid = ' + rmysql.escape(req.params.classId)
        , 'AND s.gymid = ' + data.gymid
        ].join(" ");
      
      rmysql.query(statement, function(err, result) {
        if(err) {
          res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}');
        } else {
          res.send(result);
        }
      });
    });
  });


  app.put('/api/scheduledClasses/:classId/participants/:participantId/checkin/', function(req, res) {
    try {
      check(req.params.classId).isNumeric();
      check(req.params.participantId).isNumeric();
      check(req.header('token')).notNull();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        return res.send(401,'{"status": "failed", "message": "invalid token"}');
      }
    
      var participantId = wmysql.escape(req.params.participantId);

      var statement = [
          'UPDATE schedule s INNER JOIN gymUsers gu ON s.gymid = gu.gymid '
        , 'SET s.checkin = 1 XOR s.checkin, s.chkintime = NOW() '
        , 'WHERE s.id = ' + participantId + ' AND g.id = ' + data.gymid
        ].join(" ");
      
      rmysql.query(statement, function(err, result) {
        if(err) {
          res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}');
        } else {
          res.send(result);
        }
      });
    });
  });


  app.post('/api/classes/add/', function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 
        var cid = 0
        , color = ""
        , service = wmysql.escape(req.body.service)
        , image = wmysql.escape(req.body.image)
        , duration = req.body.duration
        , price = req.body.price
        , spots = req.body.spots
        , description = wmysql.escape(req.body.description);
        
        if(spots == null) {
          var spots = 30;
        } 

        var statement = [
              'INSERT INTO classes '
            , '(gymid,service,image,duration,price,spots,`desc`,color) '
            , 'SELECT ' + data.gymid + ',' + service + ',' + image + ',' + duration + ',' + price + ',' + spots + ',' + description + ',"' + color + '"'
        ].join(" ");

        var statement2 = [
              'INSERT INTO classTimes (classid,gymid,weekday,time) '
            , 'SELECT ' + classId + ',' + data.gymid + ',' + wmysql.escape(key) + ',' + wmysql.escape(time)
        ].join(" ");

        getColor(wmysql.escape(req.header('token')),function(cb) {
          color = cb;
          wmysql.query(statement, function(err, result, fields) {
           if(err || result.affectedRows < 1) {
              res.send(400,'{"status": "failed", "message": "insert of class into classes table failed: ' + err + '"}');
            } else {
              classId = result.insertId;
              var keys = Object.keys( req.body.days );
              keys.forEach(function(key) {
              req.body.days[key].forEach(function(time) {
                  wmysql.query(statement2, function(err, result, fields) {
                    if(err || result.affectedRows < 1) {
                      res.send(400,'{"status": "failed", "message": "insert of class into classTimes table failed: ' + err + '"}');
                    }     
                  });
                });
              });
              res.send('{"status": "success", "message": "' + classId + '"}');
            }
          });
        });
      }
    });
  });


  app.get('/api/classes/:classId/', function(req, res){
    try {
      check(req.params.classId).isNumeric() 
    } catch (e) {
      res.send('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    var classId = rmysql.escape(req.params.classId);

    var statement = [
          'SELECT c.id,c.gymid,c.service,c.duration,c.price,c.spots,c.instructor'
        , ',c.desc,g.address,g.city,g.state,g.zipcode,g.phone ',
        , 'FROM classes c INNER JOIN gyms g ON c.gymid = g.id INNER JOIN hours h ON g.id = h.gymid '
        , 'WHERE c.id = ' + classId
    ].join(" ");

    rmysql.query(statement, function(err, result, fields) {
     if(err) {
        res.send('{"status": "failed", "message": "sql error occured: ' + err + '"}');
      } else {
        res.send(result);
      }
    });
  });


  app.get('/api/classes/:classId/times/', function(req, res){
    try {
      check(req.params.classId).isNumeric() 
    } catch (e) {
      res.send('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    var classId = rmysql.escape(req.params.classId);

    var statement = [
          'SELECT weekday,GROUP_CONCAT(time) AS time ',
        , 'FROM classTimes '
        , 'WHERE classid = ' + classId + ' GROUP BY'
        , ' weekday ORDER BY FIELD(weekday,"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday")'  
    ].join(" ");

    rmysql.query(statement, function(err, result, fields) {
      if(err) {
        res.send('{"status": "failed", "message": "sql error occured: ' + err + '"}');
      } else {
        res.send(result);
      }
    });
  });


  app.put('/api/classes/:classId/update/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.price).len(1,7).isDecimal();
      check(req.body.duration).isNumeric();
      check(req.params.classId).isNumeric();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else {
        var classId = req.params.classId
        , service = wmysql.escape(req.body.service)
        , image = wmysql.escape(req.body.image)
        , duration = req.body.duration
        , spots = req.body.spots
        , price = req.body.price
        , description = wmysql.escape(req.body.description)
        , days = req.body.days;

        if(spots == null) {
          var spots = 30;
        } 

        var statement = [
              'UPDATE classes c '
            , 'SET service = ' + service + ',image = ' + image + ',instructor = ' + instructor + ' '
            , 'duration = ' + duration + ',price = ' + price + ',spots = ' + spots + ',`desc` = ' + description + ' '
            , 'WHERE c.id = ' + classId + ' AND c.gymid = ' + data.gymid
        ].join(" ");

        var statement2 = [
              'DELETE FROM classTimes '
            , 'WHERE classid = ' + classId
        ].join(" ");

        var statement3 = [
              'INSERT INTO classTimes (classid,gymid,weekday,time) '
            , 'SELECT ' + classId + ',' + data.gymid + ',' + wmysql.escape(key) + ',' + wmysql.escape(time)
        ].join(" ");

        wmysql.query(statement, function(err, result, fields) {
         if(err || result.affectedRows < 1) {
            res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}');
          } else {
            wmysql.query(statement2);
            var keys = Object.keys( days );
            keys.forEach(function(key) {
            req.body.days[key].forEach(function(time) {
                wmysql.query(statement3, function(err, result, fields) {
                  if(err || result.affectedRows < 1) {
                    res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}');
                  }     
                });
              });
            });
            res.send('{"status": "success", "message": "' + classId + '"}');
          }
        });
      }
    });
  });


  app.del('/api/classes/:classId/delete/', function(req, res){  
    try {
      check(req.header('token')).notNull();
      check(req.params.classId).isNumeric()
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else {
        var classId = req.body.classId;

        var statement = [
              'DELETE c FROM classes c '
            , 'WHERE c.id = ' + classId + ' AND c.gymid = ' + data.gymid
        ].join(" ");

        wmysql.query(statement, function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}');
          } else {
            res.send('{"status": "success"}');
          }
        });
      }
    });
  });  


  app.put('/api/scheduledClasses/:classId/cancel/', function(req, res) {
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 

        var classId = req.body.classId
        , datetime = wmysql.escape(req.body.datetime);

        var statement = [
              'UPDATE scheduledClass sc '
            , 'SET active = 0 '
            , 'WHERE sc.classid = ' + classId + ' AND sc.datetime = ' + datetime + ' AND sc.gymid = ' + data.gymid
        ].join(" ");

        wmysql.query(statement, function(err, result, fields) {
          if(err) {
            res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}');
          } else {
            res.send('{"status": "success"}');
          }
        }); 
      }
    });
  });


  app.put('/api/scheduledClasses/:classId/update/', function(req, res) {
    try {
      check(req.header('token')).notNull();
      check(req.params.classId).isNumeric();
      check(req.body.price).isDecimal();
      check(req.body.spots).isNumeric();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 

        var classId = req.body.classId
        , price = req.body.price
        , spots = req.body.spots
        , datetime = wmysql.escape(req.body.datetime);

        var statement = [
              'UPDATE scheduledClass sc '
            , 'SET datetime = ' + datetime + ',spots = ' + spots + ',price = ' + price + ' '
            , 'WHERE sc.classid = ' + classId + ' AND sc.datetime = ' + datetime + ' AND sc.gymid = ' + data.gymid
        ].join(" ");

        wmysql.query(statement, function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}');
          } else {
            res.send('{"status": "success"}');
          }
        }); 
      }
    });
  });


  app.put('/api/scheduledClasses/:classId/revive/', function(req, res) {
    try {
      check(req.header('token')).notNull();
      check(req.params.classId).isNumeric();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 

        var classId = req.params.classId
        , datetime = wmysql.escape(req.body.datetime);

        var statement = [
              'UPDATE scheduledClass sc '
            , 'SET active = 1 '
            , 'WHERE sc.classid = ' + classId + ' AND sc.datetime = ' + datetime + ' AND sc.gymid = ' + data.gymid
        ].join(" ");

        wmysql.query(statement, function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.send(400,'{"status": "failed", "message": "unable to revive"}');
          } else {
            res.send('{"status": "success"}');
          }
        }); 
      }
    });
  });


  /*app.get('/api/userSCID/', function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT s.sclassid FROM schedule s INNER JOIN users u ON s.userid = u.id WHERE u.`' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(err || result.length < 1) {
        res.send(400,'{"status": "failed", "message": "unable to retreive"}');
      } else {
        res.send(result);
      }
    });
  });*/


  app.get('/api/SCIDs/:start/:end', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.params.classid).isNumeric();
      check(req.params.start).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
      check(req.params.end).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 
        rmysql.query('SELECT sc.id AS sid,sc.classid as cid,sc.datetime,sc.price,sc.spots,sc.active FROM scheduledClass sc WHERE sc.datetime >= ' + rmysql.escape(req.params.start) + ' AND sc.datetime < ' + rmysql.escape(req.params.end) + ' AND sc.gymid = ' + data.gymid, function(err, result, fields) {
          if(err || result.length < 1) {
            res.send(400,'{"status": "failed", "message": "no matching results"}');
          } else {
            res.send(result);
          }
        });
      }
    });
  });


  /*app.get('/api/:classId/SCID/:start', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.params.classId).isNumeric();
      check(req.params.start).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 
        rmysql.query('SELECT sc.id FROM scheduledClass sc WHERE classid = ' + rmysql.escape(req.params.classId) + ' AND datetime = ' + rmysql.escape(req.params.datetime) + ' AND sc.gymid = ' + data.gymid, function(err, result, fields) {
          if(err || result.length < 1) {
            res.send(400,'{"status": "failed", "message": "unable to retreive"}');
          } else {
            res.send(result);
          }
        });
      }
    });
  });*/
}