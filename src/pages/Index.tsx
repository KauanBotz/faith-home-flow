import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Users, Calendar, BarChart3, Sparkles, Heart, ChevronRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Home,
      title: "Gestão Simples",
      description: "Gerencie sua Casa de Fé de forma fácil e intuitiva"
    },
    {
      icon: Users,
      title: "Cadastro de Membros",
      description: "Registre e acompanhe cada membro da sua comunidade"
    },
    {
      icon: Calendar,
      title: "Controle de Presença",
      description: "Marque presença em cada reunião de forma rápida"
    },
    {
      icon: BarChart3,
      title: "Relatórios",
      description: "Acompanhe o crescimento e engajamento do grupo"
    }
  ];

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">MINC - Minha Igreja Na Cidade</span>
          </div>
          
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl gradient-primary flex items-center justify-center shadow-glow">
              <Home className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Vamos abrir uma Casa de Fé!
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Bora transformar vidas! Sistema completo pra você gerenciar sua Casa de Fé com facilidade
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Button 
              size="lg"
              onClick={() => navigate("/cadastro")}
              className="text-lg h-14 px-8 gradient-primary hover:shadow-glow transition-smooth group"
            >
              Criar Minha Casa de Fé
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/login")}
              className="text-lg h-14 px-8"
            >
              Já Tenho Cadastro
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Rápido, fácil e feito pra você!
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-muted-foreground text-lg">
              Ferramentas simples pra você focar no que importa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="p-6 text-center hover:shadow-medium transition-smooth hover:-translate-y-1"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto p-10 md:p-16 text-center gradient-primary text-white shadow-glow">
          <Heart className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Pronto pra começar?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Crie sua Casa de Fé agora e comece a transformar vidas! É rápido, fácil e de graça
          </p>
          <Button 
            size="lg"
            variant="secondary"
            onClick={() => navigate("/cadastro")}
            className="text-lg h-14 px-8 hover:scale-105 transition-bounce shadow-medium"
          >
            Bora começar agora!
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 mt-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-foreground font-semibold mb-2">
            MINC - Minha Igreja Na Cidade
          </p>
          <p className="text-sm text-muted-foreground">
            Transformando vidas através das Casas de Fé
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
