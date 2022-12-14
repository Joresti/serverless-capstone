import { decode } from 'jsonwebtoken'
import { Jwt } from './Jwt';

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const jwt: Jwt = decode(jwtToken, { complete: true }) as Jwt;
  const idtoken = jwt.payload.sub;
  const userId = idtoken.split("|")[1];

  return userId;
}
