import { TodosAccessService } from "../accessLayer/todosAccess";
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { uuid } from 'uuidv4';

const imageBucketName = process.env.ATTACHMENT_S3_BUCKET;
const usersAccess = new TodosAccessService();

export const  getTodosForUser = async (userId: string) => {
    return await usersAccess.getTodosForUser(userId);
}

export const createTodo = async (userId: string, createTodoRequest: CreateTodoRequest) => {
    const todoId = uuid();
    
    const todoItem: TodoItem = {
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        dueDate: createTodoRequest.dueDate,
        name: createTodoRequest.name,
        done: false,
        attachmentUrl: `https://${imageBucketName}.s3.amazonaws.com/${todoId}`,
    }
    await usersAccess.createTodo(todoItem);

    return todoItem;
}

export const deleteTodo = async (userId: string, todoId: string) => {
    await usersAccess.deleteTodo(userId, todoId);
}

export const updateTodo = async (userId: string, todoId: string, todoUpdate: CreateTodoRequest) => {
    await usersAccess.updateTodo(userId, todoId, <TodoUpdate>todoUpdate);
};

export const createAttachmentPresignedUrl = async (todoId: string) => {
    return await usersAccess.getUploadUrl(todoId);
};