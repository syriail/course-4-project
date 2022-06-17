import {AWS} from '@serverless/typescript'

const S3Resources: AWS['resources']['Resources']={
    AttachmentsBucket:{
        Type: 'AWS::S3::Bucket',
        DeletionPolicy: 'Delete',
        Properties:{
            BucketName:'${self:custom.s3.attachementBucket}',
            CorsConfiguration: {
                CorsRules:[
                    {
                        AllowedOrigins:['*'],
                        AllowedHeaders: ['*'],
                        AllowedMethods:['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
                        MaxAge: 3000
                    }
                ]
            }
        }
    },
    AttachementsBucketPolicy:{
        Type: 'AWS::S3::BucketPolicy',
        Properties:{
          Bucket: {
              Ref: 'AttachmentsBucket'
          },
            PolicyDocument:{
                Version: '2012-10-17',
                Statement:[
                    {
                        Effect: "Allow",
                        Principal: "*",
                        Action: "s3:GetObject",
                        Resource: {
                            'Fn::Join':['/', [{'Fn::GetAtt':['AttachmentsBucket', 'Arn']}, "*"]]
                        }
                    }
                ]
            }
            
        }
    }
}

export default S3Resources