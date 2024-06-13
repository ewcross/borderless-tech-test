export const Skeleton = () => {
  return (
    <div className='flex flex-col items-center gap-2 p-2'>
      <div className='h-2 w-[100px] animate-pulse rounded-md bg-blue-500'></div>
      <div className='h-2 w-[75px] animate-pulse rounded-md bg-blue-500'></div>
      <div className='h-2 w-[100px] animate-pulse rounded-md bg-blue-500'></div>
    </div>
  );
};