import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createAttachmentPresignedUrl, getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'

const logger = createLogger('GenerateUploadUrl');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Generate Upload Url event", event)
    try { 
      const todoId = event.pathParameters.todoId;
      const userId = getUserId(event);

      const usersTodos = await getTodosForUser(userId);
      const todoIdBelongsToUser = !!usersTodos.find(todo=> todo.todoId === todoId);

      if (!todoIdBelongsToUser) {
        logger.info("Failed to generate upload url - bad request", event)
        return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
          },
          body: 'Invalid todoId provided'
        }
      }
      // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
      const url = await createAttachmentPresignedUrl(todoId);

      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          uploadUrl: url
        })
      }
    } catch(e) {
      logger.error("Failed to generate upload url", e);

      return {
        statusCode: 500,
        body: "Failed to generate upload url"
      }
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
