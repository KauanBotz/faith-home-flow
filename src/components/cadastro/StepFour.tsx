import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Users, Calendar, CheckCircle } from "lucide-react";
import { StepOne } from "@/components/cadastro/StepOne";
import { StepTwo } from "@/components/cadastro/StepTwo";
import { StepThree } from "@/components/cadastro/StepThree";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CadastroData {
  nome: string;
  tipoDocumento: string;
  numeroDocumento: string;
  email: string;
  telefone: string;
  senha: string;
  redeMincFacilitador1?: string;
  redeFacilitador1?: string;
  facilitador1Batizado?: boolean;
  
  endereco: string;
  campus: string;
  rede: string;
  diasSemana: string[];
  horarioReuniao: string;
  nomeDupla?: string;
  telefoneDupla?: string;
  emailDupla?: string;
  redeMincFacilitador2?: string;
  redeFacilitador2?: string;
  facilitador2Batizado?: boolean;
  
  nomeAnfitriao?: string;
  whatsappAnfitriao?: string;
  
  ruaAvenida?: string;
  numeroCasa?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  pontoReferencia?: string;
  
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userCasas, setUserCasas] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const steps = [
    { number: 1, title: "Seus Dados", icon: Users },
    { number: 2, title: "Casa de Fé", icon: Home },
    { number: 3, title: "Membros", icon: Users },
    { number: 4, title: "Confirmação", icon: CheckCircle },
  ];

  const progress = (currentStep / 4) * 100;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        setUserId(user.id);
        
        const { data: casas } = await supabase
          .from("casas_fe")
          .select("*")
          .eq("user_id", user.id);
        
        if (casas && casas.length > 0) {
          setUserCasas(casas);
          setFormData({
            nome: casas[0].nome_lider,
            email: casas[0].email,
            telefone: casas[0].telefone,
            membros: [],
          });
          setCurrentStep(2);
        }
      }
    };
    checkAuth();
  }, []);

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

  const handleAddAnother = () => {
    setFormData({ 
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      senha: formData.senha,
      membros: [] 
    });
    setCurrentStep(2);
  };

  const handleSubmit = async () => {
    const dataLimite = new Date("2025-10-26");
    const hoje = new Date();
    
    if (hoje >= dataLimite) {
      toast.error("O período de cadastro de novas Casas de Fé foi encerrado em 26/10/2025.");
      return;
    }

    try {
      let finalUserId = userId;

      if (!finalUserId) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email!,
          password: formData.senha!,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (authError) {
          if (authError.message.includes("already registered")) {
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
              email: formData.email!,
              password: formData.senha!,
            });

            if (loginError) {
              toast.error("Email já cadastrado. Verifique sua senha ou faça login.");
              throw loginError;
            }

            finalUserId = loginData.user.id;
          } else {
            toast.error("Erro ao criar conta: " + authError.message);
            throw authError;
          }
        } else {
          finalUserId = authData.user!.id;
        }
      }

      await createCasaFe(finalUserId!);

      toast.success("Casa de Fé criada com sucesso!");
      
      const { data: casasAtualizadas } = await supabase
        .from("casas_fe")
        .select("*")
        .eq("user_id", finalUserId);
      
      if (casasAtualizadas) {
        setUserCasas(casasAtualizadas);
        
        if (casasAtualizadas.length > 1) {
          navigate("/login");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Error creating casa de fé:", error);
      if (!error.message?.includes("already registered")) {
        toast.error("Erro ao criar Casa de Fé: " + error.message);
      }
    }
  };

  const createCasaFe = async (userId: string) => {
    const { data: casaData, error: casaError } = await supabase
      .from("casas_fe")
      .insert({
        user_id: userId,
        nome_lider: formData.nome!,
        tipo_documento: formData.tipoDocumento!,
        numero_documento: formData.numeroDocumento!,
        email: formData.email!,
        telefone: formData.telefone!,
        endereco: formData.endereco!,
        campus: formData.campus!,
        rede: formData.rede!,
        dias_semana: formData.diasSemana || [],
        horario_reuniao: formData.horarioReuniao!,
        nome_dupla: formData.nomeDupla || null,
        telefone_dupla: formData.telefoneDupla || null,
        email_dupla: formData.emailDupla || null,
        rede_minc_facilitador_1: formData.redeMincFacilitador1 || null,
        rede_facilitador_1: formData.redeFacilitador1 || null,
        facilitador_1_batizado: formData.facilitador1Batizado || false,
        rede_minc_facilitador_2: formData.redeMincFacilitador2 || null,
        rede_facilitador_2: formData.redeFacilitador2 || null,
        facilitador_2_batizado: formData.facilitador2Batizado || false,
        nome_anfitriao: formData.nomeAnfitriao || null,
        whatsapp_anfitriao: formData.whatsappAnfitriao || null,
        rua_avenida: formData.ruaAvenida || null,
        numero_casa: formData.numeroCasa || null,
        bairro: formData.bairro || null,
        cep: formData.cep || null,
        cidade: formData.cidade || null,
        ponto_referencia: formData.pontoReferencia || null,
      })
      .select()
      .single();

    if (casaError) throw casaError;

    if (formData.membros && formData.membros.length > 0) {
      const membrosData = formData.membros.map((membro) => ({
        casa_fe_id: casaData.id,
        nome_completo: membro.nome,
        telefone: membro.telefone,
        idade: membro.idade,
        endereco: membro.endereco,
        aceitou_jesus: membro.convertido,
        notas: membro.notas || null,
      }));

      const { error: membrosError } = await supabase
        .from("membros")
        .insert(membrosData);

      if (membrosError) throw membrosError;
    }
  };

  return (
    <div className="min-h-screen gradient-subtle flex flex-col">
      <header className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="mb-4"
          >
            ← Voltar para Login
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <img src="favicon.png" alt="" className="w-8 h-8" />
            VAMOS DAR START NA SUA CASA DE FÉ! 
          </h1>
          <p className="text-muted-foreground mt-1">
            Vamos começar essa jornada juntos
          </p>
        </div>
      </header>

      <div className="px-4 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full gradient-primary transition-smooth"
              style={{ width: `${progress}%` }}
            />
          </div>
          
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

      <div className="flex-1 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 md:p-8 shadow-medium">
            {currentStep === 1 && !isLoggedIn && (
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
                todasCasas={userCasas}
                onSubmit={handleSubmit}
                onBack={prevStep}
                onAddAnother={handleAddAnother}
              />
            )}
          </Card>
        </div>
      </div>

      <footer className="p-5 text-center text-sm text-muted-foreground">
        <p>MINC - Minha Igreja Na Cidade © 2025</p>
      </footer>
    </div>
  );
};

export default Cadastro;