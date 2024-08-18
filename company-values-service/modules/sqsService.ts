import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

export default async function sendMessageToReadyQueue(message: string) {
  const sqsClient = new SQSClient({
    region: process.env.AWS_REGION,
  });

  try {
    const command = new SendMessageCommand({
      QueueUrl: process.env.READY_QUEUE_URL,
      MessageBody: message,
    });

    await sqsClient.send(command);
  } catch (error) {
    console.error("Error sending message to SQS: ", error.message);
  }
}
