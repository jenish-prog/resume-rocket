import ResumeSenderForm from "@/components/ResumeSenderForm";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <ResumeSenderForm />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Powered by Gmail SMTP • Records saved to database
        </p>
      </div>
    </div>
  );
};

export default Index;
