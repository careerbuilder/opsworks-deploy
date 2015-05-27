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

var Spinner = require('cli-spinner').Spinner;
module.exports = function HealthCheckServiceModule(opsWorks) {
    function HealthCheckService(elb, elbName) {
        this.elb = elb;
        this.healthCheckRemaining = 10;
        this.elbName = elbName;
    }
    HealthCheckService.prototype.waitForHealthyInstance = function(cb) {
        var self = this;
        var spinner = new Spinner('Checking instance health.. %s');
        spinner.setSpinnerString('|/-\\');
        spinner.start();
        setTimeout(function healthCheckTimeout() {
            self.elb.describeInstanceHealth({LoadBalancerName: self.elbName}, function instanceHealthResponse(err, data) {
                if(err) {
                    throw err;
                }
                else {
                    var unhealthyInstances = data.InstanceStates.filter(function (instanceState) {
                        return instanceState.State.toLowerCase() === 'outofservice' || instanceState.State.toLowerCase() === 'unknown';
                    });
                    if(unhealthyInstances && unhealthyInstances.length > 0) {
                        self.healthCheckRecurssive();
                    }
                    else {
                        spinner.stop();
                        cb('Success');
                    }
                }
            });
        }, 30000);
    };

    HealthCheckService.prototype.healthCheckRecurssive = function(cb) {
        this.healthCheckRemaining --;
        if(this.healthCheckRemaining < 1) {
            throw new UnhealthyEC2InstanceError("Instance(s) Health did not recover after several health checks");
        }
        else {
            this.waitForHealthyInstance(cb);
        }
    };

    //Exception for unhealthy EC2 Instances after deployment
    function UnhealthyEC2InstanceError(message){
        this.message = message;
        this.name = "UnhealthyEC2InstanceError";
    }

    return HealthCheckService;
};