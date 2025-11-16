# Controle de Gasolina

Aplicativo web para controlar trocas de gasolina por serviços e produtos.

## Funcionalidades

- ✅ Cadastro de múltiplas pessoas/serviços
- ✅ Lançamentos de débito (pago com gasolina) e crédito (recebido serviço)
- ✅ Controle de saldos individuais
- ✅ Histórico completo com filtros por período
- ✅ Design responsivo para mobile e desktop
- ✅ Interface em português

## Stack Tecnológica

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite
- **Deploy**: Vercel

## Deploy na Vercel

1. **Fazer fork ou clone deste repositório**
2. **Acessar [vercel.com](https://vercel.com)**
3. **Importar o repositório do GitHub**
4. **Configurar variáveis de ambiente**:
   - `DATABASE_URL`: URL do banco de dados (recomendado PostgreSQL)
5. **Deploy automático**

### Configuração do Banco de Dados

Para produção, recomenda-se usar PostgreSQL:

1. Criar conta no [Supabase](https://supabase.com) (grátis)
2. Criar novo projeto PostgreSQL
3. Copiar string de conexão
4. Adicionar como variável de ambiente na Vercel

### Variáveis de Ambiente na Vercel

No painel da Vercel > Settings > Environment Variables:

```
DATABASE_URL=postgresql://usuario:senha@host:porta/database
```

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Configurar banco de dados
npm run db:push

# Iniciar servidor
npm run dev
```

Acesse `http://localhost:3000`

## Licença

MIT