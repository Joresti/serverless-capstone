import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { TodoItem } from '../models/TodoItem';
import * as AWS from "aws-sdk";
import { TodoUpdate } from "../models/TodoUpdate";
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS);
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
});

const todosTableName = process.env.TODOS_TABLE;
const imageBucketName = process.env.ATTACHMENT_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export class TodosAccessService {

    constructor(private docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()) {}

    async getTodosForUser(userId:string): Promise<TodoItem[]> {
        const result =  await this.docClient.query({
            TableName: todosTableName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        return <TodoItem[]>result.Items;
    }

    async createTodo(todoItem: TodoItem) {
        const result = await this.docClient.put({
            TableName: todosTableName,
            Item: todoItem
        }).promise();

        return result;
    }

    async deleteTodo(userId: string, todoId: string) {
        const result = await this.docClient.delete({
            TableName: todosTableName,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise();

        return result;
    }

    async updateTodo(userId: string, todoId:string, todoUpdate: TodoUpdate) {
        const result = await this.docClient.update({
            TableName: todosTableName,
            Key:{
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'set #n = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ":name": todoUpdate.name,
                ":dueDate": todoUpdate.dueDate,
                ":done": todoUpdate.done
            },
            ExpressionAttributeNames:{
                "#n": "name"
            }
        }).promise();

        return result;
    }

    async getUploadUrl(todoId: string) {
        const signedUrl = await s3.getSignedUrl('putObject', {
            Bucket: imageBucketName,
            Key: todoId,
            Expires: +urlExpiration
        });

        return signedUrl;
    }
}
