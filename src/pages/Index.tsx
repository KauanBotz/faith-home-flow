import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Users, Calendar, BarChart3, Shield } from "lucide-react";

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
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">MINC - Minha Igreja Na Cidade</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Casas de Fé 🏠✨
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema de gerenciamento completo para suas Casas de Fé. 
            Simples, intuitivo e feito para você!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate("/cadastro")}
              className="text-lg"
            >
              Criar Minha Casa de Fé 🙌
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/login")}
              className="text-lg"
            >
              Já Tenho Cadastro
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tudo que você precisa em um só lugar
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="p-6 text-center hover:shadow-medium transition-smooth"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto p-8 md:p-12 text-center gradient-primary text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Crie sua Casa de Fé agora mesmo e comece a transformar vidas!
          </p>
          <Button 
            size="lg"
            variant="secondary"
            onClick={() => navigate("/cadastro")}
            className="text-lg shadow-medium hover:scale-105 transition-bounce"
          >
            Cadastrar Agora →
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>MINC - Minha Igreja Na Cidade © 2024</p>
          <p className="mt-2">Transformando vidas através das Casas de Fé</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
