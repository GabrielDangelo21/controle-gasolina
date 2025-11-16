import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const pessoas = await db.pessoa.findMany({
      orderBy: {
        nome: 'asc'
      }
    });

    return NextResponse.json(pessoas);
  } catch (error) {
    console.error('Erro ao buscar pessoas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pessoas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nome, observacoes } = await request.json();

    if (!nome || nome.trim() === '') {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    const pessoa = await db.pessoa.create({
      data: {
        nome: nome.trim(),
        observacoes: observacoes?.trim() || null,
        saldo: 0
      }
    });

    return NextResponse.json(pessoa, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
    return NextResponse.json(
      { error: 'Erro ao criar pessoa' },
      { status: 500 }
    );
  }
}