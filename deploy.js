#! /usr/bin/env node
/*
     Copyright (C) 2015 Careerbuilder, LLC

     This program is free software: you can redistribute it and/or modify
     it under the terms of the GNU General Public License as published by
     the Free Software Foundation, either version 3 of the License, or
     (at your option) any later version.

     This program is distributed in the hope that it will be useful,
     but WITHOUT ANY WARRANTY; without even the implied warranty of
     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     GNU General Public License for more details.

     You should have received a copy of the GNU General Public License
     along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var argv = require('minimist')(process.argv.slice(2));
var AWS = require('aws-sdk');
AWS.config.region = argv.region || 'us-east-1';

var opsWorks = new AWS.OpsWorks();
var AppService = require('./lib/app_service')(opsWorks);
var DeploymentService = require('./lib/deployment_service')(opsWorks);


//OpsWorks Parameters for deployment
var stackId = argv.stack || process.env.AWS_StackId;
var layerId = argv.layer || process.env.AWS_LayerId;
var appId = argv.app || process.env.AWS_AppId;
var revision = argv.revision;

var rollingDeployment = argv.rolling;

var appService = new AppService(revision);
var deploymentService = new DeploymentService(stackId, layerId, appId, rollingDeployment);

appService.updateApp(appId, function updateAppResponse() {
    deploymentService.deploy(function deployResponse(status) {
        console.log('Full Deployment complete!  Result: ' + status);
    });
});
