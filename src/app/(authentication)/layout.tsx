type Props = {
  children: React.ReactNode;
};

const AuthenticationLayout = ({ children }: Props) => {
  return (
    <>
      <main className="h-screen bg-gradient-to-br from-green-400 via-emerald-600 to-emerald-900">
        <div className="mx-auto h-full">{children}</div>
      </main>
    </>
  );
};

export default AuthenticationLayout;
