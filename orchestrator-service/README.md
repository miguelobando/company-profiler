# Orchestrator Service

This service orchestrates the scraping of company values from a given URL and notifies the scraping ready topic when the scraping is ready.

## Libraries Used

1. AWS SDK for JavaScript
2. [Axios](https://github.com/axios/axios)
3. [NestJS](https://github.com/nestjs/nest)

## Initial Setup

1. Install the required dependencies by running `npm install`
2. Create a `.env` file in the root directory and add the following variables:

```bash

AWS_REGION = <AWS Region>
INFORMATION_GETTER_QUEUE_URL = <SQS Queue URL>
SCRAPING_READY_QUEUE_URL = <SQS Queue URL>
SCRAPING_READY_TOPIC_ARN = <SNS Topic ARN>
SCRAPER_ENDPOINT = <API Base Endpoint>

```

3. Run the service by running `npm run start`
