const port = process.env.PORT || 8080;
const app = require('express')();
const bodyParser = require('body-parser');
const utils = require("./utils");
const accesslog = require('access-log');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.post('/webhook', function (req, res) {
    let statusCode = 500;
    utils.getAlerts({body:req.body})       
        .then(json => {
            let promises = json.alerts.map(alert => {
                let obj = {labels:alert.labels};
                return utils.getDeployment(obj)
                        .then(utils.getDesiredReplicas)
                        .then(utils.scaleDeployment);
            })
            return Promise.all(promises);
        })
        .then(json => {
            statusCode = 200;
            res.writeHead(statusCode);
            res.write("OK");
            accesslog(req, res);
            res.end();
        })
        .catch(err => {
            console.log("--- scale error",err);
            res.writeHead(statusCode);
            res.write("ERROR");
            accesslog(req, res);
            res.end();
        });
});
app.all('/*', function (req, res) { // support health  requests
    res.writeHead(200);
    res.write("OK");
    accesslog(req, res);
    res.end();
});
app.listen(port,() => {
    // Put a friendly message on the terminal
    console.log('Server running at http://127.0.0.1:' + port + '/')
});
process.on('uncaughtException', (err) => {
  console.log('uncaughtException: ' + err + " row number " + JSON.stringify(err.stack))
});
