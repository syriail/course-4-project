import {AWS} from '@serverless/typescript'

const DynamodDbResources: AWS['resources']['Resources']={
    TodosTable:{
        Type: 'AWS::DynamoDB::Table',
        Properties:{
            TableName: '${self:custom.tables.todoTable}',
            AttributeDefinitions:[
                {
                    AttributeName: 'userId',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'todoId',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'createdAt',
                    AttributeType: 'S'
                }
            ],
            KeySchema:[
                {
                    AttributeName: 'userId',
                    KeyType: 'HASH'
                },
                {
                    AttributeName: 'todoId',
                    KeyType: 'RANGE'
                }
            ],
            BillingMode: 'PAY_PER_REQUEST',
            LocalSecondaryIndexes:[
                {
                    IndexName:'${self:custom.tables.todoCreatedAtIndex}',
                    KeySchema:[
                        {
                            AttributeName: 'userId',
                            KeyType: 'HASH'
                        },
                        {
                            AttributeName: 'createdAt',
                            KeyType: 'RANGE'
                        }       
                    ],
                    Projection:{
                        ProjectionType: 'ALL'
                    }
                }
            ]
        }
    }
}
export default DynamodDbResources