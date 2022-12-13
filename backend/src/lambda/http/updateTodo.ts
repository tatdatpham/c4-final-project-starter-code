import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo, createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object

    const userId = getUserId(event)
    await updateTodo(todoId, userId, updatedTodo);
    // If user submit image, return presigned url
    var uploadUrl: string = "";
    if (updatedTodo.uploadImage === true) {
      uploadUrl = await createAttachmentPresignedUrl(todoId, userId);
    }
    return {
      statusCode: 204,
      body: JSON.stringify({
        "item": updatedTodo,
        "uploadUrl": uploadUrl
      }),
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
