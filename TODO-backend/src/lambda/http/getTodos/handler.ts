import { middyfy } from "@libs/lambda";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import * as createError from 'http-errors'
import { createLogger } from '../../../utils/logger'
import { getUserTodos } from '../../../businessLogic/todos'
import { getUserId } from '../../utils';

const logger = createLogger('getTodos')

const getTodos: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult>=>{
    const userId = getUserId(event.headers)
    logger.info('Get TODOs of user:', userId)
    try{
        const items = await getUserTodos(userId)
        return {
            statusCode:200,
            body: JSON.stringify({items})
          }
        
    }catch(error){
        logger.error('Error while fetching TODOs', {message: error.message})
        throw new createError[500](error.message)
    }
}

export const main = middyfy(getTodos).use(httpErrorHandler()).use(cors({
    credentials: true
  }))