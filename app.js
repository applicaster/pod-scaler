// ready pod / available pod 
// change request url from * to webhook
// change to annotation mix/max
// todo change name: prometheus pods scaler 
// terraform run command: helm create name

const port = process.env.PORT || 8080;
const app = require('express')();
const bodyParser = require('body-parser');
const utils = require("./utils");
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.post('/webhook?', function (req, res) {
    let statusCode = 500;
    utils.getAlerts({body:req.body})       
        .then(json => {
            console.log("alerts length", json.alerts.length);
            let promises = json.alerts.map(alert => {
                let obj = {labels:alert.labels};
                return utils.getDeployment(obj)
                        .then(utils.getDesiredReplicas)
                        .then(utils.scaleDeployment);
            })
            return Promise.all(promises);
        })
        .then(json => {
            //statusCode = 200;
            console.log("---  success");
            res.writeHead(statusCode);
            res.write("print ok" + JSON.stringify(json));
            res.end();
        })
        .catch(err => {
            console.log("--- error",err);
            res.writeHead(statusCode);
            res.write("err" + JSON.stringify(err));
            res.end();
        });
});
app.all('/*', function (req, res) {
    console.log("start 'ALL' request url:" + req.url);
    res.writeHead(200);
    res.write("ALL request: "+ req.url);
    res.end();
});
app.listen(port,() => {
    // Put a friendly message on the terminal
    console.log('Server running at http://127.0.0.1:' + port + '/')
});
process.on('uncaughtException', (err, n) => {
  console.log('uncaughtException: ' + err + " row number " + JSON.stringify(err.stack))
});
