// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var S3Adapter = require('parse-server').S3Adapter;

var databaseUri = 'mongodb://KevinJoslyn:DHSfhp13@ds021681-a.mlab.com:21681/cognistudy';

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'iT8NyJO0dChjLyfVsHUTM8UZQLSBBJLxd43AX9IY',
  masterKey: process.env.MASTER_KEY || '8p24267AaIIe4xUAH3DM0tCuiTv2pko2rreHBfHc', //Add your master key here. Keep it secret!
  fileKey: process.env.FILE_KEY || '3274c5af-e745-4b27-9587-27e43b74c4b8', // For migrated apps, this is necessary to provide access to files already hosted on parse.com
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  filesAdapter: new S3Adapter(
    process.env.AWS_ACCESS_KEY_ID || "AKIAIEUBRE4HCYZ47X4A",
    process.env.AWS_SECRET_ACCESS_KEY || "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",
    process.env.BUCKET_NAME || "cognistudy"
  ),
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('Make sure to star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);