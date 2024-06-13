'use client'

import Image from "next/image";
import { ChangeEvent, FormEvent, useState } from "react";
import { analyzeImage, getPresignedPutUrl } from "../actions/s3actions";
import { PassportData } from "../types";
import { putImageToS3 } from "../utils/putImageToS3";
import { Skeleton } from "./ui/skeleton";

export const ImageAnalyzer = () => {
  const [preview, setPreview] = useState<string | undefined>();
  const [passportData, setPassportData] = useState<PassportData | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const objectKey = 'images/unique-key';

  const handleError = (errorMessage: string): void => {
    setErrorMessage(errorMessage);
    setIsLoading(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(undefined);
    const file = e.target.files?.[0];
    if (!file) {
      setErrorMessage('There was an error selecting your file, please try again.');
    } else {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreview(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPassportData(undefined);
    setErrorMessage(undefined);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const urlResult = await getPresignedPutUrl(objectKey);
    if ('userError' in urlResult) {
      handleError(urlResult.userError);
      return undefined;
    }

    const uploadResult = await putImageToS3(formData, urlResult.data);
    if ('userError' in uploadResult) {
      handleError(uploadResult.userError);
      return undefined;
    }

    const analysisResult = await analyzeImage(objectKey);
    if ('userError' in analysisResult) {
      handleError(analysisResult.userError);
    } else {
      setPassportData(analysisResult.data);
      setIsLoading(false);
    }
  };

  const handleOnAnalyzeNewClick = () => {
    setPreview(undefined);
    setPassportData(undefined);
  };

  return (
    <form
      className='flex flex-col items-center gap-2 mt-4'
      onSubmit={handleSubmit}
    >
      {preview && (
        <Image
          className='h-auto w-[300px] rounded-lg'
          src={preview}
          alt='File upload preview'
          height={0}
          width={0}
        />
      )}
      <label className={`w-fit border-2 rounded-lg border-blue-500 px-2 cursor-pointer ${(isLoading || passportData) && 'hidden'}`}>
        {preview ? 'Choose another file' : 'Choose a file'}
        <input
          className='hidden'
          id='file'
          name='file'
          type='file'
          accept='image/png,image/jpeg'
          onChange={handleInputChange}
        ></input>
      </label>
      {preview && !isLoading && !passportData && (
        <button
          className='w-fit rounded-lg border-2 bg-blue-500 border-blue-500 px-2 text-white'
          type='submit'
        >
          Analyse
        </button>
      )}
      {isLoading && <Skeleton />}
      {errorMessage && (
        <p className='text-sm w-1/4 text-wrap'>{errorMessage}</p>
      )}
      {passportData && (
        <div className='flex flex-col items-center gap-2 text-md'>
          <div>
            <p>Date of Birth: {passportData?.dateOfBirth}</p>
            <p>Expiry date: {passportData?.expiryDate}</p>
          </div>
          <button
            className='w-fit border-2 rounded-lg border-blue-500 px-2 cursor-pointer'
            onClick={handleOnAnalyzeNewClick}
          >
            Analyse another image
          </button>
        </div>
      )}
    </form>
  );
};