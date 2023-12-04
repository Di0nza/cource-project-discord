import { UserButton } from "@clerk/nextjs";
export default function Home() {
  return (
    <div >
      Protected route
        <UserButton afterSignOutUrl="/"/>
    </div>
  )
}
