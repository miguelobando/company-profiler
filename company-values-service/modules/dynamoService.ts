import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
// set up the DynamoDB client with credentials
const client = new DynamoDBClient({
  region: "us-east-1",
});

export const saveResult = async (id: string, data: string) => {
  const command = new PutItemCommand({
    TableName: "company-profiler-table",
    Item: {
      id: {
        S: id,
      },
      companyValues: {
        S: data,
      },
    },
  });
  try {
    await client.send(command);
  } catch (error) {
    console.log("Error saving item to DynamoDB: ", error);
  }
};
