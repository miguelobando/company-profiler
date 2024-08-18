# Company Values Service

This service is responsible for scraping the company values from a given URL. It uses the [Groq](https://github.com/evanw/node-groq) library to parse the HTML and extract the information. The extracted information is then stored in a DynamoDB table.

## Libraries Used

1. [Groq](https://github.com/evanw/node-groq)
2. [Puppeteer](https://github.com/puppeteer/puppeteer)
3. [Cheerio](https://github.com/cheeriojs/cheerio)
4. AWS SDK for JavaScript

## Initial setup

1. Install the required dependencies by running `npm install`
2. Create a `.env` file in the root directory and add the following variables:

```
GROQ_API_KEYL
LINKEDIN_EMAIL
LINKEDIN_PASSWORD
LLM_MODEL = < used llama-3.1-8b-instant>
AWS_KEY = < AWS Access Key>
AWS_SECRET_KEY = < AWS Secret Key>
AWS_REGION= < AWS Region>
READY_QUEUE_URL= < SQS Queue URL>
```

3.  Run the service by running `npm run start`

## Endpoints

### POST /company-values

This endpoint takes a URL and a user ID as parameters and returns the company values for the given URL. It also sends a message to the ready queue to indicate that the scraping is ready.
