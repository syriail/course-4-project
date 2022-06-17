import { handlerPath } from "@libs/handler-resolver";

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    environment:{
        JWKS_URL: 'https://dev-n1y358ah.us.auth0.com/.well-known/jwks.json'
    },
    iamRoleStatementsInherit: true
}