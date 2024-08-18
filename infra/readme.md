## Infrastructure

This folder contains the CloudFormation template for the infrastructure using
serverless framework.

It creates the following resources:

1. A DynamoDB table to store the company information
2. A SQS queue to send messages to the scraping ready queue
3. A SNS topic to notify when the scraping is ready
4. A SQS queue to receive messages from the information getter queue

## Initial Setup

1. Install the required dependencies by running `npm install`
2. Setup the AWS CLI by running `aws configure` with the appropriate credentials
3. Run the following command to deploy the infrastructure:

```
serverless deploy
```

4. Get all information from the serverless deployment and add them to the `.env` file in the root directory of every service as needed.
