'use server'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { AnalyzeIDCommand, TextractClient } from "@aws-sdk/client-textract";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PassportData, Result, S3, Textract } from '../types';

const region = process.env.REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_KEY;
const bucket = process.env.BUCKET_NAME;

const getS3 = (): S3 | undefined => {
  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    console.log('There was an error authorising S3 client, check environment variables.')
    return undefined;
  }

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    }
  });

  return { client, bucket };
};

const getTextract = (): Textract | undefined => {
  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    console.log('There was an error authorising textract client, check environment variables.')
    return undefined;
  }

  const client = new TextractClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });

  return { client, bucket };
};

export const getPresignedPutUrl = async (key: string): Promise<Result<string>> => {
  const S3 = getS3();
  if (!S3) {
    return { userError: 'We are having trouble on our end, please try again later' };
  }

  const command = new PutObjectCommand({ Bucket: S3.bucket, Key: key });
  const url = await getSignedUrl(S3.client, command, { expiresIn: 3600 });
  return { data: url };
};

export const analyzeImage = async (key: string): Promise<Result<PassportData>> => {
  const textract = getTextract();
  if (!textract) {
    return { userError: 'We are having trouble on our end, please try again later' };
  }

  const analyzeIDCommand = new AnalyzeIDCommand({
    DocumentPages: [{
      S3Object: {
        Bucket: textract.bucket,
        Name: key
      }
    }]
  });

  const errorMessage = 'We were unable to extract the information from your photo, please make sure it clearly shows the photo page of your passport';

  const response = await textract.client.send(analyzeIDCommand);
  if (response.$metadata.httpStatusCode !== 200) {
    return { userError: 'An error occurred while analyzing the image' };
  }

  const fields = response.IdentityDocuments?.[0].IdentityDocumentFields
  if (!fields) {
    return { userError: errorMessage };
  }

  const dateOfBirth = fields.find(elem =>
    elem.Type?.Text === 'DATE_OF_BIRTH'
  )?.ValueDetection?.Text;

  const expiryDate = fields.find(elem =>
    elem.Type?.Text === 'EXPIRATION_DATE'
  )?.ValueDetection?.Text;

  if (!dateOfBirth || !expiryDate) {
    return { userError: errorMessage };
  }

  return {
    data: {
      dateOfBirth,
      expiryDate
    }
  };
};