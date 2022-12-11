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
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todoIndexTable = process.env.TODOS_CREATED_AT_INDEX
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

    async createTodo(TodoItem: TodoItem){
        logger.info("Creating new todo object:", TodoItem);
        await this.docClient.put({
            TableName: this.todosTable,
            Item: TodoItem
        }).promise();
        logger.info("Create complete.")
        return TodoItem;
    }

    async updateTodo(todoId, TodoUpdate: TodoUpdate){
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todoIndexTable,
            KeyConditionExpression: "todoId =:todoId",
            ExpressionAttributeValues:{
            ":todoId": todoId
            }
        }).promise();

        logger.info("Updating todo:", {
            todoId: todoId,
            TodoUpdate: TodoUpdate
        });
        
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: result.Items[0].userId,
                createdAt: result.Items[0].createdAt
            },
            UpdateExpression: "SET name = :name, dueDate = :dueDate, done = :done",
            ExpressionAttributeValues: {
                ":name": TodoUpdate.name,
                ":dueDate": TodoUpdate.dueDate,
                ":done": TodoUpdate.done
            }
        }).promise()
        logger.info("Update complete.")
    }

    async deleteTodo(todoId: string){
        logger.info("Deleting todo:", {todoId: todoId});
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todoIndexTable,
            KeyConditionExpression: "todoId =:todoId",
            ExpressionAttributeValues:{
            ":todoId": todoId
            }
        }).promise();
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                "todoId": result.Items[0].todoId
            }
        }).promise()
        logger.info("Delete complete.", {todoId: todoId});
    }
}