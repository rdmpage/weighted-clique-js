var Clique = require('./clique.js');
var clique = new Clique();

var request = require('request');
var bodyParser = require('body-parser');
//
// This defines three routes that our API is going to use.
//
var routes = function(app) {
  
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
  
//
// This route processes GET requests, by using the `get()` method in express, and we're looking for them on
// the root of the application (in this case that's https://rest-api.glitch.me/), since we've
// specified `"/"`.  For any GET request received at "/", we're sending some HTML back and logging the
// request to the console. The HTML you see in the browser is what `res.send()` is sending back.
//
  app.get("/", function(req, res) {
    //res.send("<h1>REST API</h1><p>Oh, hi! There's not much to see here - view the code instead</p><script src=\"https://button.glitch.me/button.js\" data-style=\"glitch\"></script><div class=\"glitchButton\" style=\"position:fixed;top:20px;right:20px;\"></div>");
    res.sendFile(__dirname + '/views/index.html');
    console.log("Received GET");
  });

  /*
    app.get("/viz.js", function(req, res) {
     res.sendFile(__dirname + '/viz.js');   
     console.log("Received GET");
  });
  */
  

    app.get("/paper/index.html", function(req, res) {
     res.sendFile(__dirname + '/paper/index.html');   
  });
  
    app.get("/paper/IRstyle.css", function(req, res) {
     res.sendFile(__dirname + '/paper/IRstyle.css');   
  });
  
    app.get("/paper/IRstylesans.css", function(req, res) {
     res.sendFile(__dirname + '/paper/IRstylesans.css');   
  });  
   
  
  //---------------------------------------------------
  // handle a search request
  app.get("/find", function(req, res) {
    
    console.log("Received GET: "+JSON.stringify(req.query.q));
    
    var input = JSON.parse(req.query.q);
  
    var C = clique.find(input);
    return res.send(C);

  });    
  
//---------------------------------------------------
  // handle a search request (doesn't work, can't figure out how to send POST to this handler)
  app.post("/find", function(req, res) {
    
    console.log("Received POST: "+  JSON.stringify(req.body));
    
    var input = req.body;
    
    if (Array.isArray(input)) {
      // just array has been parsed
    } else {
      input = req.body.input
    }
    
    var C = clique.find(input);
    return res.send(C);
   
  });      
  
  
};
 
module.exports = routes;