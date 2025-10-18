import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, User, MapPin, Users, Home, Phone, Mail, CreditCard, Calendar } from "lucide-react";
import { toast } from "sonner";

const Perfil = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [casaFe, setCasaFe] = useState(null);

  useEffect(() => {
    loadCasaFe();
  }, []);

  const loadCasaFe = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const selectedCasaId = localStorage.getItem("selected_casa_id");
      let casaQuery = supabase.from("casas_fe").select("*").eq("user_id", user.id);
      
      if (selectedCasaId) {
        casaQuery = casaQuery.eq("id", selectedCasaId);
      }

      const { data, error } = await casaQuery.single();
      if (error) throw error;
      setCasaFe(data);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("casas_fe")
        .update({
          // Endereço completo
          rua_avenida: casaFe.rua_avenida,
          numero_casa: casaFe.numero_casa,
          bairro: casaFe.bairro,
          cep: casaFe.cep,
          cidade: casaFe.cidade,
          ponto_referencia: casaFe.ponto_referencia,
          endereco: `${casaFe.rua_avenida}, ${casaFe.numero_casa} - ${casaFe.bairro}, ${casaFe.cidade} - CEP: ${casaFe.cep}`,
          
          // Anfitrião
          nome_anfitriao: casaFe.nome_anfitriao,
          whatsapp_anfitriao: casaFe.whatsapp_anfitriao,
          
          // Dupla (Facilitador 2)
          nome_dupla: casaFe.nome_dupla,
          telefone_dupla: casaFe.telefone_dupla,
          email_dupla: casaFe.email_dupla,
        })
        .eq("id", casaFe.id);

      if (error) throw error;
      toast.success("Perfil atualizado com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !casaFe) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary animate-pulse" />
          <p className="text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle pb-20">
      <header className="bg-card shadow-soft sticky top-0 z-10 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Minha Casa de Fé</h1>
            <p className="text-sm text-muted-foreground">Edite suas informações</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div onSubmit={handleSave} className="space-y-6">
          {/* Dados do Facilitador 1 (Você) */}
          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Facilitador 1 (Você)</h2>
                <p className="text-sm text-muted-foreground">Seus dados pessoais</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome Completo
                </Label>
                <Input
                  value={casaFe?.nome_lider || ""}
                  disabled
                  className="mt-2 h-11 bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Não editável
                </p>
              </div>

              <div>
                <Label className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Tipo de Documento
                </Label>
                <Input
                  value={casaFe?.tipo_documento || ""}
                  disabled
                  className="mt-2 h-11 bg-muted cursor-not-allowed"
                />
              </div>

              <div>
                <Label className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Número do Documento
                </Label>
                <Input
                  value={casaFe?.numero_documento || ""}
                  disabled
                  className="mt-2 h-11 bg-muted cursor-not-allowed"
                />
              </div>

              <div>
                <Label className="text-base flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  value={casaFe?.email || ""}
                  disabled
                  className="mt-2 h-11 bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Não editável
                </p>
              </div>

              <div>
                <Label className="text-base flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone
                </Label>
                <Input
                  value={casaFe?.telefone || ""}
                  disabled
                  className="mt-2 h-11 bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Não editável
                </p>
              </div>

              <div>
                <Label className="text-base flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Campus
                </Label>
                <Input
                  value={casaFe?.campus || ""}
                  disabled
                  className="mt-2 h-11 bg-muted cursor-not-allowed"
                />
              </div>

              <div>
                <Label className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Rede
                </Label>
                <Input
                  value={casaFe?.rede || "Sem rede"}
                  disabled
                  className="mt-2 h-11 bg-muted cursor-not-allowed"
                />
              </div>

              <div>
                <Label className="text-base">MINC do Facilitador 1</Label>
                <Input
                  value={casaFe?.rede_minc_facilitador_1 || casaFe?.campus}
                  disabled
                  className="mt-2 h-11 bg-muted cursor-not-allowed"
                />
              </div>

              {casaFe?.campus === "MINC Pampulha" && (
                <div>
                  <Label className="text-base">Rede do Facilitador 1</Label>
                  <Input
                    value={casaFe?.rede_facilitador_1 || casaFe?.rede}
                    disabled
                    className="mt-2 h-11 bg-muted cursor-not-allowed"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <input
                    type="checkbox"
                    checked={casaFe?.facilitador_1_batizado || false}
                    disabled
                    className="w-4 h-4 cursor-not-allowed"
                  />
                  <Label className="cursor-not-allowed">
                    Facilitador 1 é batizado
                  </Label>
                </div>
              </div>
            </div>
          </Card>

          {/* Dados do Facilitador 2 (Dupla) */}
          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Facilitador 2 (Dupla)</h2>
                <p className="text-sm text-muted-foreground">Dados da dupla</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome Completo
                </Label>
                <Input
                  value={casaFe?.nome_dupla || ""}
                  onChange={(e) => setCasaFe({ ...casaFe, nome_dupla: e.target.value })}
                  placeholder="Nome do Facilitador 2"
                  className="mt-2 h-11"
                />
              </div>

              <div>
                <Label className="text-base flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone
                </Label>
                <Input
                  value={casaFe?.telefone_dupla || ""}
                  onChange={(e) => setCasaFe({ ...casaFe, telefone_dupla: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="mt-2 h-11"
                />
              </div>

              <div>
                <Label className="text-base flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  value={casaFe?.email_dupla || ""}
                  onChange={(e) => setCasaFe({ ...casaFe, email_dupla: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="mt-2 h-11"
                />
              </div>

              <div>
                <Label className="text-base">MINC do Facilitador 2</Label>
                <Input
                  value={casaFe?.rede_minc_facilitador_2 || ""}
                  disabled
                  className="mt-2 h-11 bg-muted cursor-not-allowed"
                />
              </div>

              {casaFe?.rede_minc_facilitador_2 === "MINC Pampulha" && (
                <div>
                  <Label className="text-base">Rede do Facilitador 2</Label>
                  <Input
                    value={casaFe?.rede_facilitador_2 || ""}
                    disabled
                    className="mt-2 h-11 bg-muted cursor-not-allowed"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <input
                    type="checkbox"
                    checked={casaFe?.facilitador_2_batizado || false}
                    disabled
                    className="w-4 h-4 cursor-not-allowed"
                  />
                  <Label className="cursor-not-allowed">
                    Facilitador 2 é batizado
                  </Label>
                </div>
              </div>
            </div>
          </Card>

          {/* Dados do Anfitrião */}
          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                <Home className="w-8 h-8 text-success" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Anfitrião da Casa de Fé</h2>
                <p className="text-sm text-muted-foreground">Pessoa que hospeda as reuniões</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome Completo
                </Label>
                <Input
                  value={casaFe?.nome_anfitriao || ""}
                  onChange={(e) => setCasaFe({ ...casaFe, nome_anfitriao: e.target.value })}
                  placeholder="Nome do anfitrião"
                  className="mt-2 h-11"
                />
              </div>

              <div>
                <Label className="text-base flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </Label>
                <Input
                  value={casaFe?.whatsapp_anfitriao || ""}
                  onChange={(e) => setCasaFe({ ...casaFe, whatsapp_anfitriao: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="mt-2 h-11"
                />
              </div>
            </div>
          </Card>

          {/* Endereço da Casa de Fé */}
          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Endereço da Casa de Fé</h2>
                <p className="text-sm text-muted-foreground">Local onde acontecem as reuniões</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label className="text-base">Rua/Avenida</Label>
                <Input
                  value={casaFe?.rua_avenida || ""}
                  onChange={(e) => setCasaFe({ ...casaFe, rua_avenida: e.target.value })}
                  placeholder="Nome da rua ou avenida"
                  className="mt-2 h-11"
                />
              </div>

              <div>
                <Label className="text-base">Número</Label>
                <Input
                  value={casaFe?.numero_casa || ""}
                  onChange={(e) => setCasaFe({ ...casaFe, numero_casa: e.target.value })}
                  placeholder="Número"
                  className="mt-2 h-11"
                />
              </div>

              <div>
                <Label className="text-base">Bairro</Label>
                <Input
                  value={casaFe?.bairro || ""}
                  onChange={(e) => setCasaFe({ ...casaFe, bairro: e.target.value })}
                  placeholder="Bairro"
                  className="mt-2 h-11"
                />
              </div>

              <div>
                <Label className="text-base">CEP</Label>
                <Input
                  value={casaFe?.cep || ""}
                  onChange={(e) => setCasaFe({ ...casaFe, cep: e.target.value })}
                  placeholder="00000-000"
                  className="mt-2 h-11"
                />
              </div>

              <div>
                <Label className="text-base">Cidade</Label>
                <Input
                  value={casaFe?.cidade || ""}
                  onChange={(e) => setCasaFe({ ...casaFe, cidade: e.target.value })}
                  placeholder="Nome da cidade"
                  className="mt-2 h-11"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-base">Ponto de Referência</Label>
                <Input
                  value={casaFe?.ponto_referencia || ""}
                  onChange={(e) => setCasaFe({ ...casaFe, ponto_referencia: e.target.value })}
                  placeholder="Ex: Próximo ao mercado X"
                  className="mt-2 h-11"
                />
              </div>
            </div>
          </Card>

          {/* Informações da Reunião */}
          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Informações da Reunião</h2>
                <p className="text-sm text-muted-foreground">Horários e dias de encontro</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-base">Horário das Reuniões</Label>
                <Input
                  value={casaFe?.horario_reuniao || ""}
                  disabled
                  className="mt-2 h-11 bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Não editável
                </p>
              </div>

              <div>
                <Label className="text-base">Dias das Reuniões</Label>
                <Input
                  value={casaFe?.dias_semana?.join(", ") || ""}
                  disabled
                  className="mt-2 h-11 bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Não editável
                </p>
              </div>
            </div>
          </Card>

          {/* Botão de Salvar */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-1 gradient-primary hover:shadow-glow"
              disabled={saving}
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Perfil;