import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode, VerifyOptions } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'


const logger = createLogger('auth')
const jwksUrl = 'https://dev-kpp03kk1.us.auth0.com/.well-known/jwks.json';

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  logger.info("AuthHeader", authHeader)
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  logger.info('jwt decoded', jwt);

  var config = {
    method: 'get',
    url: jwksUrl,
  };

  const secretResponse = await axios(config);
  const secret = `-----BEGIN CERTIFICATE-----\n${secretResponse.data["keys"][0]["x5c"][0]}\n-----END CERTIFICATE-----`;

  const verifyOptions: VerifyOptions = {
    algorithms: ["RS256"]
  }

  return verify(token, secret, verifyOptions) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
