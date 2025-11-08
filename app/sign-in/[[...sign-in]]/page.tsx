import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="w-full min-h-screen h-screen justify-center items-center flex">
      <SignIn />
    </div>
  );
}
