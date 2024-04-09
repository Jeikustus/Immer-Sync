import { NavigationBar } from "./navigation";

type Props = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
  return (
    <>
      <NavigationBar />
      <main className="h-screen bg-gradient-to-br from-[#2b4032] via-[#2b4032] to-[#2b4032]/90">
        <div className="mx-auto h-full">{children}</div>
      </main>
    </>
  );
};

export default MainLayout;
