import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess{
    constructor(
        private readonly documentClien = createDynamodbClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly sortByCreateDateIndex = process.env.TODOS_CREATED_AT_INDEX
    ){}
    async createTodo(todo: TodoItem):Promise<TodoItem>{
        logger.info('Create Todo item', todo)
        await this.documentClien.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()
        return todo
    }
    async getUserTodos(userId: string):Promise<TodoItem[]>{
        logger.info('Fetch TODOs of user:', userId)
        const params: AWS.DynamoDB.DocumentClient.QueryInput = {
            TableName:this.todosTable,
            IndexName: this.sortByCreateDateIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues:{
                ':userId': userId
            }
        }
        const response = await this.documentClien.query(params).promise()
        return response.Items as TodoItem[]
    }
    async deleteUserTodo(userId: string, todoId:string):Promise<Boolean>{
        logger.info('Delete TODO', {userId, todoId})
        const params: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
            TableName: this.todosTable,
            Key:{
                userId,
                todoId
            },
            ConditionExpression: 'attribute_exists(todoId)'
        }
        try{
            await this.documentClien.delete(params).promise()
            return true
        }catch(error){
            if(error.code === 'ConditionalCheckFailedException'){
                logger.info('Todo not found to delete')
                return false
            }else{
                throw error  
            }
            
            
        }
    }
    async updateUserTodo(todoUpdate: TodoUpdate):Promise<Boolean>{
        logger.info('Update TODO', {...todoUpdate})
        const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: this.todosTable,
            Key:{
                userId: todoUpdate.userId,
                todoId: todoUpdate.todoId
            },
            UpdateExpression: 'SET #todoName = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames:{
                "#todoName": 'name'
            },
            ExpressionAttributeValues:{
                ":name": todoUpdate.name,
                ":dueDate": todoUpdate.dueDate,
                ":done": todoUpdate.done
            },
            ConditionExpression: 'attribute_exists(todoId)'
        }
        try{
            await this.documentClien.update(params).promise()
            return true
        }catch(error){
            if(error.code === 'ConditionalCheckFailedException'){
                logger.info('Todo not found to update')
                return false
            }
            throw error
            
        }
    }
    /**
     * Updates the attachment url of a given TODO
     * @param userId user who owns the TODO
     * @param todoId TODO id
     * @param attachmentUrl image url
     *
     * @returns true if update successfull, false if the TODO does not exists
     * @throws Error if a system error happens
     */
    async updateTodoAttachment(userId: string, todoId: string, attachmentUrl){
        logger.info('Update TODO attachmentUrl', {userId, todoId, attachmentUrl})
        const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: this.todosTable,
            Key:{
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'SET attachmentUrl = :attachmentUrl',

            ExpressionAttributeValues:{
                ":attachmentUrl": attachmentUrl
            },
            ConditionExpression: 'attribute_exists(todoId)'
        }
        try{
            await this.documentClien.update(params).promise()
            return true
        }catch(error){
            if(error.code === 'ConditionalCheckFailedException'){
                logger.info('Todo not found to update')
                return false
            }
            throw error
            
        }
    }
}
const createDynamodbClient = ()=>{
    if(process.env.IS_OFFLINE){
        return new AWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }
    return new XAWS.DynamoDB.DocumentClient()
}