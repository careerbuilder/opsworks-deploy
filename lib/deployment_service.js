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

var LINQ = require('node-linq').LINQ;
var Spinner = require('cli-spinner').Spinner;
module.exports = function DeploymentServiceModule(opsWorks) {
    function DeploymentService(stackId, layerId, appId, rollingDeployment) {
        this.stackId = stackId;
        this.layerId = layerId;
        this.appId = appId;
        this.rollingDeployment = rollingDeployment;
    }

    DeploymentService.prototype.deploy = function(cb) {
        var self = this;
        this.getInstanceIds(function instancesResponse(instanceIds) {
            var options = {};
            if(self.rollingDeployment) {
              console.log('Executing a Rolling Deployment');
              options.instanceIndex = 0;
            }
            self.executeDeployment(instanceIds, options, cb);
        });
    };
  
    DeploymentService.prototype.executeDeployment = function(instanceIds, options, cb) {
      var self = this;
      var deployToInstances = [];    
      if(self.rollingDeployment) {
        deployToInstances.push(instanceIds[options.instanceIndex]);
      }
      else {
        deployToInstances = instanceIds;
      }
      console.log('Deploying to these instances: ' + deployToInstances);
        var deployParams = {
            Command: {
                Name: 'deploy'
            },
            StackId: self.stackId,
            AppId: self.appId,
            InstanceIds: deployToInstances
        };
        opsWorks.createDeployment(deployParams, function(err, data){
            if(err){
                throw err;
            }
            else{
                
                console.log("Deployment Id: " + data.DeploymentId);
                var spinner = new Spinner('deploying.. %s');
                spinner.setSpinnerString('|/-\\');
                spinner.start();
                self.wait(data.DeploymentId, function(status) {
                  if(!self.rollingDeployment || options.instanceIndex === instanceIds.length - 1) { 
                    spinner.stop();
                    cb(status);
                  }
                  else {
                    spinner.stop();
                    options.instanceIndex++;
                    self.executeDeployment(instanceIds, options, cb);
                  }
                });
            }
        });
    };

    DeploymentService.prototype.getInstanceIds = function(cb) {
        opsWorks.describeInstances({LayerId: this.layerId}, function(err, data) {
            if(err) {
                throw err;
            }
            else {
                if(data.Instances && data.Instances.length > 0) {
                    var instanceIds = new LINQ(data.Instances).Where(function(instance) {
                      return instance.Status === 'online';
                    }).Select(function (instance) {
                        return instance.InstanceId;
                    }).ToArray();
                    cb(instanceIds);
                }
                else {
                    throw new NoEC2InstanceAvailableError("No instances are online for deployment");
                }
            }
        });
    };

    DeploymentService.prototype.wait = function(deploymentId, cb) {
        var self = this;
        opsWorks.describeDeployments({DeploymentIds: [deploymentId]}, function(err, data) {
            if(err) {
                throw err;
            }
            else {
                if(data.Deployments[0].Status.toLowerCase() === 'running') {
                    var timeout = 30000;
                    setTimeout(function(){
                        self.wait(deploymentId, cb);
                    }, timeout);
                }
                else {
                    var status = data.Deployments[0].Status;
                    console.log('Deployment Finished.  Status: ' + status);
                    if(status.toLowerCase() === 'failed') {
                        throw new DeploymentFailedException("Deployment failed");
                    }
                    else {
                        cb(status);
                    }
                }
            }
        });
    };

    //Exception for when deployment fails
    function DeploymentFailedException(message){
        this.message = message;
        this.name = "DeploymentFailedException";
    }

    //Exception for when no ec2 instances are available
    function NoEC2InstanceAvailableError(message){
        this.message = message;
        this.name = "NoEC2InstanceAvailableError";
    }

    return DeploymentService;
};