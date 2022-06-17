import { middyfy } from "@libs/lambda";
import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerHandler, APIGatewayAuthorizerResult } from "aws-lambda";
import httpErrorHandler from '@middy/http-error-handler'
import * as createError from 'http-errors'
import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../../auth/Jwt'
import { JwtPayload } from '../../../auth/JwtPayload'

const logger = createLogger('auth')

//This map is used to cache the x509 certificate chain for each key,
//so we don't need to fetch JWKS every time.
const keysCertMap: Map<string, string> = new Map()

const auth0Authorize: APIGatewayAuthorizerHandler = async(event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> =>{


    logger.info('Authorizing a user', {message: JSON.stringify(event.authorizationToken)})
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

const verifyToken = async(authHeader: string): Promise<JwtPayload> =>{
    const token = getToken(authHeader)
    const jwt: Jwt = decode(token, { complete: true }) as Jwt
    const kid= jwt.header.kid
    
    if(!kid){
      logger.error('No kid found in the token header')
      logger.info(jwt)
      throw new createError.Unauthorized()
    } 
    const cert = await getCertificate(kid)
    return verify(token, cert, {algorithms: ['RS256']}) as JwtPayload
    
  }
  
  const getToken = (authHeader: string): string =>{
    if (!authHeader) throw new Error('No authentication header')
  
    if (!authHeader.toLowerCase().startsWith('bearer '))
      throw new Error('Invalid authentication header')
  
    const split = authHeader.split(' ')
    const token = split[1]
  
    return token
  }
const getCertificate = async(kid:string): Promise<string>=>{
  //If the kid already exists, then return it from cache
  const cachedCert = keysCertMap.get(kid)
  if(cachedCert) {
    logger.info('Return the certificate from cache')
    return cachedCert
  }
  //Fetch JWKS
  logger.info('Fetch certificate from Auth0 JWKS')
  const jwksResponse = await Axios.get(process.env.JWKS_URL)
  const jwks = jwksResponse.data
  const keys = jwks.keys
  if(!keys || keys.length === 0) {
    logger.error('No keys found in JWKS')
    throw new createError.Unauthorized()
  }
  //Get the corresponding JWK which matches the kid in the authorization header.
  //If none found, return Unauthorized
  const singingKey = keys.find(key =>
    key.kid === kid
  )
  if(!singingKey) {
    logger.error('No signing key foud which matches the given kid')
    throw new createError.Unauthorized()
  }
  if(!singingKey.x5c || !singingKey.x5c.length){
    logger.error('No certificate found for the given kid')
    throw new createError.Unauthorized()
  }
  
  const cert = certToPEM(singingKey.x5c[0])
  //Cache the certificate
  keysCertMap.set(kid, cert)
  //return the Certificate
  return cert

}
//This function authored by https://gist.github.com/chatu/7738411c7e8dcf604bc5a0aad7937299
const certToPEM = (cert) =>{
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}

export const main = middyfy(auth0Authorize).use(httpErrorHandler())