import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

export class DynamoDBService {
  private dynamodbClient: DynamoDBClient;
  constructor(private readonly region: string) {
    this.dynamodbClient = new DynamoDBClient({
      region: this.region,
    });
  }

  public async getItem(id: string) {
    const command = new GetItemCommand({
      TableName: 'company-profiler-table',
      Key: {
        id: {
          S: id,
        },
      },
    });
    try {
      const response = await this.dynamodbClient.send(command);
      if (response.Item) {
        const keys = Object.keys(response.Item);
        const values = Object.values(response.Item);
        const toReturn = {};
        for (let i = 0; i < keys.length; i++) {
          toReturn[keys[i]] = values[i].S;
        }
        return toReturn;
      } else {
        return null;
      }
    } catch (error) {
      console.log('Error getting item from DynamoDB: ', error);
      return null;
    }
  }
}
