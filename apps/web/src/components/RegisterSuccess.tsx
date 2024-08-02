export default function RegisterSuccess() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-6 text-indigo-600">
          Registration Successful
        </h1>
        <p className="text-lg mb-4">
          Thank you for registering! Please check your email to verify your
          account.
        </p>
        <p className="text-md text-muted-foreground">
          If you dont see the email in your inbox, please check your spam
          folder.
        </p>
      </div>
    </div>
  );
}
