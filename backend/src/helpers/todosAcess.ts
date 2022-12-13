import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE
    ){}

    async getUserTodos(userId: string){
        logger.info('Fetching all todos for userId: ', {userId: userId})
        const result = await this.docClient.query({
                TableName: this.todosTable,
                KeyConditionExpression: "userId =:userId",
                ExpressionAttributeValues:{
                ":userId": userId
            }
          }).promise();
        
        logger.info("Fetching complete.", result.Items)
        return result.Items
    }

    async getTodo(todoId: string, userId: string): Promise<TodoItem> {
        logger.info('Getting to do for userID: ', {userId: userId})

        const query = await this.docClient.query({
            TableName: process.env.TODOS_TABLE,
            KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': todoId
            }
        }).promise()

        const items = query.Items
        return items[0] as TodoItem
    }

    async createTodo(TodoItem: TodoItem){
        logger.info("Creating new todo object:", TodoItem);
        await this.docClient.put({
            TableName: this.todosTable,
            Item: TodoItem
        }).promise();
        logger.info("Create complete.")
        return TodoItem;
    }

    async updateTodo(todoId, userId: string, TodoUpdate: TodoUpdate){
        
        logger.info("Updating todo:", {
            todoId: todoId,
            TodoUpdate: TodoUpdate
        });
        
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: "set #n = :n, dueDate = :dueDate, done = :done",
            ExpressionAttributeValues: {
                ":n": TodoUpdate.name,
                ":dueDate": TodoUpdate.dueDate,
                ":done": TodoUpdate.done,
            },
            ExpressionAttributeNames: { '#n': "name" }
        }).promise();
        logger.info("Update complete.")
    }

    async deleteTodo(userId: string, todoId: string){
        logger.info("Deleting todo:", {todoId: todoId});
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
        }).promise();
        logger.info("Delete complete.", {todoId: todoId, userId: userId});
    }

    // Update attachment Url
    async updateImageSourceToDo(todoId: string, userId: string, imageId: string) {
        logger.info("Updating attachment:", {imageId: imageId});
        var attachmentUrl = `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${imageId}.png`
        if (imageId === "" || imageId === null) {
            attachmentUrl = null
            imageId = null
        }

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: "set attachmentUrl = :attachmentUrl, imageId = :imageId",
            ExpressionAttributeValues: {
                ":attachmentUrl": attachmentUrl,
                ":imageId": imageId,
            },
        }).promise();
        logger.info("Update complete.")
    }
}