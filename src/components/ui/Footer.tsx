import { app } from "@/lib/config/app.config";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl p-4">
        <div className="text-faded-foreground text-xs">
          © {new Date().getFullYear()} {app.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export { Footer };
