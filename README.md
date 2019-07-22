# myApp

*For Login And Account Set Up*

This is an app that allows you to create an account via established methods (e.g. twitter, facebook, github, google, etc.) and login/change your account information.

If you create an account without using one of the established methods (i.e. by providing information via the create an account section of the website), then the app requires email verification in order to complete your account set up.


...

**Home Page**

<img src="/MyApp1.PNG" title="home page" alt="home page" width="500px">

**Create an Account**

<img src="/MyApp2.PNG" title="create an account" alt="create an account" width="500px">

**Login Page**

<img src="/MyApp3.PNG" title="login page" alt="login page" width="500px">

**Account Page**

<img src="/MyApp4.PNG" title="account page" alt="account page" width="500px">

**Account Information**

<img src="/MyApp5.PNG" title="account information" alt="account information" width="500px">

***Full Website (https://calm-squash.glitch.me)***


---


## Table of Contents 

> Sections
- [Sample Code](#Sample_Code)
- [Installation](#installation)
- [Features](#features)
- [Contributing](#contributing)
- [Team](#team)
- [FAQ](#faq)
- [Support](#support)
- [License](#license)


---

## Sample Code

```javascript
// passport authentication strategies

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
```

---

## Installation


### Setup


>  install npm and bower packages

```shell
$ npm install
$ bower install
```

- For all of the packages used, refer to the package.json file [here](/package.json).

---

## Features
## Usage (Optional)
## Documentation (Optional)
## Tests (Optional)

---

## Contributing


---

## Team

> Contributors/People

| [**seansangh**](https://github.com/seansangh) |
| :---: |
| [![seansangh](https://avatars0.githubusercontent.com/u/45724640?v=3&s=200)](https://github.com/seansangh)    |
| [`github.com/seansangh`](https://github.com/seansangh) | 

-  GitHub user profile

---

## FAQ

- **Have any *specific* questions?**
    - Use the information provided under *Support* for answers

---

## Support

Reach out to me at one of the following places!

- Twitter at [`@wwinvestingllc`](https://twitter.com/wwinvestingllc?lang=en)
- Github at [`seansangh`](https://github.com/seansangh)

---

## Donations (Optional)

- If you appreciate the code provided herein, feel free to donate to the author via [Paypal](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=4VED5H2K8Z4TU&source=url).

[<img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/cc-badges-ppppcmcvdam.png" alt="Pay with PayPal, PayPal Credit or any major credit card" />](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=4VED5H2K8Z4TU&source=url)
---

## License

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
- Copyright 2019 © <a>S.S.</a>
