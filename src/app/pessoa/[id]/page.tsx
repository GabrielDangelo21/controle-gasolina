"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Euro, Calendar, Edit, Trash2, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Pessoa {
  id: string;
  nome: string;
  observacoes?: string;
  saldo: number;
  createdAt: string;
  updatedAt: string;
  lancamentos: Lancamento[];
}

interface Lancamento {
  id: string;
  pessoaId: string;
  data: string;
  tipo: "DEBITO" | "CREDITO";
  valor: number;
  descricao: string;
  createdAt: string;
  updatedAt: string;
}

export default function DetalhesPessoa() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const pessoaId = params.id as string;

  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogLancamentoOpen, setDialogLancamentoOpen] = useState(false);
  const [dialogEditPessoaOpen, setDialogEditPessoaOpen] = useState(false);
  const [editandoLancamento, setEditandoLancamento] = useState<Lancamento | null>(null);
  const [filtroPeriodo, setFiltroPeriodo] = useState({
    ativo: false,
    dataInicio: "",
    dataFim: ""
  });
  
  const [novoLancamento, setNovoLancamento] = useState({
    data: new Date().toISOString().split('T')[0],
    tipo: "DEBITO" as "DEBITO" | "CREDITO",
    valor: "",
    descricao: ""
  });

  const [editPessoa, setEditPessoa] = useState({
    nome: "",
    observacoes: ""
  });

  // Carregar dados da pessoa
  const carregarPessoa = async () => {
    try {
      const response = await fetch(`/api/pessoas/${pessoaId}`);
      if (response.ok) {
        const pessoaData = await response.json();
        setPessoa(pessoaData);
        setEditPessoa({
          nome: pessoaData.nome,
          observacoes: pessoaData.observacoes || ""
        });
      } else if (response.status === 404) {
        toast({
          title: "Erro",
          description: "Pessoa não encontrada.",
          variant: "destructive"
        });
        router.push("/");
      }
    } catch (error) {
      console.error('Erro ao carregar pessoa:', error);
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
    if (pessoaId) {
      carregarPessoa();
    }
  }, [pessoaId]);

  // Adicionar ou editar lançamento
  const salvarLancamento = async () => {
    if (!novoLancamento.valor || parseFloat(novoLancamento.valor) <= 0) {
      toast({
        title: "Erro",
        description: "Valor deve ser maior que zero.",
        variant: "destructive"
      });
      return;
    }

    if (!novoLancamento.descricao.trim()) {
      toast({
        title: "Erro",
        description: "Descrição é obrigatória.",
        variant: "destructive"
      });
      return;
    }

    try {
      const url = editandoLancamento 
        ? `/api/lancamentos/${editandoLancamento.id}`
        : '/api/lancamentos';
      
      const method = editandoLancamento ? 'PUT' : 'POST';
      const payload = editandoLancamento 
        ? novoLancamento
        : { ...novoLancamento, pessoaId };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: editandoLancamento 
            ? "Lançamento atualizado com sucesso!"
            : "Lançamento adicionado com sucesso!"
        });
        setDialogLancamentoOpen(false);
        setEditandoLancamento(null);
        setNovoLancamento({
          data: new Date().toISOString().split('T')[0],
          tipo: "DEBITO",
          valor: "",
          descricao: ""
        });
        carregarPessoa();
      } else {
        throw new Error('Erro ao salvar lançamento');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o lançamento.",
        variant: "destructive"
      });
    }
  };

  // Excluir lançamento
  const excluirLancamento = async (lancamentoId: string) => {
    try {
      const response = await fetch(`/api/lancamentos/${lancamentoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Lançamento excluído com sucesso!"
        });
        carregarPessoa();
      } else {
        throw new Error('Erro ao excluir lançamento');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o lançamento.",
        variant: "destructive"
      });
    }
  };

  // Editar pessoa
  const salvarPessoa = async () => {
    if (!editPessoa.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/pessoas/${pessoaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editPessoa),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Pessoa atualizada com sucesso!"
        });
        setDialogEditPessoaOpen(false);
        carregarPessoa();
      } else {
        throw new Error('Erro ao atualizar pessoa');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a pessoa.",
        variant: "destructive"
      });
    }
  };

  // Excluir pessoa
  const excluirPessoa = async () => {
    try {
      const response = await fetch(`/api/pessoas/${pessoaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Pessoa excluída com sucesso!"
        });
        router.push("/");
      } else {
        throw new Error('Erro ao excluir pessoa');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a pessoa.",
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

  // Formatar data
  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-PT');
  };

  // Editar lançamento
  const editarLancamento = (lancamento: Lancamento) => {
    setEditandoLancamento(lancamento);
    setNovoLancamento({
      data: new Date(lancamento.data).toISOString().split('T')[0],
      tipo: lancamento.tipo,
      valor: lancamento.valor.toString(),
      descricao: lancamento.descricao
    });
    setDialogLancamentoOpen(true);
  };

  // Filtrar lançamentos por período
  const lancamentosFiltrados = pessoa?.lancamentos.filter(lancamento => {
    if (!filtroPeriodo.ativo) return true;
    
    const dataLancamento = new Date(lancamento.data);
    const dataInicio = filtroPeriodo.dataInicio ? new Date(filtroPeriodo.dataInicio) : new Date(0);
    const dataFim = filtroPeriodo.dataFim ? new Date(filtroPeriodo.dataFim + 'T23:59:59') : new Date();
    
    return dataLancamento >= dataInicio && dataLancamento <= dataFim;
  }) || [];

  // Limpar filtros
  const limparFiltros = () => {
    setFiltroPeriodo({
      ativo: false,
      dataInicio: "",
      dataFim: ""
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (!pessoa) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Pessoa não encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{pessoa.nome}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna esquerda - Informações e formulário */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card de informações */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>Informações</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDialogEditPessoaOpen(true)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir pessoa</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir "{pessoa.nome}"? Todos os lançamentos também serão excluídos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={excluirPessoa}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Saldo atual</p>
                    <div className="flex items-center gap-2">
                      <Euro className="h-5 w-5" />
                      <span className={`text-2xl font-bold ${
                        pessoa.saldo > 0 ? "text-green-600" : 
                        pessoa.saldo < 0 ? "text-red-600" : "text-gray-600"
                      }`}>
                        {formatarEuro(Math.abs(pessoa.saldo))}
                      </span>
                    </div>
                    <Badge 
                      variant={pessoa.saldo > 0 ? "default" : pessoa.saldo < 0 ? "destructive" : "secondary"}
                      className="mt-2"
                    >
                      {pessoa.saldo > 0 ? "Te deve serviços" : 
                       pessoa.saldo < 0 ? "Você deve gasolina" : "Em dia"}
                    </Badge>
                  </div>
                  
                  {pessoa.observacoes && (
                    <div>
                      <p className="text-sm text-gray-600">Observações</p>
                      <p className="text-sm">{pessoa.observacoes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card de adicionar lançamento */}
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Lançamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={novoLancamento.data}
                      onChange={(e) => setNovoLancamento({ ...novoLancamento, data: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tipo">Débito (pago gasolina)</Label>
                    <Switch
                      id="tipo"
                      checked={novoLancamento.tipo === "DEBITO"}
                      onCheckedChange={(checked) => 
                        setNovoLancamento({ ...novoLancamento, tipo: checked ? "DEBITO" : "CREDITO" })
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="valor">Valor (€)</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={novoLancamento.valor}
                      onChange={(e) => setNovoLancamento({ ...novoLancamento, valor: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      placeholder="Ex: Abasteci o carro dela"
                      value={novoLancamento.descricao}
                      onChange={(e) => setNovoLancamento({ ...novoLancamento, descricao: e.target.value })}
                      rows={3}
                    />
                  </div>
                  
                  <Button 
                    onClick={salvarLancamento}
                    className="w-full"
                  >
                    {editandoLancamento ? "Atualizar" : "Adicionar"} Lançamento
                  </Button>
                  
                  {editandoLancamento && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setEditandoLancamento(null);
                        setNovoLancamento({
                          data: new Date().toISOString().split('T')[0],
                          tipo: "DEBITO",
                          valor: "",
                          descricao: ""
                        });
                      }}
                      className="w-full"
                    >
                      Cancelar Edição
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna direita - Histórico */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Histórico de Lançamentos</CardTitle>
                  <div className="flex items-center gap-2">
                    {filtroPeriodo.ativo && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={limparFiltros}
                      >
                        Limpar Filtros
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Filter className="h-4 w-4 mr-2" />
                          Filtrar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Filtrar por Período</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="dataInicio">Data Início</Label>
                            <Input
                              id="dataInicio"
                              type="date"
                              value={filtroPeriodo.dataInicio}
                              onChange={(e) => setFiltroPeriodo({ ...filtroPeriodo, dataInicio: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="dataFim">Data Fim</Label>
                            <Input
                              id="dataFim"
                              type="date"
                              value={filtroPeriodo.dataFim}
                              onChange={(e) => setFiltroPeriodo({ ...filtroPeriodo, dataFim: e.target.value })}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setFiltroPeriodo({ ...filtroPeriodo, ativo: false })}
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={() => setFiltroPeriodo({ ...filtroPeriodo, ativo: true })}
                            >
                              Aplicar Filtro
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                {filtroPeriodo.ativo && (
                  <div className="text-sm text-gray-600">
                    Mostrando lançamentos de {filtroPeriodo.dataInicio || "início"} a {filtroPeriodo.dataFim || "hoje"}
                    ({lancamentosFiltrados.length} de {pessoa.lancamentos.length})
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {lancamentosFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      {filtroPeriodo.ativo 
                        ? "Nenhum lançamento encontrado no período selecionado" 
                        : "Nenhum lançamento encontrado"
                      }
                    </p>
                    <p className="text-sm">
                      {filtroPeriodo.ativo 
                        ? "Tente ajustar o filtro ou adicione novos lançamentos."
                        : "Adicione seu primeiro lançamento ao lado."
                      }
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-3">
                      {lancamentosFiltrados.map((lancamento) => (
                        <Card key={lancamento.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge 
                                  variant={lancamento.tipo === "DEBITO" ? "default" : "secondary"}
                                  className="flex items-center gap-1"
                                >
                                  {lancamento.tipo === "DEBITO" ? (
                                    <>
                                      <TrendingUp className="h-3 w-3" />
                                      Débito
                                    </>
                                  ) : (
                                    <>
                                      <TrendingDown className="h-3 w-3" />
                                      Crédito
                                    </>
                                  )}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {formatarData(lancamento.data)}
                                </span>
                              </div>
                              <p className="font-medium">{lancamento.descricao}</p>
                              <p className={`text-lg font-semibold mt-1 ${
                                lancamento.tipo === "DEBITO" ? "text-green-600" : "text-red-600"
                              }`}>
                                {lancamento.tipo === "DEBITO" ? "+" : "-"}{formatarEuro(lancamento.valor)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => editarLancamento(lancamento)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir lançamento</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir este lançamento?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => excluirLancamento(lancamento.id)}>
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog para editar pessoa */}
        <Dialog open={dialogEditPessoaOpen} onOpenChange={setDialogEditPessoaOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Pessoa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-nome">Nome *</Label>
                <Input
                  id="edit-nome"
                  value={editPessoa.nome}
                  onChange={(e) => setEditPessoa({ ...editPessoa, nome: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-observacoes">Observações</Label>
                <Textarea
                  id="edit-observacoes"
                  value={editPessoa.observacoes}
                  onChange={(e) => setEditPessoa({ ...editPessoa, observacoes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogEditPessoaOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={salvarPessoa}>
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}