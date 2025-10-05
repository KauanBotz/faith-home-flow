import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center gradient-subtle p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="text-center relative z-10 max-w-2xl">
        {/* 404 Icon */}
        <div className="mb-8 relative inline-block">
          <div className="w-32 h-32 mx-auto rounded-3xl gradient-primary flex items-center justify-center shadow-glow animate-pulse">
            <Search className="w-16 h-16 text-white" />
          </div>
          <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-accent animate-bounce" />
          <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-primary animate-bounce delay-150" />
        </div>

        {/* Error Message */}
        <h1 className="text-8xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-3xl font-bold mb-4">Página não encontrada</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          Parece que você se perdeu! Esta página não existe ou foi movida para outro lugar.
        </p>

        {/* Path Info */}
        <div className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-xl p-4 mb-8 inline-block">
          <p className="text-sm text-muted-foreground font-mono">
            Tentou acessar: <span className="text-destructive font-semibold">{location.pathname}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="gradient-primary hover:shadow-glow transition-all h-14 text-lg hover:scale-[1.02]"
          >
            <Link to="/login">
              <Home className="w-5 h-5 mr-2" />
              Ir para Login
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-14 text-lg border-primary/20 hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => window.history.back()}
          >
            <Link to="#" onClick={(e) => { e.preventDefault(); window.history.back(); }}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
