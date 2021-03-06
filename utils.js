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
    const replica = {
            spec: {
                replicas: obj.desiredReplicas
            }
        };
    obj.replica = replica;
    console.log(`Scale Deployment ${obj.labels.namespace}.${obj.labels.deployment} to replicas=${obj.desiredReplicas}`);
    return client.apis.apps.v1.namespaces(obj.labels.namespace).deployments(obj.labels.deployment).patch({ body: replica }).then(replicaModify => {
        obj.replicaModify = replicaModify;
        return obj;
    });
}
function isDeploymentValidToScale(obj){
    if(!obj || !obj.labels || isNaN(obj.deployment.body.spec.replicas) 
                           || isNaN(obj.labels.scaleChange) 
                           || isNaN(obj.deployment.body.metadata.annotations["prometheus-pod-scaler/scaleMax"]) 
                           || isNaN(obj.deployment.body.metadata.annotations["prometheus-pod-scaler/scaleMin"])){
        return Promise.reject("validate failed: one or more labels variables not-exist/bad-format");
    }        
    if(obj.deployment.body.spec.replicas != obj.deployment.body.status.availableReplicas && parseInt(obj.labels.scaleChange) > 0){
        return Promise.reject("validate failed: availableReplicas is not match the number of replicas");
    }
    return Promise.resolve(obj);
}
function getDesiredReplicas(obj){
    return isDeploymentValidToScale(obj).then(() =>{
        obj.desiredReplicas  = Math.max(Math.min(parseInt(obj.deployment.body.spec.replicas) + parseInt(obj.labels.scaleChange),parseInt(obj.deployment.body.metadata.annotations["prometheus-pod-scaler/scaleMax"])),parseInt(obj.deployment.body.metadata.annotations["prometheus-pod-scaler/scaleMin"]));    
        return Promise.resolve(obj);
    });
}
function getDeployment(obj){
    return client.apis.apps.v1.namespaces(obj.labels.namespace).deployments(obj.labels.deployment).get().then(deployment => {
        obj.deployment = deployment;
        return Promise.resolve(obj);
    });
}
module.exports = {getAlerts,getAlerts,scaleDeployment,getDesiredReplicas,getDeployment};
