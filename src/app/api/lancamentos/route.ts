import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pessoaId = searchParams.get('pessoaId');
    
    const lancamentos = await db.lancamento.findMany({
      where: pessoaId ? { pessoaId } : {},
      include: {
        pessoa: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: {
        data: 'desc'
      }
    });

    return NextResponse.json(lancamentos);
  } catch (error) {
    console.error('Erro ao buscar lançamentos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar lançamentos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pessoaId, data, tipo, valor, descricao } = await request.json();

    if (!pessoaId || !data || !tipo || valor === undefined || !descricao) {
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

    const valorNumerico = parseFloat(valor);
    if (valorNumerico <= 0 || isNaN(valorNumerico)) {
      return NextResponse.json(
        { error: 'Valor deve ser maior que zero' },
        { status: 400 }
      );
    }

    // Usar transação para garantir consistência
    const result = await db.$transaction(async (tx) => {
      // Buscar a pessoa
      const pessoa = await tx.pessoa.findUnique({
        where: { id: pessoaId }
      });

      if (!pessoa) {
        throw new Error('Pessoa não encontrada');
      }

      // Criar o lançamento
      const lancamento = await tx.lancamento.create({
        data: {
          pessoaId,
          data: new Date(data),
          tipo: tipo as 'DEBITO' | 'CREDITO',
          valor: valorNumerico,
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

      // Atualizar o saldo da pessoa
      const novoSaldo = tipo === 'DEBITO' 
        ? pessoa.saldo + valorNumerico
        : pessoa.saldo - valorNumerico;

      await tx.pessoa.update({
        where: { id: pessoaId },
        data: { saldo: novoSaldo }
      });

      return lancamento;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar lançamento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar lançamento' },
      { status: 500 }
    );
  }
}