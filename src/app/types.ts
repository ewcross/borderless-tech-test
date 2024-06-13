import { S3Client } from "@aws-sdk/client-s3";
import { TextractClient } from "@aws-sdk/client-textract";

export type PassportData = {
  dateOfBirth: string;
  expiryDate: string;
};

export type UserError = { userError: string };

export type Result<T> = { data: T } | UserError;

export type S3 = {
  client: S3Client;
  bucket: string;
};

export type Textract = {
  client: TextractClient;
  bucket: string;
};
