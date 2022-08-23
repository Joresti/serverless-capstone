import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('CreateTodos');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Create todo event: ", event)
    try {
      const userId = getUserId(event);
      const newTodo: CreateTodoRequest = JSON.parse(event.body);
  
      const result = await createTodo(userId, newTodo);
  
      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item: result
        })
      };
    } catch (e) {
      logger.error("Failed to create todo");

      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify('Failed to create todo')
      }
    }

    return undefined
}
)

handler.use(
  cors({
    credentials: true
  })
)
