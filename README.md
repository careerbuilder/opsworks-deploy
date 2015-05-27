OpsWorks Deploy
=====

### A cli npm package for deploying to AWS OpsWorks

Usage
-----

The instructions below assume that you have node.js installed (version 0.10.0 or better) and that you have the appropriate IAM permissions granted on your policy.

 1. Setup your AWS Account credentials with the following commands, or use [boto](http://boto.readthedocs.org/en/latest/getting_started.html)

 ```
     export AWS_ACCESS_KEY_ID='YOUR_AWS_KEY'
     export AWS_SECRET_ACCESS_KEY='YOUR_AWS_SECRET'
 ```
 2. Install this module globally using npm.  ```npm install -g opsworks-deploy```
 3. Navigate to your application's root directory
 4. Run ```opsworks-deploy --stack='YOUR_OPSWORKS_STACK_ID' --layer='OPSWORKS_LAYER_ID' --app='OPSWORKS_APP_ID  --elb='ELB_NAME' --rolling='TRUE/FALSE'```

Parameters described:
 1. ```--stack``` The opsworks ID of your stack.
 2. ```--layer``` The opsworks layer ID representing the specific instances you want to deploy to.
 3. ```--app``` The opsworks app ID of the application you wish to deploy.
 4. ```--elb``` The name of the elastic load balancer attached to your layer (used for health checks post deployment).
 5. ```--rolling``` Indicates if an app should do a rolling deployment (true "deploy to one instance at a time") or an "all-at-once" deployment (false).
 6. ```--revision``` (optional) The revision of the specific commit you wish to deploy.  If not provided the git-rev package will be used to determine the reivision of the current commit in your local repository.
