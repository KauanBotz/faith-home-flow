import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Users, Calendar, CheckCircle } from "lucide-react";
import { StepOne } from "@/components/cadastro/StepOne";
import { StepTwo } from "@/components/cadastro/StepTwo";
import { StepThree } from "@/components/cadastro/StepThree";
import { StepFour } from "@/components/cadastro/StepFour";

export interface CadastroData {
  // Step 1 - Facilitator data
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  
  // Step 2 - Casa de Fé data
  endereco: string;
  campus: string;
  rede: string;
  datasReunioes: Date[];
  horarioReuniao: string;
  
  // Step 3 - Members
  membros: Array<{
    nome: string;
    telefone: string;
    idade: number;
    endereco: string;
    convertido: boolean;
    notas?: string;
  }>;
}

const Cadastro = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CadastroData>>({
    membros: [],
  });

  const steps = [
    { number: 1, title: "Seus Dados", icon: Users },
    { number: 2, title: "Casa de Fé", icon: Home },
    { number: 3, title: "Membros", icon: Users },
    { number: 4, title: "Confirmação", icon: CheckCircle },
  ];

  const progress = (currentStep / 4) * 100;

  const updateFormData = (data: Partial<CadastroData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // TODO: Implementar salvamento no Supabase
    console.log("Form data:", formData);
    // Auto-login e redirect para dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen gradient-subtle flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Bora abrir uma Casa de Fé! 🏠✨
          </h1>
          <p className="text-muted-foreground mt-1">
            Vamos começar essa jornada juntos
          </p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full gradient-primary transition-smooth"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Steps Indicator */}
          <div className="flex justify-between mt-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div 
                  key={step.number}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div 
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-smooth
                      ${isActive ? 'bg-primary text-primary-foreground shadow-glow' : ''}
                      ${isCompleted ? 'bg-success text-success-foreground' : ''}
                      ${!isActive && !isCompleted ? 'bg-muted text-muted-foreground' : ''}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`
                    text-xs font-medium hidden md:block
                    ${isActive ? 'text-primary' : 'text-muted-foreground'}
                  `}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 md:p-8 shadow-medium">
            {currentStep === 1 && (
              <StepOne 
                data={formData}
                onNext={(data) => {
                  updateFormData(data);
                  nextStep();
                }}
              />
            )}
            
            {currentStep === 2 && (
              <StepTwo 
                data={formData}
                onNext={(data) => {
                  updateFormData(data);
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            
            {currentStep === 3 && (
              <StepThree 
                data={formData}
                onNext={(data) => {
                  updateFormData(data);
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            
            {currentStep === 4 && (
              <StepFour 
                data={formData as CadastroData}
                onSubmit={handleSubmit}
                onBack={prevStep}
              />
            )}
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>MINC - Minha Igreja Na Cidade © 2024</p>
      </footer>
    </div>
  );
};

export default Cadastro;
