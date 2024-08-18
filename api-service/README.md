# API Service

This service is responsible for handling the requests to get the company information.

## Libraries Used

1. [NestJS](https://nestjs.com/)
2. AWS SDK for JavaScript

## Initial Setup

1. Install the required dependencies by running `npm install`
2. Create a `.env` file in the root directory and add the following variables:

```
AWS_REGION=
INFORMATION_GETTER_QUEUE_URL=< SQS Queue URL>
```

3. Run the service by running `npm run start`

## Endpoints

### GET /companies/getinformation

This endpoint takes a URL and a user ID as parameters and returns the company information for the given URL or sends a message to a get information queue if the information is not found in the DynamoDB table.
