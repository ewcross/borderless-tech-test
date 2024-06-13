import { randomUUID } from 'crypto';
import Image from "next/image";
import Logo from '../../public/borderless.svg';
import { ImageAnalyser } from "./components/imageAnalyser";

export default function Home() {
  const id = randomUUID();

  return (
    <div className='flex flex-col items-center gap-2 py-4 text-center'>
      <Image
        className='mb-4'
        src={Logo}
        alt='Borderless logo'
        height={0}
        width={200}
      />
      <p className='text-lg font-semibold'>
        Let&apos;s get some information from your passport
      </p>
      <p className='text-md'>
        Select an image of the photo page
      </p>
      <div className='text-sm text-wrap w-1/4'>
        <p>
          Please make sure your image is clear, in focus, and without glare and reflections
        </p>
      </div>
      <ImageAnalyser id={id} />
    </div>
  );
}
