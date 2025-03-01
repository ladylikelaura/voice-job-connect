
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">
          Oops! The page you're looking for doesn't exist
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Path: <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code>
        </p>
        <Button 
          className="flex items-center gap-2" 
          size="lg"
          onClick={() => window.location.href = '/'}
        >
          <Home size={18} />
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
