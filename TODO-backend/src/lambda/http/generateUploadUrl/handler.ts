import { middyfy } from "@libs/lambda";
import cors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import * as createError from 'http-errors'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from '../../../utils/logger'
import { getUserId } from '../../utils';
import { getAttachmentUrl } from "src/businessLogic/todos";

const logger = createLogger('generateUploadUrl')

const generateUploadUrl: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>=>{
    const todoId = event.pathParameters.todoId
    if(!todoId){
        logger.error('Missing todo id')
        throw new createError.BadRequest('Missing todoId')
    }
    const userId = getUserId(event.headers)
    try{
        const uploadUrl = await getAttachmentUrl(userId, todoId)
        return {
            statusCode: 200,
            body: JSON.stringify({uploadUrl})
        }
    }catch(error){
        if(error.message === '404'){
            logger.error('Todo does not exist')
            throw new createError.NotFound('Todo does not exist')
        }
        logger.error('Internal server error', {message: error.message})
        throw new createError.InternalServerError(error.message)
    }
    
    
}

export const main = middyfy(generateUploadUrl).use(httpErrorHandler()).use(cors({
    credentials: true
}))