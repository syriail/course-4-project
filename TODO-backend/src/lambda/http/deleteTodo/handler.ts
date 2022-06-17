import { middyfy } from "@libs/lambda";
import cors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import * as createError from "http-errors";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from '../../../utils/logger'
import {getUserId} from '../../utils'
import {deleteUserTodo} from '../../../businessLogic/todos'

const logger = createLogger('deleteTodo')

const deleteTodo: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult>=>{
    const todoId = event.pathParameters.todoId
    if(!todoId){
        logger.error('Missing todo id')
        throw new createError.BadRequest('Missing todoId')
    }
    const userId = getUserId(event.headers)
    let success: Boolean = false
    try{
        success = await deleteUserTodo(userId, todoId)
   
    }catch(error){
        logger.error('Error while deleting todo')
        throw new createError.InternalServerError(error.message)
    }
    if(!success) throw new createError.NotFound()
    return{
        statusCode: 204,
        body:""
    }
    

}

export const main = middyfy(deleteTodo).use(httpErrorHandler()).use(cors({
    credentials: true
}))