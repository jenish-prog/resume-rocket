import ResumeSenderForm from "@/components/ResumeSenderForm";
import { Link } from "react-router-dom";
import { Settings, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <ResumeSenderForm />
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <p>Powered by Gmail SMTP</p>
          <div className="flex items-center gap-3">
            <Link to="/contacts" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
              <Users className="h-3.5 w-3.5" /> Contacts
            </Link>
            <Link to="/settings" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
              <Settings className="h-3.5 w-3.5" /> Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
