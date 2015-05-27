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