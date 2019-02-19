var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var mongoose = require('mongoose')
var bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/calendar"

//Dabatase Handling
mongoose.connect(MONGODB_URI)

mongoose.connection.once('open', function() {
  console.log('Connection successful')
}).on('error', function(error){
  console.log('Connection error:' + error)
})

var accountSchema = new mongoose.Schema({
  username: {type: String, required: true, index: {unique: true}},
  password: {type: String, required: true},
  calendar: {type: Array, default: [
    {
        name: "january",
        days: [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]
    },
    {
        name: "february",
        days: [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]
    },
    {
        name: "march",
        days: [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]
    },
    {
        name: "april",
        days: [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]
    },
    {
        name: "may",
        days: [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]
    },
    {
        name: "june",
        days: [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
        ]
    },
    {
        name: "july",
        days: [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]
    },
    {
        name: "august",
        days: [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]
    },
    {
        name: "september",
        days: [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]
    },
    {
        name: "october",
        days: [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]
    },
    {
        name: "november",
        days: [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]
    },
    {
        name: "december",
        days: [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]
    }
]}
});

//Mongoose Middleware
//Password Encryption
accountSchema.pre('save', function(next) {

  var account = this;

  if (!account.isModified('password')) return next();

  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(account.password, salt, function(err, hash) {
        if (err) return next(err);

        // override the cleartext password with the hashed one
        account.password = hash;
        next();
    });
  });
})

accountSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
  });
};

var Account = mongoose.model('Account', accountSchema);

//Login Redirect Middleware
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect('/')
  } else {
    next()
  }
}

const redirectCalendar = (req, res, next) => {
  if (req.session.userId) {
    res.redirect('/mycalendar')
  } else {
    next()
  }
}

/* GET home page. */
router.get('/', redirectCalendar, function(req, res, next) {
  errors = req.session.errors;
  req.session.errors = null;
  res.render('index', {success: false, errors: errors});
});

router.get('/signup', function(req, res, next) {
  errors = req.session.errors;
  req.session.errors = null;
  res.render('signup', {success: false, errors: errors});
});

router.post('/signup', redirectCalendar, function(req, res) {
  const username = req.body.username
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword

  req.check('username', 'Invalid email address').isEmail();
  req.check("password", 'Password is invalid').isLength({min: 6});
  req.check("password", "Passwords don't match").matches(confirmPassword)

  var errors = req.validationErrors();
  if (errors) {
    console.log(errors)
    req.session.errors = errors;
    res.redirect('/signup')
  } else {
    var newAccount = new Account({username: username, password: password})
    newAccount.save(function (err, newAccount) {
      if (err) {console.log(err)
        if (err.name === 'MongoError' && err.code === 11000) {
          console.log("Duplicate Email")
          error = {
            location: 'body',
            param: 'Email',
            msg: 'Email is taken',
          } 
          if (req.session.errors) {req.session.errors.push(error)} else {req.session.errors = [error]}
          res.redirect('/signup')
        }
      } else {
        res.redirect('/')
      }
    })
  }
})

router.post('/', redirectCalendar, function(req, res) {
  const username = req.body.username
  const password = req.body.password

  req.check('username', 'Invalid email address').isEmail();
  req.check("password", 'Password is invalid')
    .isLength({min: 6})

  var errors = req.validationErrors();
  if (errors) {
    console.log(errors)
    req.session.errors = errors;
    res.redirect('/')
  } else {
    Account.findOne({username: username}, function(err, user) {
      if (err) throw err;
      if (user) {
        user.comparePassword(password, function(err, isMatch) {
            if (err) throw err;
            if (isMatch == true) {
              req.session.userId = user._id
              res.redirect('mycalendar')
            } else {
                err = {
                  location: 'body',
                  param: 'password',
                  msg: 'Password is invalid',
                }
                  if (req.session.errors) {req.session.errors.push(err)} else {req.session.errors = [err]}
              }
        })
      } else {
        err = {
          location: 'body',
          param: 'Email',
          msg: 'Email is invalid',
        } 
        if (req.session.errors) {req.session.errors.push(err)} else {req.session.errors = [err]}
        res.redirect('/')
        }
    })
  }
})

router.post('/mycalendar/:month', redirectLogin, function(req, res) {
  const todo = req.body.todo;
  const day = parseInt(req.body.day);
  const month = parseInt(req.body.month);
  console.log(typeof month)

  //Validation
  if (day != NaN && month != NaN) {

  Account.findOne({_id: req.session.userId}, function(err, user) {
    if (err) throw err;
    var d = new Date();
    oldcalendar = user.calendar;
    oldcalendar[month].days[day - 1].push(todo)
    user.calendar = oldcalendar;
    user.markModified('calendar');
    user.save(function (err, updated) {
      if (err) throw err;
      res.redirect('/mycalendar/' + month)
      newcalendar = updated;
    })
  })

  } else {throw new Error("Invalid data")}
});

router.get('/mycalendar', redirectLogin, function(req,res) {
  var d = new Date();
  var currentMonth = d.getMonth()
  res.redirect('/mycalendar/' + currentMonth)
});

router.get('/mycalendar/:month', redirectLogin, function(req, res) {
  Account.findOne({_id: req.session.userId}, function(err, user) {
    if (err) throw err;
    var d = new Date();
    res.render('mycalendar', {userId: req.session.userId, calendar: user.calendar, date: d, userMonth: req.params.month})
    req.session.errors = null;
  })
});

router.post('/deleteTask', function(req, res) {
  const toDelete = req.body.delete.split(',');
    console.log(toDelete)
    toDelete.forEach(function(part, index, array) {
      if (parseInt(array[index]) == NaN) {throw new Error("Invalid data")} else {
        array[index] = parseInt(array[index])
      }
    })

    toDelete.sort(function(a,b){ return b - a; });
    console.log(toDelete)
  const day = parseInt(req.body.day);
  const month = parseInt(req.body.month);
  if (day != NaN && month != NaN) { 
    Account.findOne({_id: req.session.userId}, function(err, user) {
      if (err) throw err;
      oldcalendar = user.calendar;
      toDelete.forEach(function(part, index, array) { 
        oldcalendar[month].days[day - 1].splice(part, 1);
      })
      user.calendar = oldcalendar;
      user.markModified('calendar');
      user.save(function (err, updated) {
        if (err) throw err;
        res.redirect('/mycalendar/' + month)
        newcalendar = updated;
      })
    })
  }
});

router.get('/logout', function(req,res) {
  req.session.userId = null;
  res.redirect('/')
});



module.exports = router;
