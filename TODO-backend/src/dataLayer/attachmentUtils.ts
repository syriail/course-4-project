import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { UploadAttachmentData } from '../models/UploadAttachmentData'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

export const getAttachmentUrls = (key: string): UploadAttachmentData=>{
    const expiration = parseInt(process.env.URL_EXPIRATION)
    const bucketName = process.env.ATTACHMENT_S3_BUCKET 
  const signedUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: key,
    Expires: expiration
  })
  return {
    uploadUrl: signedUrl,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${key}`
  }
}
