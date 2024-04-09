import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import LoginPage from "./login/page";
import RegisterPage from "./register/page";

export default function Home() {
  return (
    <main className="">
      <div className="grid grid-cols-2">
        <div className="bg-[#2b4032] flex justify-center items-center">
          <Image
            src={"/logo.png"}
            alt="logo"
            width={500}
            height={500}
            priority
          />
        </div>

        <div className="flex flex-col justify-center items-center bg-gradient-to-r from-[#2b4032] to-[#2b4032]/80">
          <Tabs defaultValue="login" className="w-[800px]">
            <TabsList className="flex justify-center space-x-10">
              <TabsTrigger
                value="login"
                className="px-4 py-2 rounded-l-md text-gray-700 font-medium"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="px-4 py-2 rounded-r-md text-gray-700 font-medium"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginPage />
            </TabsContent>
            <TabsContent value="register">
              <RegisterPage />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
