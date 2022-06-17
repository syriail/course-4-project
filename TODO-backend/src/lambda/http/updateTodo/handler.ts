import { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import cors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import { APIGatewayProxyResult } from "aws-lambda";
import * as createError from 'http-errors'
import { updateUserTodo } from '../../../businessLogic/todos'
import { UpdateTodoRequest } from '../../../requests/UpdateTodoRequest'
import { createLogger } from '../../../utils/logger'
import { getUserId } from '../../utils'
import schema from "./schema";

const logger = createLogger('updateTodo')

const updateTodo: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async(event):Promise<APIGatewayProxyResult>=>{
    const todoId = event.pathParameters.todoId
    if(!todoId){
        logger.error('Missing todo id')
        throw new createError.BadRequest('Missing todoId')
    }
    const userId = getUserId(event.headers)
    const updateRequest: UpdateTodoRequest = event.body
    logger.info('Update TODO', {userId, todoId})
    let success: Boolean = false
    try{
        success = await updateUserTodo(userId, todoId, updateRequest)

    }catch(error){
        logger.error('Error while updating todo')
        throw new createError[500]()
    }
    if(!success) throw new createError.NotFound()
    return{
        statusCode: 204,
        body:""
    }
    
}

export const main = middyfy(updateTodo).use(httpErrorHandler()).use(cors({
    credentials: true
}))