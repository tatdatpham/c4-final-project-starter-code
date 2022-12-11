import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'

// TODO: Implement businessLogic

const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();
export async function getTodosForUser(userId:string){
    return todosAccess.getUserTodos(userId)
}

export async function createTodo(requestBody: CreateTodoRequest, userId: string): Promise<TodoItem>{
    const itemId = uuid.v4();
    return await todosAccess.createTodo({
        todoId: itemId,
        userId: userId,
        createdAt: new Date().toISOString(),
        dueDate: requestBody.dueDate,
        done: false,
        name: requestBody.name,
    })
}

export async function updateTodo(todoId: string, requestBody: UpdateTodoRequest){
    await todosAccess.updateTodo(todoId, requestBody);
}

export async function deleteTodo(todoId: string): Promise<void>{
    await todosAccess.deleteTodo(todoId);
}

export async function createAttachmentPresignedUrl(todoId: string){
    return await attachmentUtils.getUploadUrl(todoId);
}