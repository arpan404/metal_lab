import { SignIn } from '@clerk/nextjs'
export default function page() {
  return (
    <div>
        
    <div className='min-h-dvh w-full flex justify-center items-center'>
        <SignIn path="/signin" routing="path" />
    </div>
    </div>
  )
}
