import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { createLogger } from '../utils/logger'
const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
const logger = createLogger('TodosAccess')
export class AttachmentUtils {
    constructor(
        private readonly s3 = new XAWS.S3({
            signatureVersion: 'v4'
          })
    ){}

    async getSignedUrl(imageId: string){
        logger.info(`Get imageID ${imageId}`)
        return this.s3.getSignedUrl('putObject', {
            Bucket: process.env.ATTACHMENT_S3_BUCKET,
            Key: imageId + ".png",
            Expires: Number(process.env.SIGNED_URL_EXPIRATION)
          });        
    }

    async deleteImageFile(imageId: string) {
        // Ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObject-property
        await this.s3.deleteObject({
            Bucket: process.env.ATTACHMENT_S3_BUCKET,
            Key: imageId + ".png"
        }).promise();
    }
}