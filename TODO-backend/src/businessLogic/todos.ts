import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { TodosAccess } from '../dataLayer/todosAcess'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { TodoUpdate } from "../models/TodoUpdate";
import { UploadAttachmentData } from '../models/UploadAttachmentData'
import { getAttachmentUrls } from "src/dataLayer/attachmentUtils";

// TODO: Implement businessLogic

const todosAccess = new TodosAccess()


export const createTodo = async (request: CreateTodoRequest, userId: string):Promise<TodoItem>=>{
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    return await todosAccess.createTodo({
        userId: userId,
        todoId,
        createdAt,
        name: request.name,
        dueDate: request.dueDate,
        done: false
    })
}

export const getUserTodos = async(userId: string):Promise<TodoItem[]> =>{
    return await todosAccess.getUserTodos(userId)
}

export const deleteUserTodo = async(userId: string, todoId: string):Promise<Boolean>=>{
    return await todosAccess.deleteUserTodo(userId, todoId)
}

export const updateUserTodo = async(userId: string, todoId: string, request: UpdateTodoRequest):Promise<Boolean>=>{
    const todoUpdate: TodoUpdate = {
        userId,
        todoId,
        ...request
    }
    return await todosAccess.updateUserTodo(todoUpdate)
}

/**
 * Get signed upload url for TODO image
 * @param userId user who owns the TODO
 * @param todoId TODO id
 *
 * @returns singned url as string
 * @throws error with '404' message if the TODO does not exist
 */
export const getAttachmentUrl = async(userId: string, todoId: string): Promise<string>=>{
    const logger = createLogger('getAttachmentUrl')
    
    //getUrl from s3
    const urls: UploadAttachmentData = getAttachmentUrls(todoId)
    
    //update TODO with the new url
    const todoExists = await todosAccess.updateTodoAttachment(userId, todoId, urls.attachmentUrl)
    if(!todoExists){
        logger.error('Todo does not exist', {userId, todoId})
        throw new Error('404')
    }
    //return uploadUrl
    return urls.uploadUrl
}