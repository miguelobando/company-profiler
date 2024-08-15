#!/bin/bash

# Start localstack
docker run -d -p 4566:4566 -p 4571:4571 localstack/localstack


echo "Waiting for Localstack to be ready..."
sleep 10

# Create SQS queue
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name information-getter-queue --no-cli-pager

echo "Localstack and SQS queue setup completed."