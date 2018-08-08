const Client = require('kubernetes-client').Client;
const config = require('kubernetes-client').config;
const client = new Client({ config: config.getInCluster() });
client.loadSpec();

function getAlerts(json){
    if(json.body && json.body.commonLabels && json.body.alerts){
        json.alerts = json.body.alerts;
        return Promise.resolve(json);
    }
    else{
        return Promise.reject("can't resolve alerts");
    }
}
function scaleDeployment(obj){
    return new Promise(resolve => {
        const replica = {
                spec: {
                    replicas: obj.desiredReplices
                }
            };
        obj.replica = replica;
        client.apis.apps.v1.namespaces(obj.labels.namespace).deployments(obj.labels.deployment).patch({ body: replica }).then(replicaModify => {
            obj.replicaModify = replicaModify
            resolve(obj);
        })
    });
}
function isDeplymentValidToScale(obj){

    if(obj && obj.labels && !isNaN(obj.deployment.body.spec.replicas) 
                         && !isNaN(obj.labels.scaleChange) 
                         && !isNaN(obj.labels.scaleMax) 
                         && !isNaN(obj.labels.scaleMin)){
        return Promise.resolve(obj);
    }
    else
        return Promise.reject("validate falied: one or more lebels varibales not-exist/bad-format");
    
}
function getDesiredReplices(obj){
    obj.desiredReplices  = Math.max(Math.min(parseInt(obj.deployment.body.spec.replicas) + parseInt(obj.labels.scaleChange),parseInt(obj.labels.scaleMax)),parseInt(obj.labels.scaleMin));    
    return Promise.resolve(obj);
}
function getDeployment(obj){
    return client.apis.apps.v1.namespaces(obj.labels.namespace).deployments(obj.labels.deployment).get().then(deployment => {
        obj.deployment = deployment;
        return Promise.resolve(obj);
    });
}
module.exports = {getAlerts,getAlerts,isDeplymentValidToScale,getDesiredReplices,getDeployment};
