import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getTodosForUser, getTodosForUserFilterDueDate } from '../../businessLogic/todos'
import { getUserId } from '../utils';

const logger = createLogger('GetTodos');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("get Todos event: ", event);

    try {
      const userId = getUserId(event);

      let todos;
      let startDate;
      let endDate;

      if (!!event.queryStringParameters) {
        startDate = event.queryStringParameters['startDate'];
        endDate = event.queryStringParameters['endDate'];
      }

      console.log("startDate", startDate, endDate)

      if (!!startDate) {
        todos = await getTodosForUserFilterDueDate(userId, startDate, endDate);
      } else {
        todos = await getTodosForUser(userId);
      }

      logger.info(`Todos fetched for user: ${userId}`, todos);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            items: todos
        })
      };
    } catch(e) {
      logger.error("Failed to fetch todos", e);

      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify('Failed to fetch todos')
      }
    }
});

handler.use(
  cors({
    credentials: true
  })
)
