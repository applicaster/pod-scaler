const port = process.env.PORT || 8080;

const Client = require('kubernetes-client').Client;
const config = require('kubernetes-client').config;
const client = new Client({ config: config.getInCluster() });
client.loadSpec();

const express = require('express');
let app = express();

app.all('/*', function (req, res) {
   
    client.api.v1.pods.get().then((namespaces)=>{
console.log("print ok -print log");
    res.writeHead( 500);
    res.write("print ok" + JSON.stringify(namespaces    ));
    res.end();
    });
    
});
app.listen(port);

// process.on('uncaughtException', function (err, n) {
//   console.log('uncaughtException: ' + err + " row number " + JSON.stringify(err.stack))
// })
// Put a friendly message on the terminal
const mylog  = console.log;
console.log('Server running at http://127.0.0.1:' + port + '/')


// function getDeploymntPods(name){  
//     return new Promise(resolve => {
//         kubectl.pod.list({ app: name}, function(err, pods){
//             let list  = pods.items.map((item)=>item.metadata.name);
//             resolve(list);
//         });
//     })
// }
// function getDeploymnt(name){  
//     return new Promise(resolve => {
//         kubectl.command({ app: name}, function(err, pods){
//             let list  =pods;// pods.items.map((item)=>item.metadata.name);
//             resolve(list);
//         });
//     })
// }
// function setDeploymentScale(name,scaleTo){
//     return new Promise(resolve => {
//         kubectl.command(`scale deploy ${name} --replicas=${scaleTo}`,( pods)=> {
//             resolve(pods);
//         });
//     });
// }
// function getCPU(name,scaleTo){
//     return new Promise(resolve => {
//         kubectl.command(`get nodes --no-headers | awk '{print $1}' | xargs -I {} sh -c 'echo {}; kubectl describe node {} | grep Allocated -A 5 | grep -ve Event -ve Allocated -ve percent -ve -- ; echo'`,( pods)=> {
//             resolve(pods);
//         });
//     });
// }
