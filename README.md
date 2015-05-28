OpsWorks Deploy
=====

### A cli npm package for deploying to AWS OpsWorks

Usage
-----

The instructions below assume that you have node.js installed (version 0.10.0 or better) and that you have the appropriate IAM permissions granted on your policy.
To read more on permissions visit [Managing AWS OpsWorks User Permissions](http://docs.aws.amazon.com/opsworks/latest/userguide/opsworks-security-users.html) in the AWS Docs.

 1. Setup your AWS Account credentials with the following commands, or use [boto](http://boto.readthedocs.org/en/latest/getting_started.html)

 ```
     export AWS_ACCESS_KEY_ID='YOUR_AWS_KEY'
     export AWS_SECRET_ACCESS_KEY='YOUR_AWS_SECRET'
 ```
 For more info visit [Managing Access Keys for IAM Users](http://docs.aws.amazon.com/IAM/latest/UserGuide/ManagingCredentials.html) in the AWS Docs.

 2. Install this module globally using npm.
 ```npm install -g opsworks-deploy```

 3. Navigate to your application's root directory
 4. Start the deployment by running the following command filling in the parameters (described below).
 ```
     opsworks-deploy --stack=YOUR_OPSWORKS_STACK_ID --layer=OPSWORKS_LAYER_ID --app=OPSWORKS_APP_ID  --elb=ELB_NAME --rolling=TRUE
 ```

Parameters described:

 |Description|Cli Param|process.env Param|Required?|Default Value|
 |:---|:---|:---|:---|:---|
 |The AWS region in which your stack is located.|region|none|no|'us-east-1'|
 |The opsworks ID of your stack.|stack|AWS_StackId|yes|none|
 |The opsworks layer ID representing the specific instances you want to deploy to.|layer|AWS_LayerId|yes|none|
 |The opsworks app ID of the application you wish to deploy.|app|AWS_AppId|yes|none|
 |The name of the elastic load balancer attached to your layer (used for health checks post deployment).|elb|AWS_ELB_NAME|yes|none|
 |Indicates if an app should do a rolling deployment (true "deploy to one instance at a time") or an "all at once" deployment (false).|rolling|none|no|false|
 |The revision of the specific commit you wish to deploy.  If not provided the git-rev package will be used to determine the reivision of the current commit in your local repository.|revision|none|no|long revision value generated from git-rev package|
