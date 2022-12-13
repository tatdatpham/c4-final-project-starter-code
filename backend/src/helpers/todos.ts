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

export async function updateTodo(todoId: string, userId: string, requestBody: UpdateTodoRequest){
    await todosAccess.updateTodo(todoId, userId, requestBody);
}

export async function deleteTodo(userId: string, todoId: string): Promise<void>{
    await deleteImageTodo(todoId, userId)
    await todosAccess.deleteTodo(userId, todoId);
}

export async function createAttachmentPresignedUrl(todoId: string, userId: string){
    // Random image id
    const imageId = uuid();
    await todosAccess.updateImageSourceToDo(todoId, userId, imageId);
    // Get upload url
    return await attachmentUtils.getSignedUrl(imageId);
}

export async function deleteImageTodo(todoId: string, userId: string) {
    const todo = await todosAccess.getTodo(todoId, userId)

    if (todo.attachmentUrl !== undefined && todo.attachmentUrl !== null && todo.attachmentUrl !== "") {

        // Delete old image
        await attachmentUtils.deleteImageFile(todo.attachmentUrl)
        await todosAccess.updateImageSourceToDo(todoId, userId, '');
    }
}

