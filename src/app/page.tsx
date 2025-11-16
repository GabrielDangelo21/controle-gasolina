"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Plus, Euro, TrendingUp, TrendingDown, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Pessoa {
  id: string;
  nome: string;
  observacoes?: string;
  saldo: number;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novaPessoa, setNovaPessoa] = useState({
    nome: "",
    observacoes: ""
  });
  const { toast } = useToast();
  const router = useRouter();

  // Carregar dados do dashboard
  const carregarDados = async () => {
    try {
      // Carregar pessoas
      const pessoasResponse = await fetch('/api/pessoas');
      if (pessoasResponse.ok) {
        const pessoasData = await pessoasResponse.json();
        setPessoas(pessoasData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Adicionar nova pessoa
  const adicionarPessoa = async () => {
    if (!novaPessoa.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/pessoas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novaPessoa),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Pessoa adicionada com sucesso!"
        });
        setNovaPessoa({ nome: "", observacoes: "" });
        setDialogOpen(false);
        carregarDados();
      } else {
        throw new Error('Erro ao adicionar pessoa');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a pessoa.",
        variant: "destructive"
      });
    }
  };

  // Formatar valor em euros
  const formatarEuro = (valor: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor);
  };

  // Determinar cor do saldo
  const getCorSaldo = (saldo: number) => {
    if (saldo > 0) return "text-green-600"; // Ela me deve
    if (saldo < 0) return "text-red-600";   // Eu devo
    return "text-gray-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Controle de Gasolina</h1>
          <p className="text-gray-600">Gerencie trocas de gasolina por serviços e produtos</p>
        </div>

        {/* Lista de Pessoas */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Pessoas e Serviços</h2>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Pessoa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Pessoa/Serviço</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={novaPessoa.nome}
                    onChange={(e) => setNovaPessoa({ ...novaPessoa, nome: e.target.value })}
                    placeholder="Ex: Manicure, Massoterapeuta"
                  />
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={novaPessoa.observacoes}
                    onChange={(e) => setNovaPessoa({ ...novaPessoa, observacoes: e.target.value })}
                    placeholder="Informações adicionais (opcional)"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={adicionarPessoa}>
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grid de Pessoas */}
        {pessoas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Euro className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma pessoa cadastrada</h3>
              <p className="text-gray-600 text-center mb-4">
                Comece adicionando uma pessoa ou serviço para controlar suas trocas de gasolina.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Pessoa
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pessoas.map((pessoa) => (
              <Card key={pessoa.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{pessoa.nome}</CardTitle>
                    <Badge variant={pessoa.saldo > 0 ? "default" : pessoa.saldo < 0 ? "destructive" : "secondary"}>
                      {pessoa.saldo > 0 ? "Te deve" : pessoa.saldo < 0 ? "Você deve" : "Saldo zero"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Saldo atual:</span>
                      <div className="flex items-center gap-1">
                        <Euro className="h-4 w-4" />
                        <span className={`font-semibold ${getCorSaldo(pessoa.saldo)}`}>
                          {formatarEuro(Math.abs(pessoa.saldo))}
                        </span>
                      </div>
                    </div>
                    
                    {pessoa.observacoes && (
                      <div className="text-sm text-gray-600">
                        <p className="truncate">{pessoa.observacoes}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-xs text-gray-500">
                        {pessoa.saldo > 0 ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            Serviços a receber
                          </span>
                        ) : pessoa.saldo < 0 ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <TrendingDown className="h-3 w-3" />
                            Gasolina a fornecer
                          </span>
                        ) : (
                          <span className="text-gray-500">Em dia</span>
                        )}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/pessoa/${pessoa.id}`)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}