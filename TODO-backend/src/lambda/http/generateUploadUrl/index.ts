import { handlerPath } from "@libs/handler-resolver";

export default {
    handler:`${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    events:[
        {
            http:{
                method: 'post',
                path: 'todos/{todoId}/attachment',
                authorizer: 'auth0Authorizer',
                cors: true
            }
        }
    ],
    iamRoleStatementsInherit: true,
    iamRoleStatements:[
        {
            Effect: 'Allow',
            Action: ['s3:PutObject'],
            Resource:{
                'Fn::Join':[
                    '/',
                    [
                        {
                            'Fn::GetAtt':['AttachmentsBucket', 'Arn']
                        },
                        '*'
                    ]
                ]
            }
        },
        {
            Effect: 'Allow',
            Action: ['dynamodb:UpdateItem', 'dynamodb:GetItem'],
            Resource:{
                'Fn::GetAtt':['TodosTable', 'Arn']
            }
        }
    ]
}