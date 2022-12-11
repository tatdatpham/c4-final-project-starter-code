import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
const logger = createLogger('TodosAccess')
export class AttachmentUtils {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly s3 = new XAWS.S3({
            signatureVersion: 'v4'
          }),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todoIndexTable = process.env.TODOS_CREATED_AT_INDEX
    ){}

    async getUploadUrl(todoId: string){
        const uploadUrl = this.s3.getSignedUrl('putObject', {
            Bucket: process.env.ATTACHMENTS_BUCKET,
            Key: todoId,
            Expires: Number(process.env.SIGNED_URL_EXPIRATION)
          });
        logger.info(`Updating todoId ${todoId} with attachmentUrl ${uploadUrl}`)
       const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todoIndexTable,
            KeyConditionExpression: "todoId =:todoId",
            ExpressionAttributeValues:{
            ":todoId": todoId
            }
        }).promise();
        logger.info(result);

        await this.docClient.update({
            TableName: this.todosTable,
            Key: { 
                userId: result.Items[0].userId,
                createdAt: result.Items[0].createdAt
            },
            UpdateExpression: "set uploadUrl=:URL",
            ExpressionAttributeValues: {
              ":URL": uploadUrl.split("?")[0]
          },
          ReturnValues: "UPDATED_NEW"
        })
        .promise();
        
        return uploadUrl
    }
}