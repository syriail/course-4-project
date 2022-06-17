import type { AWS } from '@serverless/typescript';
import stage from './stage'
import DynamoDbResources from './serverless/dynamodb'
import S3Resources from './serverless/s3'
import GateWayResources from './serverless/gatewayResources'
import {
  createTodo,
  auth0Authorizer,
  getTodos,
  deleteTodo,
  updateTodo,
  generateUploadUrl
} from '@functions'


const serverlessConfiguration: AWS = {
  service: 'todo-backend',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-iam-roles-per-function',
    'serverless-plugin-tracing'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    profile: 'udacity',
    region: 'us-east-1',
    stage: stage,
    tracing:{
      lambda: true,
      apiGateway: true
    },
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      TODOS_TABLE: '${self:custom.tables.todoTable}',
      TODOS_CREATED_AT_INDEX: '${self:custom.tables.todoCreatedAtIndex}',
      ATTACHMENT_S3_BUCKET: '${self:custom.s3.attachementBucket}',
      SIGNED_URL_EXPIRATION: '300'
    },
    iam:{
      role:{
        statements:[
          {
            Effect: 'Allow',
            Action:[
              'xray:PutTelemetryRecords',
              'xray:PutTraceSegments'
            ],
            Resource: '*'
          }
        ]
      },
    },
    logs:{
      restApi: true
    }
  },
  // import the function via paths
  functions: {
    auth0Authorizer,
    createTodo,
    getTodos,
    deleteTodo,
    updateTodo,
    generateUploadUrl
  },
  resources:{
    Resources:{
      ...DynamoDbResources,
      ...S3Resources,
      ...GateWayResources
    }
  },
  package: { individually: true },
  custom: {
    tables:{
      todoTable: 'Todos-${self:provider.stage}',
      todoCreatedAtIndex: 'CreatedAtIndex'
    },
    s3:{
      attachementBucket: 'ghrer-todo-images-${self:provider.stage}'
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
