import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lancamento = await db.lancamento.findUnique({
      where: { id },
      include: {
        pessoa: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    if (!lancamento) {
      return NextResponse.json(
        { error: 'Lançamento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(lancamento);
  } catch (error) {
    console.error('Erro ao buscar lançamento:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar lançamento' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, tipo, valor, descricao } = await request.json();

    if (!data || !tipo || valor === undefined || !descricao) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['DEBITO', 'CREDITO'].includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo deve ser DEBITO ou CREDITO' },
        { status: 400 }
      );
    }

    if (valor <= 0) {
      return NextResponse.json(
        { error: 'Valor deve ser maior que zero' },
        { status: 400 }
      );
    }

    // Buscar o lançamento original
    const lancamentoOriginal = await db.lancamento.findUnique({
      where: { id },
      include: { pessoa: true }
    });

    if (!lancamentoOriginal) {
      return NextResponse.json(
        { error: 'Lançamento não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar o lançamento
    const lancamento = await db.lancamento.update({
      where: { id },
      data: {
        data: new Date(data),
        tipo,
        valor: parseFloat(valor),
        descricao: descricao.trim()
      },
      include: {
        pessoa: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    // Recalcular o saldo da pessoa
    const todosLancamentos = await db.lancamento.findMany({
      where: { pessoaId: lancamentoOriginal.pessoaId }
    });

    const novoSaldo = todosLancamentos.reduce((saldo, lanc) => {
      return lanc.tipo === 'DEBITO' 
        ? saldo + lanc.valor
        : saldo - lanc.valor;
    }, 0);

    await db.pessoa.update({
      where: { id: lancamentoOriginal.pessoaId },
      data: { saldo: novoSaldo }
    });

    return NextResponse.json(lancamento);
  } catch (error) {
    console.error('Erro ao atualizar lançamento:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar lançamento' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Buscar o lançamento antes de excluir
    const lancamento = await db.lancamento.findUnique({
      where: { id },
      include: { pessoa: true }
    });

    if (!lancamento) {
      return NextResponse.json(
        { error: 'Lançamento não encontrado' },
        { status: 404 }
      );
    }

    // Excluir o lançamento
    await db.lancamento.delete({
      where: { id }
    });

    // Recalcular o saldo da pessoa
    const todosLancamentos = await db.lancamento.findMany({
      where: { pessoaId: lancamento.pessoaId }
    });

    const novoSaldo = todosLancamentos.reduce((saldo, lanc) => {
      return lanc.tipo === 'DEBITO' 
        ? saldo + lanc.valor
        : saldo - lanc.valor;
    }, 0);

    await db.pessoa.update({
      where: { id: lancamento.pessoaId },
      data: { saldo: novoSaldo }
    });

    return NextResponse.json({ message: 'Lançamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir lançamento:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir lançamento' },
      { status: 500 }
    );
  }
}