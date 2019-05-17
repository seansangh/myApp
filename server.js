// server.js
// where your node app starts
//http://my-app-239021.appspot.com/auth/google/callback
//
// init project
const express = require('express');
const app = express();
const MongoClient= require('mongodb').MongoClient;
const ObjectId= require('mongodb').ObjectId;
const bodyParser= require('body-parser');

const session= require('express-session');
const fileStore= require('session-file-store')(session);
const helmet= require('helmet');
const passport= require('passport');
const LocalStrategy= require('passport-local');

const GitHubStrategy= require('passport-github').Strategy;
const GoogleStrategy= require('passport-google-oauth20').Strategy;
const TwitterStrategy= require('passport-twitter').Strategy;
const FacebookStrategy= require('passport-facebook').Strategy;

const nodemailer= require('nodemailer');

app.use(helmet.noCache());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile)

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use(session({
  store: new fileStore({logFn: function(){}}),
  secret: process.env.SESSION_SECRET,
  saveUnitialized: true,
  resave: true,
  cookie: { maxAge: 3600000}
}));

app.use(passport.initialize());
app.use(passport.session());

  passport.use(new LocalStrategy(
  function(username, password, done) {
     MongoClient.connect(process.env.DB, function(err,db){
    
    db.collection('account').findOne({name: username, password: password}, function (err, user) {
      console.log('User '+ username +' attempted to log in.');
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (password !== user.password) { return done(null, false); }
      return done(null, user);
    });
       
     })
  }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'https://calm-squash.glitch.me/auth/github/callback',
    scope: 'user:email read:user',
    profileFields : ['id', 'photos', 'name', 'displayName', 'gender', 'profileUrl', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
      //console.log(profile);
      //console.log(profile['emails'][0]['value'])
      return cb(null, profile);
	  
      //Database logic here with callback containing our user object
  }
));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//    callbackURL: 'https://calm-squash.glitch.me/auth/google/callback',
    callbackURL:	'https://calm-squash.glitch.me/auth/google/callback',
    scope: 'user:email read:user',
    profileFields : ['id', 'photos', 'name', 'displayName', 'gender', 'profileUrl', 'email']  
  },
  function(accessToken, refreshToken, profile, cb) {
  
      return cb(null, profile);  
      //Database logic here with callback containing our user object
  }
));

passport.use(new TwitterStrategy({
    clientID: process.env.TWITTER_ACCESS_TOKEN,
    clientSecret: process.env.TWITTER_ACCESS_SECRET,
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL:	'https://calm-squash.glitch.me/auth/twitter/callback',
    includeEmail: true,
},
  function(accessToken, refreshToken, profile, cb) {
  //console.log(profile)
      return cb(null, profile);  
      //Database logic here with callback containing our user object
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL:	'https://calm-squash.glitch.me/auth/facebook/callback',
    enableProof: true,
    profileFields: ['id', 'emails', 'name'] 
  },
  function(accessToken, refreshToken, profile, cb) {
      //console.log(profile._json['email'])
      return cb(null, profile);  
      //Database logic here with callback containing our user object
  }
));



app.get('/auth/facebook', (req,res)=>{req.session.me='one'; res.redirect('/facebook3')})

app.route('/facebook3')
  .get(passport.authenticate('facebook', {scope:['email']}));

app.route('/auth/facebook/callback')
  .get(passport.authenticate('facebook', {failureRedirect: '/'}), (req,res) => {
  //console.log('moo')
  
  if(req.session.me=='one'){
    if(!req.user._json['email']){
      res.redirect('/views/login?invalid2=true')
    }
    else{
    
     MongoClient.connect(process.env.DB, function(err,db){
    
      db.collection('account').find({email: req.user._json['email']}).toArray(function (err, docs) {
    
      if(docs.length<1){    
       res.redirect('/views/login?invalid2=true')
      }
      else{
        req.session.username= docs[0]['name'];
        res.redirect('/account/profile')
      }     
      
      });
       
     })    
    }
  }
  else{  
    
  var u=""; var em=""; var p="";
  var fn= ""; var ln= ""; var a= "";
  var ci= ""; var s= ""; var z= ""; var co= ""; var pn=""; 

    if(!req.user._json['email']){
      res.redirect('/views/login?invalid2=true');
    }
    else if(req.user._json['email'].replace('@','') == req.user._json['email']){
      res.redirect('/views/login?invalid2=true');
    }
    else{
MongoClient.connect(process.env.DB, function(err,db){
    
      db.collection('account').find({email: req.user.emails[0]['value']}).toArray(function (err, docs) {
    
      if(docs.length>=1){    
       res.redirect('/views/login?invalid2=true')
      }
      else{         
      
      
      u=req.user.emails[0].value; em=req.user.emails[0].value; p= Math.floor(Math.random()*500000)+"ds";
      if(req.user.name){
        fn= req.user.name.givenName;
        ln= req.user.name.familyName;
      }

      MongoClient.connect(process.env.DB, function(err,db){
        db.collection('account').insertOne({name:u, email: em, password: p, fn: fn, ln:ln, address: a, city: ci, state: s, zip:z, country: co, phone: pn},(err,docs)=>{
        
        })
      })
      //console.log(req.user)
      req.session.username= req.user.emails[0]['value'];      
      res.redirect('/account/profile');
      
      
      } 
      })
})
      
      
      
    }  
    
    
  }
});


app.get('/auth/twitter', (req,res)=>{req.session.me='one'; res.redirect('/twitter3')})

app.route('/twitter3')
  .get(passport.authenticate('twitter'));

app.route('/auth/twitter/callback')
  .get(passport.authenticate('twitter', {failureRedirect: '/'}), (req,res) => {
    //console.log(req.user.emails[0].value);
  if(req.session.me=='one'){
    if(!req.user.emails[0].value || !req.user._json.need_phone_verification){
      res.redirect('/views/login?invalid2=true')
    }
    else if(req.user._json.need_phone_verification=='true'){
      res.redirect('/views/login?invalid2=true')
    }
    else{
    
     MongoClient.connect(process.env.DB, function(err,db){
    
      db.collection('account').find({email: req.user.emails[0].value}).toArray(function (err, docs) {
    
      if(docs.length<1){    
        res.redirect('/views/login?invalid2=true')
      }
      else{
       req.session.username= docs[0]['name'];
       res.redirect('/account/profile')
      }     
      
      });
       
     })    
    
    }  
  }
  else{
    
  var u=""; var em=""; var p="";
  var fn= ""; var ln= ""; var a= "";
  var ci= ""; var s= ""; var z= ""; var co= ""; var pn=""; 

    if(!req.user.emails[0].value && !req.user._json.need_phone_verification){
      res.redirect('/views/login?invalid2=true')
    }
    else if(req.user._json.need_phone_verification=='true'){
      res.redirect('/views/login?invalid2=true')
    }
    else{
      
MongoClient.connect(process.env.DB, function(err,db){
    
      db.collection('account').find({email: req.user.emails[0]['value']}).toArray(function (err, docs) {
    
      if(docs.length>=1){    
       res.redirect('/views/login?invalid2=true')
      }
      else{         
      
      
      u=req.user.emails[0].value; em=req.user.emails[0].value; p= Math.floor(Math.random()*500000)+"ds";
      if(req.user._json.name){
        var name= req.user.displayName;
        fn= name.match(/^\w*/gi).join('');
        ln= name.replace(fn,'');
      }

      MongoClient.connect(process.env.DB, function(err,db){
        db.collection('account').insertOne({name:u, email: em, password: p, fn: fn, ln:ln, address:a, city: ci, state: s, zip:z, country:co, phone:pn},(err,docs)=>{
        
        })
      })
      //console.log(req.user)
      req.session.username= req.user.emails[0]['value'];      
      res.redirect('/account/profile');
      
      }      
      })
})
      
    }  

  }
  
})



app.get('/auth/google', (req,res)=>{req.session.me='one'; res.redirect('/google3')})

app.route('/google3')
  .get(passport.authenticate('google',{scope:['profile','email']}));


app.route('/auth/google/callback')
  .get(passport.authenticate('google', {failureRedirect: '/'}), (req,res) => {
    //console.log(req.user._json.email)

  if(req.session.me=='one'){
  
    if(!req.user._json.email || !req.user._json['email_verified']){
      res.redirect('/views/login?invalid2=true')
    }
    else if(req.user._json['email_verified']=='false'){
      res.redirect('/views/login?invalid2=true')
    }    
    else{
    
    MongoClient.connect(process.env.DB, function(err,db){
    
      db.collection('account').find({email: req.user._json.email}).toArray(function (err, docs) {
    
      if(docs.length<1){    
         res.redirect('/views/login?invalid2=true')
      }
      else{
        req.session.username= docs[0]['name'];
        res.redirect('/account/profile')
      }     
      
      });
       
    })    
    
    }
    
  }
  else{
   
  var u=""; var em=""; var p="";
  var fn= ""; var ln= ""; var a= "";
  var ci= ""; var s= ""; var z= ""; var co= ""; var pn="";  

    if(!req.user._json.email && !req.user._json['email_verified']){
      res.redirect('/views/login?invalid2=true')
    }
    else if(req.user._json['email_verified']=='false'){
      res.redirect('/views/login?invalid2=true')
    }
    else{
      
MongoClient.connect(process.env.DB, function(err,db){
    
      db.collection('account').find({email: req.user._json.email}).toArray(function (err, docs) {
    
      if(docs.length>=1){    
       res.redirect('/views/login?invalid2=true')
      }
      else{ 
      
      u=req.user._json.email; em=req.user._json.email; p= Math.floor(Math.random()*500000)+"ds";
      if(req.user._json.name){
        var name= req.user._json.name;
        fn= name.match(/^\w*/gi).join('');
        ln= name.replace(fn,'');
      }

      MongoClient.connect(process.env.DB, function(err,db){
        db.collection('account').insertOne({name:u, email: em, password: p, fn: fn, ln:ln, address:a, city: ci, state: s, zip:z,country: co,phone:pn},(err,docs)=>{
        
        })
      })
      //console.log(req.user)
      req.session.username= req.user.emails[0]['value'];      
      res.redirect('/account/profile');    

      }
      })
})
      
      
    }   
  
  }
  
  
});

 app.get('/github', (req,res)=>{req.session.me='one'; res.redirect('/github3')})

 app.route('/github3')
   .get(passport.authenticate('github'));


app.route('/auth/github/callback')
  .get(passport.authenticate('github', {failureRedirect: '/'}), (req,res) => {

  if(req.session.me=='one'){
    if(!req.user.emails[0]['value'] || !req.user.emails[0]['verified']){
      res.redirect('/views/login?invalid2=true')
    }
    else if(req.user.emails[0]['verified']=='false'){
      res.redirect('/views/login?invalid2=true')
    }
    else{
   MongoClient.connect(process.env.DB, function(err,db){
    
    db.collection('account').find({email: req.user.emails[0]['value']}).toArray(function (err, docs) {
    
    if(docs.length<1){    
       res.redirect('/views/login?invalid2=true')
    }
    else{
      req.session.username= docs[0]['name'];
      res.redirect('/account/profile');
    }     
      
    });
       
   })    
      
    }
  }
  else{
    
  var u=""; var em=""; var p="";
  var fn= ""; var ln= ""; var a= ""; var pn="";
  var ci= ""; var s= ""; var z= ""; var co= "";    

    if(!req.user.emails[0]['value'] && !req.user.emails[0]['verified']){
      res.redirect('/views/login?invalid2=true')
    }
    else if(req.user.emails[0]['verified']=='false'){
      res.redirect('/views/login?invalid2=true')
    }
    else{
      
      
     MongoClient.connect(process.env.DB, function(err,db){
    
      db.collection('account').find({email: req.user.emails[0]['value']}).toArray(function (err, docs) {
    
      if(docs.length>=1){    
       res.redirect('/views/login?invalid2=true')
      }
      else{      
      
      
      u=req.user.emails[0]['value']; em=req.user.emails[0]['value']; p= Math.floor(Math.random()*500000)+"ds";

      if(req.user.displayName){
        var name= req.user.displayName;
        fn= name.match(/^\w*/gi).join('');
        ln= name.replace(fn,'');
      }

      MongoClient.connect(process.env.DB, function(err,db){
        db.collection('account').insertOne({name:u, email: em, password: p, fn: fn, ln:ln, address:a, city: ci, state: s, zip:z, country: co, phone: pn},(err,docs)=>{
        
        })
      })
      
      req.session.username= req.user.emails[0]['value'];      
      res.redirect('/account/profile'); 
      
      }
        
      })
     })
      

    }
  }
  
})


app.get('/github2', function(req,res){
  req.session.me='two';
  res.redirect('/github3')
});

app.get('/google2', function(req,res){
  req.session.me='two';
  res.redirect('/google3')
});

app.get('/facebook2', function(req,res){
  req.session.me='two';
  res.redirect('/facebook3')
});

app.get('/twitter2', function(req,res){
  req.session.me='two';
  res.redirect('/twitter3')
});


// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {

  
 // response.sendFile(__dirname + '/views/login.html')
    response.sendFile(__dirname + '/views/index.html');
});

app.get('/views/account', function(request, response) {
  var u=request.query.c; var em=request.query.a; var em2=request.query.b; var un=""; var p=request.query.d;
  var fn= request.query.fn; var ln= request.query.ln; var a= request.query.ad; var pn= request.query.pn;
  var ci= request.query.ci; var s= request.query.s; var z= request.query.z; var co= request.query.co;
  if(request.query.code){
    response.render(__dirname + '/views/account.html',{u:u,em:em,em2:em2,un:un,p:p,fn:fn,ln:ln,a:a,ci:ci,s:s,z:z,co:co,pn:pn});  
  }
  else if(request.query.test=='1'){

    MongoClient.connect(process.env.DB, function(err,db){
      db.collection('account').find({name:u}).toArray((err,docs)=>{
        if(docs.length<1){
      MongoClient.connect(process.env.DB, function(err,db){
        db.collection('account').find({email:em}).toArray((err,docs)=>{
          if(docs.length<1){
        //console.log('a='+request.query.a+'&b='+request.query.b+'&c='+request.query.c+'&d='+request.query.d+'&fn='+request.query.fn+'&ln='+request.query.ln+'&ad='+request.query.ad+'&ci='+request.query.ci+'&s='+request.query.s+'&z='+request.query.z+'&co='+request.query.co+'&pn='+request.query.pn+'&test=2')
          //response.render(__dirname + '/views/account.html',{u:u,em:em,em2:em2,un:un,p:p,fn:fn,ln:ln,a:a,ci:ci,s:s,z:z,co:co,pn:pn,test:2});
            response.redirect('/email?a='+request.query.a+'&b='+request.query.b+'&c='+request.query.c+'&d='+request.query.d+'&fn='+request.query.fn+'&ln='+request.query.ln+'&ad='+request.query.ad+'&ci='+request.query.ci+'&s='+request.query.s+'&z='+request.query.z+'&co='+request.query.co+'&pn='+request.query.pn+'&test=2')
          }        
          else{
            un="emailNo";
            response.render(__dirname + '/views/account.html',{u:u,em:em,em2:em2,un:un,p:p,fn:fn,ln:ln,a:a,ci:ci,s:s,z:z,co:co,pn:pn});
          
          }
        })
      })
        }
        else{
          un="usernameNo";
          response.render(__dirname + '/views/account.html',{u:u,em:em,em2:em2,un:un,p:p,fn:fn,ln:ln,a:a,ci:ci,s:s,z:z,co:co,pn:pn});
        }
      }) 
    })    
    
    
    
  }
  else{
  if(u && em && em2 && p && fn && ln){
    MongoClient.connect(process.env.DB, function(err,db){
      db.collection('account').find({name:u}).toArray((err,docs)=>{
        if(docs.length<1){
      MongoClient.connect(process.env.DB, function(err,db){
        db.collection('account').find({email:em}).toArray((err,docs)=>{
          if(docs.length<1){
     MongoClient.connect(process.env.DB, function(err,db){
      db.collection('account').insertOne({name:u, email: em, password: p, fn: fn, ln:ln, address:a, city: ci, state: s, zip:z, country: co, phone: pn},(err,docs)=>{
        
      })
     })
            
          response.redirect('/success?username='+u+'&password='+p)            
          }        
          else{
            un="emailNo";
            response.render(__dirname + '/views/account.html',{u:u,em:em,em2:em2,un:un,p:p,fn:fn,ln:ln,a:a,ci:ci,s:s,z:z,co:co,pn:pn});
          
          }
        })
      })
        }
        else{
          un="usernameNo";
          response.render(__dirname + '/views/account.html',{u:u,em:em,em2:em2,un:un,p:p,fn:fn,ln:ln,a:a,ci:ci,s:s,z:z,co:co,pn:pn});
        }
      }) 
    })
    
    
  
  }
  else{
  response.render(__dirname + '/views/account.html',{u:u,em:em,em2:em2,un:un,p:p,fn:fn,ln:ln,a:a,ci:ci,s:s,z:z,co:co,pn:pn});
  }
  }
  
  
});

app.get('/success', function(req,res){
  
  if(req.query.username && req.query.password){
    MongoClient.connect(process.env.DB, function(err,db){
      db.collection('account').find({name: req.query.username}).toArray((err,docs)=>{
        if(docs.length<1){          
          res.redirect('/views/login?invalid=true&username='+req.query.username+'&password='+req.query.password)
        }
        else{
          if(docs[0]['password']==req.query.password){
            req.session.username= req.query.username;
            res.redirect('/account/profile')             
          }
          else{
            MongoClient.connect(process.env.DB, function(err,db){
              db.collection('account3').find({code: req.query.password}).toArray((err,docs1)=>{
                if(docs1.length<1){          
                  res.redirect('/views/login?invalid=true&username='+req.query.username+'&password='+req.query.password)
                }
                else{
                  if(docs1[0]['code']==req.query.password){
                    
                    MongoClient.connect(process.env.DB, function(err,db){
                      db.collection('account3').remove({code: docs1[0]['code']},(err,docs)=>{
                      })
                    })
                    
                    req.session.username= req.query.username;
                    res.redirect('/account/profile')             
                  }
                  else{
                    res.redirect('/views/login?invalid=true&username='+req.query.username+'&password='+req.query.password)
                  }
                }        
              })
            })
          
          
          }
        }
      })
    
    })
  }else{
    res.redirect('/views/login')
  }
});


app.get('/success2', function(req,res){
  if(req.query.email && req.query.password){
    MongoClient.connect(process.env.DB, function(err,db){
      db.collection('account').find({email: req.query.email}).toArray((err,docs)=>{
        if(docs.length<1){
          res.redirect('/views/login?invalid=true&email='+req.query.email+'&password='+req.query.password)
        }
        else{
          if(req.query.password == docs[0]['password']){
            req.session.username= docs[0]['name'];
            res.redirect('/account/profile');
          }
          else{
            MongoClient.connect(process.env.DB, function(err,db){
              db.collection('account3').find({code: req.query.password}).toArray((err,docs1)=>{
                if(docs1.length<1){          
                  res.redirect('/views/login?invalid=true&email='+req.query.email+'&password='+req.query.password)
                }
                else{
                  if(docs1[0]['code']==req.query.password){
                    MongoClient.connect(process.env.DB, function(err,db){
                      db.collection('account3').remove({code: docs1[0]['code']},(err,docs)=>{
                      })
                    })
                    
                    req.session.username= docs[0]['name'];
                    res.redirect('/account/profile')             
                  }
                  else{
                    res.redirect('/views/login?invalid=true&email='+req.query.email+'&password='+req.query.password)
                  }
                }        
              })
            })
          
          
          
          
          }
        }
      })
    
    })
  }else{
    res.redirect('/views/login2')
  }
});

app.get('/views/login', function(request, response) {
  var p=request.query.p; var u=request.query.u; var em= request.query.em; var form=request.query.form; var error= request.query.error;
  response.render(__dirname + '/views/login.html',{invalid: request.query.invalid, p:p, u:u, invalid2: request.query.invalid2, em: request.query.em, form: request.query.form, error: request.query.error, display: request.query.display});
});


app.get('/views/login2', function(request, response) {
  var p=request.query.p; var u=request.query.u; var em= request.query.em; var form=request.query.form; var error= request.query.error;
  
  response.render(__dirname + '/views/login2.html',{invalid: request.query.invalid, p:p, u:u, em: request.query.em, form: request.query.form, error: request.query.error, display: request.query.display});
});


app.get('/forgot_password', function(req,res){
  var em=req.query.email || ""; 
  if(req.query.display==1){
      MongoClient.connect(process.env.DB, function(err,db){
       db.collection('account').find({email: em}).toArray((err,docs)=>{
        if(docs.length<1){
          var error="The email address that you have provided is not associated with an account.";
          res.redirect('/views/login?display=1&em='+em+'&error='+error);
        }
        else{
          var code=Math.floor(Math.random()*300)+"mc3g3"+new Date().getDate();
          MongoClient.connect(process.env.DB, function(err,db){
            db.collection('account3').find({email:em}).toArray((err,docs1)=>{
              if(docs1.length<1){
          MongoClient.connect(process.env.DB, function(err,db){
            db.collection('account3').insertOne({code: code,email:em,date:Date.now(),name:docs[0].name},(err,docs)=>{
            })
          })
              }
              else{
               MongoClient.connect(process.env.DB, function(err,db){
                db.collection('account3').remove({email: em},(err,docs)=>{
                })
               })
              MongoClient.connect(process.env.DB, function(err,db){
                db.collection('account3').insertOne({code: code,email:em,date:Date.now(),name:docs[0].name},(err,docs)=>{
                })
              })  
                
                
              }
            }) 
          })
          
          
          
          var error="An email was sent to "+em+" containing a temporary password that you can use to access your account.";
          res.redirect('/email4?display=1&em='+em+'&error='+error+'&code='+code);
        }
       })
      })  
  }
  else{
MongoClient.connect(process.env.DB, function(err,db){
       db.collection('account').find({email: em}).toArray((err,docs)=>{
        if(docs.length<1){
          var error="The email address that you have provided is not associated with an account.";
          res.redirect('/views/login2?display=2&em='+em+'&error='+error);
        }
        else{
          var code=Math.floor(Math.random()*300)+"mc3g3"+new Date().getDate();
          MongoClient.connect(process.env.DB, function(err,db){
            db.collection('account3').find({email:em}).toArray((err,docs1)=>{
              if(docs1.length<1){
          MongoClient.connect(process.env.DB, function(err,db){
            db.collection('account3').insertOne({code: code,email:em,date:Date.now(),name:docs[0].name},(err,docs)=>{
            })
          })              
              }
              else{
               MongoClient.connect(process.env.DB, function(err,db){
                db.collection('account3').remove({email: em},(err,docs)=>{
                })
               })
              MongoClient.connect(process.env.DB, function(err,db){
                db.collection('account3').insertOne({code: code,email:em,date:Date.now(),name:docs[0].name},(err,docs)=>{
                })
              })  
                
              }
            }) 
          })
          

          
          var error="An email was sent to "+em+" containing a temporary password that you can use to access your account.";
          res.redirect('/email4?display=2&em='+em+'&error='+error+'&code='+code);
        }
       })
      })
  }
});


app.get('/account/profile', ensureAuthenticated, function(req,res){
  if(req.session.date==undefined){req.session.date=new Date().toUTCString()}
  //console.log(req.session.date)
  MongoClient.connect(process.env.DB, function(err,db){
      db.collection('account').find({name: req.session.username}).toArray((err,docs)=>{
           res.render(__dirname+'/account/profile.html', {username: req.session.username, date:req.session.date, fn:docs[0]['fn'], ln: docs[0]['ln']})
      })      
  })
})

app.get('/views/logout', function(req,res){
  req.session.destroy();
  req.logout();
  res.redirect('/');
})


app.get('/google3bf2c346cae07e60.html', function(req,res){
  res.send('google-site-verification: google3bf2c346cae07e60.html')
})


app.get('/account/info', function(req,res){
  MongoClient.connect(process.env.DB, function(err,db){
      db.collection('account').find({name: req.session.username}).toArray((err,docs)=>{
         res.render(__dirname+'/account/info.html', {username: req.session.username, docs: docs, date:req.session.date, fn:docs[0]['fn'], ln: docs[0]['ln'], error1: req.query.error1, error2: req.query.error2, error3: req.query.error3})
      })      
  })
})

app.post('/account/info', function(req,res){
  
  MongoClient.connect(process.env.DB, function(err,db){
    db.collection('account').find({name: req.session.username}).toArray((err,docs)=>{
      if(docs.length<1){
        res.redirect('/account/info?error1='+req.session.username);
      }
      else{
        MongoClient.connect(process.env.DB, function(err,db){
          db.collection('account').find({name: req.body.username}).toArray((err,docs2)=>{
            if(docs2.length>1){
              res.redirect('/account/info?error2='+req.body.username)  
            }
            else{
            
            if(docs2.length==1){
              if(docs2[0]._id.toString() != docs[0]._id.toString()){
                res.redirect('/account/info?error2='+req.body.username)  
              }
              else{
                MongoClient.connect(process.env.DB, function(err,db){
                db.collection('account').find({email: req.body.email}).toArray((err,docs3)=>{
                  if(docs3.length>1){
                    res.redirect('/account/info?error3='+req.body.email) 
                  }
                  else{
                  if(docs3.length==1){
                     if(docs3[0]._id.toString() != docs[0]._id.toString()){
                      res.redirect('/account/info?error3='+req.body.username)  
                     }                     
                     else{
                       MongoClient.connect(process.env.DB, function(err,db){
                        db.collection('account').findOneAndUpdate({name: req.session.username},{$set:{name:req.body.username, email: req.body.email, password: req.body.password, fn: req.body.fname, ln: req.body.lname, address: req.body.address, city: req.body.city, state: req.body.state, zip: req.body.zip, country:req.body.country, phone:req.body.phone }},(err,docs)=>{
                          req.session.username= req.body.username;
                          res.redirect('/account/info')
                        })      
                      })
                     }
                  }  
                  else{
                    MongoClient.connect(process.env.DB, function(err,db){
                      db.collection('account').findOneAndUpdate({name: req.session.username},{$set:{name:req.body.username, email: req.body.email, password: req.body.password, fn: req.body.fname, ln: req.body.lname, address: req.body.address, city: req.body.city, state: req.body.state, zip: req.body.zip, country:req.body.country, phone:req.body.phone }},(err,docs)=>{
                        req.session.username= req.body.username;
                        res.redirect('/account/info')
                      })      
                    })
                  
                  
                  }
                  }
                })
              })
     
              }      
            }
            else{
              MongoClient.connect(process.env.DB, function(err,db){
                db.collection('account').find({email: req.body.email}).toArray((err,docs3)=>{
                  if(docs3.length>1){
                    res.redirect('/account/info?error3='+req.body.email) 
                  }
                  else{
                  if(docs3.length==1){
                     if(docs3[0]._id.toString() != docs[0]._id.toString()){
                      res.redirect('/account/info?error3='+req.body.username)  
                     }                     
                     else{
                       MongoClient.connect(process.env.DB, function(err,db){
                        db.collection('account').findOneAndUpdate({name: req.session.username},{$set:{name:req.body.username, email: req.body.email, password: req.body.password, fn: req.body.fname, ln: req.body.lname, address: req.body.address, city: req.body.city, state: req.body.state, zip: req.body.zip, country:req.body.country, phone:req.body.phone }},(err,docs)=>{
                          req.session.username= req.body.username;
                          res.redirect('/account/info')
                        })      
                      })
                     }
                  }  
                  else{
                    MongoClient.connect(process.env.DB, function(err,db){
                      db.collection('account').findOneAndUpdate({name: req.session.username},{$set:{name:req.body.username, email: req.body.email, password: req.body.password, fn: req.body.fname, ln: req.body.lname, address: req.body.address, city: req.body.city, state: req.body.state, zip: req.body.zip, country:req.body.country, phone:req.body.phone }},(err,docs)=>{
                        req.session.username= req.body.username;
                        res.redirect('/account/info')
                      })      
                    })
                  
                  
                  }
                  }
                })
              })
              
            
            }
            }
          })
        })
      
      }
    })
  })
  
  

})


app.get('/email2', function(req,res){
var u=req.query.c; var em=req.query.a; var em2=req.query.b; var un=""; var p=req.query.d;
  var fn= req.query.fn; var ln= req.query.ln; var a= req.query.ad; var pn= req.query.pn;
  var ci= req.query.ci; var s= req.query.s; var z= req.query.z; var co= req.query.co;    
  
  MongoClient.connect(process.env.DB, function(err,db){
    db.collection('account2').find({}).toArray((err,docs)=>{
      if(docs.length>0){
      for(var i=docs.length-1; i>=0; i--){
                   // console.log(docs[i].date+" "+(parseInt(Date.now()-300000)-docs[i].date))
        
        if(docs[i].date<=parseInt(Date.now()-300000)){
        //  MongoClient.connect(process.env.DB, function(err,db){
           db.collection('account2').remove({email: docs[i].email,code:docs[i].code, date:docs[i].date},(err,docs)=>{
           })
       //   })
        }
      }
      }
    })
  })
 // console.log(req.query.email)
  MongoClient.connect(process.env.DB, function(err,db){
    db.collection('account2').find({email: req.query.email, code:req.query.id}).toArray((err,docs)=>{
      if(docs.length<1){
      //  res.send('no results');
        res.redirect('/views/account?a='+em+'&b='+em2+'&c='+u+'&d='+p+'&fn='+fn+'&ln='+ln+'&ad='+a+'&ci='+ci+'&s='+s+'&z='+z+'&co='+co+'&pn='+pn+'&code='+req.query.code+'&test='+'2')

      }
      else{
        if(parseInt(docs[0].date+300000)>= Date.now()){
          //res.send('valid')
          res.redirect('/views/account?a='+em+'&b='+em2+'&c='+u+'&d='+p+'&fn='+fn+'&ln='+ln+'&ad='+a+'&ci='+ci+'&s='+s+'&z='+z+'&co='+co+'&pn='+pn+'&test='+'2')
        }
        else{
       //   res.send('5 minutes have passed');
          res.redirect('/views/account?a='+em+'&b='+em2+'&c='+u+'&d='+p+'&fn='+fn+'&ln='+ln+'&ad='+a+'&ci='+ci+'&s='+s+'&z='+z+'&co='+co+'&pn='+pn+'&code='+req.query.code+'&test='+'2')
          
        }
      
      
      }
                                        
    })
  })  
  
    
})

app.get('/email', function(req,res){
 var u=req.query.c; var em=req.query.a; var em2=req.query.b; var un=""; var p=req.query.d;
  var fn= req.query.fn; var ln= req.query.ln; var a= req.query.ad; var pn= req.query.pn;
  var ci= req.query.ci; var s= req.query.s; var z= req.query.z; var co= req.query.co;  
  
  var name=fn; var code= Math.floor(Math.random()*10).toString()+Math.floor(Math.random()*10).toString()+Math.floor(Math.random()*10).toString()+Math.floor(Math.random()*10).toString()+Math.floor(Math.random()*10).toString()+Math.floor(Math.random()*10).toString();
  
  MongoClient.connect(process.env.DB, function(err,db){
    db.collection('account2').insertOne({email: req.query.a,code:code, date: Date.now()},(err,docs)=>{                                  
    })
  })
  
  
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tuqwotrprq@gmail.com',
    pass: process.env.GMAIL_PASSWORD
  }
});

  
var mailOptions = {
  from: 'noreply:tuqwotrprq@gmail.com',
  to: req.query.a,
  subject: 'Email Verification: https://calm-squash.glitch.me',
  text: 'Hi '+name+',\n\nIn order to create an account, we must verify that the email address that you have provided is valid. Therefore, please use the 6-digit code provided below to verify your email address on the website. Note- This verification code will only be valid for five minutes.\r\r'+code,
 // html: '<p>Hi '+name+',</p> <p>In order to create an account, we must verify that the email address that you have provided is valid. Therefore, please use the 6-digit code provided below to verify your email address on the website.</p><b>'+code+'</b><p><u>Note-</u> This verification code will only be valid for five minutes.</p><p>Sincerely, <br/> The Calm-Squash Team</p>'
  html: '<div class="emailed" style="min-height:200px; background: #f2f2f2; padding-top: 25px; padding-bottom:25px;"><div class="ins" style="width:500px; margin:auto; min-height: 200px; border: 1px solid #f2f2f2; background: white; padding:35px"><p>Hi '+name+',</p><p>In order to create an account on our website (<a href="https://calm-squash.glitch.me">https://calm-squash.glitch.me</a>) we must verify that the email address that you have provided us is valid. If so, please use the 6-digit code provided below to verify your email address on the website.</p><p style="background:#dfeff6; width: 100px; padding: 5px; padding-left: 0px; text-align: center; border-radius: 5px;"><b>'+code+'</b></p><p style="color:silver;font-style:italic"><u>Note-</u> This verification code will only be valid for <b>five</b> minutes.</p><p>Sincerely, <br/> The Calm-Squash Team</p><p style="margin-top:25px;text-align:right;">&copy; 2019 calm-squash.glitch.me</p></div></div>'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
            //console.log('a='+req.query.a+'&b='+req.query.b+'&c='+req.query.c+'&d='+req.query.d+'&fn='+req.query.fn+'&ln='+req.query.ln+'&ad='+req.query.ad+'&ci='+req.query.ci+'&s='+req.query.s+'&z='+req.query.z+'&co='+req.query.co+'&pn='+req.query.pn+'&test=2')
  
  res.redirect('/views/account?a='+em+'&b='+em2+'&c='+u+'&d='+p+'&fn='+fn+'&ln='+ln+'&ad='+a+'&ci='+ci+'&s='+s+'&z='+z+'&co='+co+'&pn='+pn+'&code='+'code'+'&test='+'2')
});

/*var dadate1=Date.now();
console.log(dadate1+" "+parseInt(dadate1+300000))*/







app.get('/email4', function(req,res){
 
  var code= req.query.code; var em= req.query.em; var error= req.query.error;
    
  
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tuqwotrprq@gmail.com',
    pass: process.env.GMAIL_PASSWORD
  }
});

  
var mailOptions = {
  from: 'noreply:tuqwotrprq@gmail.com',
  to: em,
  subject: 'Reset Password: https://calm-squash.glitch.me',
  text: 'Hi,\r We have just received a notification indicating that you may have forgotten or lost the <a href="https://calm-squash.glitch.me">password associated with your account</a>. If so, in order to access your account, we have provided you with a temporary password, below, which you can use in place of your actual password to access your account../r'+code,
  html: '<div class="emailed" style="min-height:200px; background: #f2f2f2; padding-top: 25px; padding-bottom:25px;"><div class="ins" style="width:500px; margin:auto; min-height: 200px; border: 1px solid #f2f2f2; background: white; padding:35px"><p>Hi,</p><p>We have just received a notification indicating that you may have forgotten or lost the <a href="https://calm-squash.glitch.me">password associated with your account</a>. If so, in order to access your account, we have provided you with a temporary password, below, which you can use in place of your actual password to access your account.</p><p style="background:#dfeff6; width: 100px; padding: 5px; padding-left: 0px; text-align: center; border-radius: 5px;"><b>'+code+'</b></p><p style="color:silver;font-style:italic"><u>Note-</u> This password will only be valid for <b>one</b> login attempt, so be sure to reset your password on the website after you log in.</p><p>Sincerely, <br/> The Calm-Squash Team</p><p style="margin-top:25px;text-align:right;">&copy; 2019 calm-squash.glitch.me</p></div></div>'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

  if(req.query.display==1){
    
    res.redirect('/views/login?display=1&em='+req.query.em+'&error='+req.query.error)
  }
  else if(req.query.display==2){
    
    res.redirect('/views/login?display=2&em='+req.query.em+'&error='+req.query.error)
  }
  else{
    res.redirect('/views/login')
  }
});




app.use((req, res, next) => {
  res.status(404)
    .type('text')
    .send('Not Found');
});



// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});


function ensureAuthenticated(req, res, next) {
  if (req.session.username) { return next(); }
  else{res.redirect('/')}
}

