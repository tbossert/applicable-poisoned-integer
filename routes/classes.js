/**
 *  Routes related to classes
 */

//TODO


var config = config = require('config')
  , moment = require('moment')
  , check = require('validator').check
  , errMsg = require('../lib/errMsg')
  , sanitize = require('validator').sanitize
  , extend = require('node.extend');


var dbConn = require('../lib/mysqlConn');
var rmysql = dbConn.rmysql;
var wmysql = dbConn.wmysql;

var memcached = require('../lib/memcached');
var middleFinger = require('../lib/middleFinger');

module.exports = function(app) {
  var colorArr = ['#FF0000','#8A0808','FF8000','#F7FE2E','#00FF00','#0B610B','#00FFFF','#0000FF','#0B0B61','#FA5882','#380B61','#585858']

  //This used by provider panel only - TESTED
  function getColor(providerid,callback) {

    var statement = [
          'SELECT c.color FROM classes c '
        , 'WHERE c.providerid = ' + providerid + 'ORDER BY c.id DESC LIMIT 1'
    ].join(" ");

    rmysql.query(statement, function(err, result, fields) {
      if(!result) {
        callback('#FF0000');
        return;
      } else {
        colorIndex = colorArr.indexOf(result[0].color) + 1;
        callback(colorArr[colorIndex]);
        return;
      }
    });
  }


  //This used by provider panel only - TESTED
  app.get('/api/classes/', [middleFinger.authCheck], function(req, res){
    try {
      check(req.header('token'), errMsg.tokenErr).notNull();
    } catch (e) {
      res.send('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    var statement = [
          'SELECT c.id,c.providerid,c.name,c.duration,c.price,c.spots '
        , 'FROM classes c WHERE c.providerid = ' + req.eData.providerid + ' AND active = true ORDER BY name'
    ].join(" ");

    rmysql.query(statement, function(err, result, fields) {
      if(err) {
        res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}');
      } else {
        res.send( result );
      }
    });
  });


  //This used by customer and partner panel - TESTED
  app.get('/api/classes/:classId', function(req, res){
    try {
      check(req.params.classId, errMsg.classIdErr).isNumeric();
    } catch (e) {
      res.send('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    var classId = req.params.classId;

    memcached.isMemClass(classId, function(err,cData) {
      if(err) {
        res.send('{"status": "failed", "message": "unable to find class: ' + err + '"}');
      } else {
        res.send( cData );
      }
    });
  });


  //This used by partner panel only - TESTED
  app.put('/api/classes/:classId',[middleFinger.authCheck], function(req, res){
    try {
      check(req.header('token'), errMsg.tokenErr).notNull();
      check(req.body.duration, errMsg.durationErr).isNumeric();
      check(req.body.price, errMsg.priceErr).len(1,7).isDecimal();
      check(req.body.spots, errMsg.spotsErr).isNumeric();
      check(req.body.dayPass, errMsg.dayPassErr).isNumeric();
      check(req.params.classId, errMsg.classIdErr).isNumeric();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    var classId = req.params.classId
      , name = req.body.name
      , image = req.body.image
      , instructor = req.body.instructor
      , duration = req.body.duration
      , spots = req.body.spots
      , price = req.body.price
      , dayPass = req.body.dayPass
      , description = req.body.description;

    var statement = [
      'UPDATE classes c '
      , 'SET name = ' + wmysql.escape(name) + ',image = ' + wmysql.escape(image) + ',instructor = ' + wmysql.escape(instructor) + ' '
      , ',duration = ' + duration + ',price = ' + price + ',daypass = ' + dayPass + ',spots = ' + spots + ',`desc` = ' + wmysql.escape(description) + ' '
      , 'WHERE c.id = ' + classId + ' AND c.providerid = ' + req.eData.providerid
    ].join(" ");

    wmysql.query(statement, function(err, result, fields) {
      if(err || result.affectedRows < 1) {
        res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}');
      } else {
        memcached.setMemClass(classId, function(err, cData) { });
        res.send( req.body );
      }
    });
  });


  //This used by partner panel only - TESTED
  app.post('/api/classes/',[middleFinger.authCheck], function(req, res){
    try {
      check(req.header('token'), errMsg.tokenErr).notNull();
      check(req.body.duration, errMsg.durationErr).isNumeric();
      check(req.body.price, errMsg.priceErr).len(1,7).isDecimal();
      check(req.body.spots, errMsg.spotsErr).isNumeric();
      check(req.body.dayPass, errMsg.dayPassErr).isNumeric();

    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    var cid = 0
      , color = ""
      , name = req.body.name
      , image = req.body.image
      , instructor = req.body.instructor
      , duration = req.body.duration
      , price = req.body.price
      , spots = req.body.spots
      , active = 1
      , dayPass = req.body.dayPass
      , description = req.body.description;

    var classesObj = req.body;


    getColor(req.eData.providerid,function(cb) {
      color = cb;

      var statement = [
        'INSERT INTO classes '
        , '(providerid,name,image,instructor,duration,price,spots,active,daypass,`desc`,color) '
        , 'SELECT ' + req.eData.providerid + ',' + wmysql.escape(name) + ',' + wmysql.escape(instructor) + ',' + wmysql.escape(image) + ',' + duration + ',' + price + ',' + spots + ',' + active + ',' + dayPass + ',' + wmysql.escape(description) + ',"' + color + '"'
      ].join(" ");

      wmysql.query(statement, function(err, result, fields) {
        if(err || result.affectedRows < 1) {
          res.send(400,'{"status": "failed", "message": "insert of class into classes table failed: ' + err + '"}');
        } else {
          classesObj.classId = result.insertId;
          memcached.setMemClass(classId, function(err, cData) { });
          res.send( classesObj );
        }
      });
    });
  });


  //This used by partner panel only - TESTED
  app.del('/api/classes/:classId/:cancelFuture',[middleFinger.authCheck], function(req, res){
    try {
      check(req.header('token'), errMsg.tokenErr).notNull();
      check(req.params.classId, errMsg.classIdErr).isNumeric();
      check(req.params.cancelFuture, errMsg.cancelFutureErr).isNumeric();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    var classObj = {};
    classObj.classId = req.params.classId;
    classObj.cancelFuture = req.params.cancelFuture;

    var statement = 'CALL cancelClass(' + classObj.classId + ',' + classObj.cancelFuture + ',@transMess)';

    wmysql.query(statement, function(err, result, fields) {
      console.log(result);
      if(err || result[0][0].transMess !== 'success') {
        res.send(400,'{"status": "failed", "message": "' + result[0][0].transMess + '"}');
      } else {
        memcached.isMemClass(classObj.classId, function(err, data) {
          data.scheduledClasses.forEach(function(scID) {
            memcached.remMemKey('sc' + scID.id, function(err, data) { });
          });
        });
        memcached.remMemKey('c' + classObj.classId, function(err, data) { });
        res.send( classObj );
      }
    });
  });


  //This used by provider panel only - TESTED
  app.get('/api/scheduledClasses/',[middleFinger.authCheck], function(req, res) {
    try {
      check(req.header('token'), errMsg.tokenErr).notNull();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    var start = req.query.start
      , end = req.query.end;
      
    var statement = [
          'SELECT sc.id,sc.classid,sc.active,sc.price,sc.spots,sc.datetime,sc.name'
        , 'FROM scheduledClass sc '
        , 'WHERE sc.providerid = ' + req.eData.providerid
        , 'AND active = true'
        , ((start) ? ' AND sc.datetime >= ' + rmysql.escape(start) : '')
        , ((end) ? ' AND sc.datetime <= ' + rmysql.escape(end) : '')
        , ' ORDER BY sc.datetime'
    ].join(" ");
      
    rmysql.query(statement, function(err, result, fields) {
      if(err) {
        return res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}');
      } else {
        res.send( result );
      }
    });
  });


  //This used by customer and partner panel - TESTED
  app.get('/api/scheduledClasses/:classId',[middleFinger.authCheck], function(req, res) {
    try {
      check(req.params.classId, errMsg.classIdErr).isNumeric();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    var classId = req.params.classId;

    memcached.isMemScheduledClass(classId, function(err, scdata) {
      if(err) {
        return res.send(400,'{"status": "failed", "message":Unable to retrieve class: ' + err + '"');
      }
      res.send( scdata.classInfo );
    });
  });


  //This used by provider panel only - TESTED
  app.post('/api/scheduledClasses/',[middleFinger.authCheck], function(req, res) {
    try {
      check(req.header('token'), errMsg.tokenErr).notNull();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    for (var key in req.body) {
      if (req.body.hasOwnProperty(key)) {
        if (req.body[key] == '') {
          req.body[key] = undefined;
        }
      }
    }
    
    var classObj = extend(true, {}, {
      price: 'price',
      spots: 'spots',
      name : 'name',
      instructor: 'instructor',
      image: 'image',
      daypass: 'daypass',
      desc: '`desc`'
    }, req.body);
    
    classObj.classid = req.body.classid;

    var statement = [
        'INSERT INTO scheduledClass '
      , '(classid,datetime,active,price,providerid,spots,name,instructor,image,daypass,`desc`) '
      , 'SELECT ' + [
           wmysql.escape(classObj.classid),
           wmysql.escape(classObj.datetime),
           '1',
            classObj.price,
            'providerid',
            classObj.spots,
            wmysql.escape(classObj.name)
        ].join(', ') + ' '
      , ',' + classObj.instructor + ',' + wmysql.escape(classObj.image) + ',' + classObj.daypass + ',' + wmysql.escape(classObj.desc) + ' '
      , 'FROM classes WHERE id = ' + wmysql.escape(classObj.classId) + ' AND providerid = ' + req.eData.providerid
    ].join(" ");

    console.log(statement);
        
    wmysql.query(statement, function(err, result, fields) {    
      if(err) {
        res.send(400,'{"status": "failed", "message": "insert of scheduled class record failed: ' + err + '"}');
      } else {
        req.body.id = result.insertId;
        memcached.setMemScheduledClass(classObj.id,function(err, scData) { });
        res.send( req.body );
      }
    }); 
  });


  //This used by partner panel only - TESTED
  app.get('/api/scheduledClasses/:classId/participants/',[middleFinger.authCheck], function(req, res) {
    try {
      check(req.params.classId, errMsg.classIdErr).isNumeric();
      check(req.header('token'), errMsg.tokenErr).notNull();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    var classId = req.params.classId;

    memcached.isMemScheduledClass(classId, function(err, scdata) {
      if(err) {
        return res.send(400,'{"status": "failed", "message":Unable to retrieve class: ' + err + '"');
      }
      res.send( scdata.participants );
    });
  });


  //This used by partner panel only - TESTED
  app.put('/api/scheduledClasses/:classId/participants/:participantId', [middleFinger.authCheck], function(req, res) {
    
    try {
      check(req.header('token'), errMsg.tokenErr).notNull();
      check(req.params.participantId, errMsg.participantIdErr).notNull();
      check(req.body.checkin, errMsg.checkinErr).isNumeric();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    
    var participantId = req.params.participantId;

    var particObj = {
      classId: req.params.classId,
      participantId: req.params.participantId,
      id: req.params.participantId,
          
      checkin: parseInt(req.body.checkin, 10)
    };
      
    console.log("partic obj = ", particObj);
      
    if (particObj.checkin !== 0 && particObj.checkin !== 1) {
      // invalid checkin value, don't update.
      delete particObj.checkin;
    }
      
    var statement = [
        'UPDATE schedule s  '
      , 'SET '
      , (particObj.checkin) >= 0 ? 's.checkin = ' + particObj.checkin + ',' : ''
      , 's.chkintime = NOW() '
      , 'WHERE s.id = ' + participantId + ' AND s.providerid = ' + req.eData.providerid
    ].join(" ");
      
    rmysql.query(statement, function(err, result) {
      if(err) {
        res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}');
      } else {
        memcached.setMemScheduledClass(particObj.classId,function(err, scData) { });
        res.send( particObj );
      }
    });
  });


  //This used by customers only - TESTED
  app.get('/api/classes/:classId/scheduledClasses/', function(req, res){
    try {
      check(req.params.classId, errMsg.classIdErr).isNumeric(); 
    } catch (e) {
      res.send('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    var classId = req.params.classId;
    var scArr = [];

    memcached.isMemClass(classId, function(err, data) {
      if (err || data.scheduledClasses.length < 1) {
        res.send(400,'{"status": "failed", "message":"no scheduled classes found matching this classId"}');
      }
      var dataLen = data.scheduledClasses.length;
      var i = 0;
      data.scheduledClasses.forEach(function(classId) {
        memcached.isMemScheduledClass(classId.id, function(err, scData) {
          scArr.push(scData.classInfo);
          i = i + 1;
          if(dataLen == i) {
            res.send( scArr )
          }
        });
      });
    });
  });


  //This used by partner panel only - TESTED
  app.put('/api/scheduledClasses/:classId', [middleFinger.authCheck], function(req, res) {
    try {
      check(req.header('token'), errMsg.tokenErr).notNull();
      check(req.params.classId, errMsg.classIdErr).isNumeric();
      check(req.body.price, errMsg.priceErr).len(1,7).isDecimal();
      check(req.body.spots, errMsg.spotsErr).isNumeric();
      check(req.body.dayPass, errMsg.dayPassErr).isNumeric();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    var classId = req.params.classId
    , price = req.body.price
    , spots = req.body.spots
    , instructor = req.body.instructor
    , image = req.body.image
    , desc = req.body.desc
    , dayPass = req.body.dayPass;

    var statement = [
          'UPDATE scheduledClass sc '
        , 'SET spots = ' + spots + ',instructor = ' + wmysql.escape(instructor) + ',price = ' + price + ''
        , ',image = ' + wmysql.escape(image) + ',`desc` = ' + wmysql.escape(desc) + ',daypass = ' + dayPass + ' '
        , 'WHERE sc.id = ' + classId + ' AND sc.providerid = ' + req.eData.providerid
    ].join(" ");

    wmysql.query(statement, function(err, result, fields) {
      if(err || result.affectedRows < 1) {
        res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}');
      } else {
        memcached.setMemScheduledClass(classId,function(err, scData) { });
        res.send( req.body );
      }
    }); 
  });

  //This used by partner panel only - TESTED
  app.del('/api/scheduledClasses/:classId', [middleFinger.authCheck], function(req, res){
    console.log(req.params);
    try {
      check(req.header('token'), errMsg.tokenErr).notNull();
      check(req.params.classId, errMsg.classIdErr).isNumeric();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    var classObj = {};
    classObj.classId = req.params.classId;

    var statement = 'CALL cancelScheduledClass(' + classObj.classId + ',@transMess)';

    wmysql.query(statement, function(err, result, fields) {
      if(err || result[0][0].transMess !== 'success') {
        res.send(400,'{"status": "failed", "message": "' + result[0][0].transMess + '"}');
      } else {
        memcached.remMemKey('sc' + classObj.classId, function(err, data) { });
        res.send( classObj );
      }
    });
  });
}