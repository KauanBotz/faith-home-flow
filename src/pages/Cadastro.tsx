import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Users, Calendar, CheckCircle, Edit, Trash2, Plus, User } from "lucide-react";
import { StepOne } from "@/components/cadastro/StepOne";
import { StepTwo } from "@/components/cadastro/StepTwo";
import { StepThree } from "@/components/cadastro/StepThree";
import { StepFour } from "@/components/cadastro/StepFour";
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
  const [formData, setFormData] = useState<Partial<CadastroData>>({ membros: [] });
  const [userId, setUserId] = useState<string | null>(null);
  const [casasCadastradas, setCasasCadastradas] = useState<any[]>([]);
  const [editandoCasaId, setEditandoCasaId] = useState<string | null>(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [dadosPessoaisSalvos, setDadosPessoaisSalvos] = useState<any>(null);

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
        setUserId(user.id);
        await carregarCasasCadastradas(user.id);
        
        // Carregar dados pessoais do localStorage se existir
        const dadosSalvos = localStorage.getItem('dados_pessoais_casa_fe');
        if (dadosSalvos) {
          const dados = JSON.parse(dadosSalvos);
          setDadosPessoaisSalvos(dados);
          setFormData(prev => ({
            ...prev,
            ...dados,
            membros: []
          }));
        }
      }
    };
    checkAuth();
  }, []);

  const carregarCasasCadastradas = async (uid: string) => {
    const { data: casas } = await supabase
      .from("casas_fe")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    
    if (casas) {
      setCasasCadastradas(casas);
    }
  };

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

  const adicionarNovaCasa = () => {
    setEditandoCasaId(null);
    setMostrarConfirmacao(false);
    setFormData({
      ...dadosPessoaisSalvos,
      membros: [],
      endereco: "",
      campus: "",
      rede: "",
      diasSemana: [],
      horarioReuniao: "",
      nomeDupla: "",
      telefoneDupla: "",
      redeMincFacilitador1: "",
      redeFacilitador1: "",
      facilitador1Batizado: false,
      redeMincFacilitador2: "",
      redeFacilitador2: "",
      facilitador2Batizado: false,
      nomeAnfitriao: "",
      whatsappAnfitriao: "",
      ruaAvenida: "",
      numeroCasa: "",
      bairro: "",
      cep: "",
      cidade: "",
      pontoReferencia: "",
    });
    setCurrentStep(2); // Pula direto pro Step 2 (já tem dados pessoais)
  };

  const editarCasa = async (casaId: string) => {
    const casa = casasCadastradas.find(c => c.id === casaId);
    if (!casa) return;

    const { data: membros } = await supabase
      .from("membros")
      .select("*")
      .eq("casa_fe_id", casaId);

    const membrosFormatados = (membros || []).map(m => ({
      nome: m.nome_completo,
      telefone: m.telefone,
      idade: m.idade,
      endereco: m.endereco,
      convertido: m.aceitou_jesus,
      notas: m.notas || ""
    }));

    setEditandoCasaId(casaId);
    setMostrarConfirmacao(false);
    setFormData({
      ...dadosPessoaisSalvos,
      endereco: casa.endereco,
      campus: casa.campus,
      rede: casa.rede,
      diasSemana: casa.dias_semana || [],
      horarioReuniao: casa.horario_reuniao,
      nomeDupla: casa.nome_dupla || "",
      telefoneDupla: casa.telefone_dupla || "",
      redeMincFacilitador1: casa.rede_minc_facilitador_1 || "",
      redeFacilitador1: casa.rede_facilitador_1 || "",
      facilitador1Batizado: casa.facilitador_1_batizado || false,
      redeMincFacilitador2: casa.rede_minc_facilitador_2 || "",
      redeFacilitador2: casa.rede_facilitador_2 || "",
      facilitador2Batizado: casa.facilitador_2_batizado || false,
      nomeAnfitriao: casa.nome_anfitriao || "",
      whatsappAnfitriao: casa.whatsapp_anfitriao || "",
      ruaAvenida: casa.rua_avenida || "",
      numeroCasa: casa.numero_casa || "",
      bairro: casa.bairro || "",
      cep: casa.cep || "",
      cidade: casa.cidade || "",
      pontoReferencia: casa.ponto_referencia || "",
      membros: membrosFormatados
    });
    setCurrentStep(2);
  };

  const deletarCasa = async (casaId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta Casa de Fé?")) return;

    const { error } = await supabase
      .from("casas_fe")
      .delete()
      .eq("id", casaId);

    if (error) {
      toast.error("Erro ao deletar Casa de Fé");
      return;
    }

    toast.success("Casa de Fé deletada com sucesso!");
    if (userId) {
      await carregarCasasCadastradas(userId);
    }
  };

  const handleSubmit = async () => {
    const dataLimite = new Date("2025-10-25");
    const hoje = new Date();
    
    if (hoje >= dataLimite) {
      toast.error("O período de cadastro de novas Casas de Fé foi encerrado em 25/10/2025.");
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

        setUserId(finalUserId);
      }

      // Salvar dados pessoais no localStorage
      const dadosPessoais = {
        nome: formData.nome,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        email: formData.email,
        telefone: formData.telefone,
        senha: formData.senha
      };
      localStorage.setItem('dados_pessoais_casa_fe', JSON.stringify(dadosPessoais));
      setDadosPessoaisSalvos(dadosPessoais);

      if (editandoCasaId) {
        await atualizarCasaFe(editandoCasaId, finalUserId!);
      } else {
        await criarCasaFe(finalUserId!);
      }

      await carregarCasasCadastradas(finalUserId!);
      setMostrarConfirmacao(true);
      setCurrentStep(4);
    } catch (error: any) {
      console.error("Error:", error);
      if (!error.message?.includes("already registered")) {
        toast.error("Erro ao salvar Casa de Fé: " + error.message);
      }
    }
  };

  const criarCasaFe = async (userId: string) => {
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

    toast.success("Casa de Fé criada com sucesso!");
  };

  const atualizarCasaFe = async (casaId: string, userId: string) => {
    const { error: casaError } = await supabase
      .from("casas_fe")
      .update({
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
      .eq("id", casaId);

    if (casaError) throw casaError;

    await supabase.from("membros").delete().eq("casa_fe_id", casaId);

    if (formData.membros && formData.membros.length > 0) {
      const membrosData = formData.membros.map((membro) => ({
        casa_fe_id: casaId,
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

    toast.success("Casa de Fé atualizada com sucesso!");
  };

  return (
    <div className="min-h-screen gradient-subtle flex flex-col">
      <header className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/login")} className="mb-4">
            ← Voltar para Login
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <img src="favicon.png" alt="" className="w-8 h-8" />
            VAMOS DAR START NA SUA CASA DE FÉ!
          </h1>
          <p className="text-muted-foreground mt-1">Vamos começar essa jornada juntos</p>
        </div>
      </header>

      <div className="px-4 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full gradient-primary transition-smooth" style={{ width: `${progress}%` }} />
          </div>
          
          <div className="flex justify-between mt-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex flex-col items-center gap-2 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-smooth
                      ${isActive ? 'bg-primary text-primary-foreground shadow-glow' : ''}
                      ${isCompleted ? 'bg-success text-success-foreground' : ''}
                      ${!isActive && !isCompleted ? 'bg-muted text-muted-foreground' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-medium hidden md:block ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
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
            
            {currentStep === 4 && mostrarConfirmacao && (
              <div className="space-y-6">
                {/* Card de Dados Pessoais */}
                {dadosPessoaisSalvos && (
                  <Card className="p-6 bg-primary/5 border-primary/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">Seus Dados Pessoais</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Nome Completo</p>
                        <p className="font-semibold">{dadosPessoaisSalvos.nome}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Documento</p>
                        <p className="font-semibold">{dadosPessoaisSalvos.tipoDocumento}: {dadosPessoaisSalvos.numeroDocumento}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-semibold">{dadosPessoaisSalvos.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Telefone</p>
                        <p className="font-semibold">{dadosPessoaisSalvos.telefone}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Casas de Fé Cadastradas */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Casas de Fé Cadastradas ({casasCadastradas.length})</h2>
                  
                  <div className="space-y-4 mb-6">
                    {casasCadastradas.map((casa) => (
                      <Card key={casa.id} className="p-4 hover:shadow-medium transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{casa.nome_lider}</h3>
                            <p className="text-sm text-muted-foreground">{casa.campus} - {casa.rede}</p>
                            <p className="text-sm text-muted-foreground">{casa.endereco}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => editarCasa(casa.id)}>
                              <Edit className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deletarCasa(casa.id)}>
                              <Trash2 className="w-4 h-4 mr-1" />
                              Deletar
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" variant="hero" className="flex-1" onClick={adicionarNovaCasa}>
                    <Plus className="w-5 h-5 mr-2" />
                    Adicionar Nova Casa de Fé
                  </Button>
                  
                  <Button size="lg" onClick={() => navigate("/login")} className="flex-1">
                    Ir para o Login
                  </Button>
                </div>
              </div>
            )}
            
            {currentStep === 4 && !mostrarConfirmacao && (
              <StepFour 
                data={formData as CadastroData}
                todasCasas={casasCadastradas}
                onSubmit={handleSubmit}
                onBack={prevStep}
                onAddAnother={adicionarNovaCasa}
                onEditCasa={editarCasa}
                onDeleteCasa={deletarCasa}
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