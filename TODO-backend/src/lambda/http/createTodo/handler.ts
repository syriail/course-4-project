import { APIGatewayProxyResult } from 'aws-lambda'
import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway'
import { middyfy } from '@libs/lambda';
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import * as createError from 'http-errors'
import { createLogger } from '../../../utils/logger'
import schema from './schema';
import { CreateTodoRequest } from '../../../requests/CreateTodoRequest'
import { getUserId } from '../../utils';
import { createTodo } from '../../../businessLogic/todos'

const logger = createLogger('createTodo')

const createTodoHanderl: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async(event):Promise<APIGatewayProxyResult>=>{
  const newTodo: CreateTodoRequest = event.body
 
  const userId = getUserId(event.headers)
  logger.info('Create TODO for user:', userId)
  try{
    const createdTodo = await createTodo(newTodo, userId)
    return {
      statusCode:201,
      body: JSON.stringify({item:createdTodo})
    }
  }catch(error){
    logger.error('Error while creating TODO', {message: error.message})
    throw new createError.InternalServerError(error.message)
    
  }
}
export const main = middyfy(createTodoHanderl).use(httpErrorHandler()).use(cors({
  credentials: true
}))

