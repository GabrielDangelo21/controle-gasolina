import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pessoa = await db.pessoa.findUnique({
      where: { id },
      include: {
        lancamentos: {
          orderBy: {
            data: 'desc'
          }
        }
      }
    });

    if (!pessoa) {
      return NextResponse.json(
        { error: 'Pessoa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(pessoa);
  } catch (error) {
    console.error('Erro ao buscar pessoa:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pessoa' },
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
    const { nome, observacoes } = await request.json();

    if (!nome || nome.trim() === '') {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    const pessoa = await db.pessoa.update({
      where: { id },
      data: {
        nome: nome.trim(),
        observacoes: observacoes?.trim() || null
      }
    });

    return NextResponse.json(pessoa);
  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar pessoa' },
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
    // Verificar se a pessoa existe
    const pessoa = await db.pessoa.findUnique({
      where: { id },
      include: {
        lancamentos: {
          select: { id: true }
        }
      }
    });

    if (!pessoa) {
      return NextResponse.json(
        { error: 'Pessoa não encontrada' },
        { status: 404 }
      );
    }

    // Excluir todos os lançamentos relacionados (cascade deveria fazer isso automaticamente)
    await db.lancamento.deleteMany({
      where: { pessoaId: id }
    });

    // Excluir a pessoa
    await db.pessoa.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Pessoa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir pessoa:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir pessoa' },
      { status: 500 }
    );
  }
}