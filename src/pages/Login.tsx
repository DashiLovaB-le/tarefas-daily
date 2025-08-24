
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Ícone do Google como um componente SVG para manter o estilo e a leveza
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.62-4.55 1.62-3.87 0-7-3.13-7-7s3.13-7 7-7c2.04 0 3.5.83 4.61 1.89l2.62-2.62C17.43 2.43 15.21 1.5 12.48 1.5c-5.48 0-9.98 4.5-9.98 9.98s4.5 9.98 9.98 9.98c5.28 0 9.5-3.53 9.5-9.68 0-.73-.07-1.42-.2-2.08h-9.3z" fill="currentColor" />
  </svg>
);

const LoginPage = () => {
  const { signInWithGoogle, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleGoogleLogin = async () => {
    console.log("Iniciando login com o Google...");
    await signInWithGoogle();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md animate-fade-in-up shadow-2xl shadow-black/5">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto">
            <img 
              src="/logo.png" 
              alt="Logo DashiTask" 
              className="w-24 h-24 mx-auto rounded-2xl"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground">DashiTask</h1>
          <CardTitle className="text-2xl font-semibold tracking-tight pt-2">
            Acesse sua conta
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Utilize sua conta do Google para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="py-4">
            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium border-2 hover:border-primary transition-all duration-300"
              onClick={handleGoogleLogin}
            >
              <GoogleIcon className="w-5 h-5 mr-3" />
              Entrar com o Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
