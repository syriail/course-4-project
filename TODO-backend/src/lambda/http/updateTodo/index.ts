import { handlerPath } from "@libs/handler-resolver";
import schema from "./schema";

export default {
    handler:`${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    events:[
        {
            http:{
                method: 'patch',
                path: 'todos/{todoId}',
                authorizer: 'auth0Authorizer',
                cors: true,
                request:{
                    schemas:{
                        'application/json': schema,
                    }
                }
                
            }
        }
    ],
    iamRoleStatementsInherit: true,
    iamRoleStatements:[
        {
            Effect: 'Allow',
            Action: ['dynamodb:UpdateItem'],
            Resource:{
                'Fn::GetAtt':['TodosTable', 'Arn']
            }
        }
    ]
}