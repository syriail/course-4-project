import { handlerPath } from "@libs/handler-resolver";

export default {
    handler:`${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    events:[
        {
            http:{
                method: 'delete',
                path: 'todos/{todoId}',
                authorizer: 'auth0Authorizer',
                cors: true,
                
            }
        }
    ],
    iamRoleStatementsInherit: true,
    iamRoleStatements:[
        {
            Effect: 'Allow',
            Action: ['dynamodb:DeleteItem'],
            Resource:{
                'Fn::GetAtt':['TodosTable', 'Arn']
            }
        }
    ]
}