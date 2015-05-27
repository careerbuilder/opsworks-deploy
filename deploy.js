#! /usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var AWS = require('aws-sdk');
AWS.config.region = argv.region || 'us-east-1';

var opsWorks = new AWS.OpsWorks();
var AppService = require('./lib/app_service')(opsWorks);
var DeploymentService = require('./lib/deployment_service')(opsWorks);
var HealthCheckService = require('./lib/health_check_service')(opsWorks);


//OpsWorks Parameters for deployment
var stackId = argv.stack || process.env.AWS_StackId;
var layerId = argv.layer || process.env.AWS_LayerId;
var appId = argv.app || process.env.AWS_AppId;
var revision = argv.revision;

//ELB parameter for healthcheck
var elbName = argv.elb || process.env.AWS_ELB_NAME;

var rollingDeployment = argv.rolling;

var appService = new AppService(revision);
var deploymentService = new DeploymentService(stackId, layerId, appId, rollingDeployment);
var healthCheckService = new HealthCheckService(new AWS.ELB(), elbName);

appService.updateApp(appId, function updateAppResponse() {
    deploymentService.deploy(function deployResponse(status) {
        healthCheckService.waitForHealthyInstance(function healthInstanceResponse(success) {
            console.log('Full Deployment complete!  Result: ' + success);
        });
    });
});
