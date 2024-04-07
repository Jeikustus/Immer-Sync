import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import LoginPage from "./login/page";
import RegistrationScreen from "./registration/page";

export default function Home() {
  return (
    <main>
      <div className="grid grid-cols-2 min-h-[900px]">
        <div className="flex justify-center items-center flex-col">
          <Image src="/logo.png" alt="logo" width={400} height={400} priority />
          <p className="text-5xl font-extrabold">IMMER SYNC</p>
        </div>
        <div className="px-[20%] pt-[22%]">
          <Tabs defaultValue="login" className="">
            <TabsList>
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginPage />
            </TabsContent>
            <TabsContent value="register">
              <RegistrationScreen />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
