import { SignedOut } from "@clerk/nextjs";

export default function layout({
    children,
}: Readonly<{
    children: React.ReactNode
}>
) {
  return (
    <SignedOut>
        {
            children
        }
    </SignedOut>
  )
}
