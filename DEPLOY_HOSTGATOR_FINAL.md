# Deploy para HostGator - Versão Funcional

## Arquivos para upload:
1. **.next/standalone/** (toda a pasta)
2. **package.json**
3. **public/** (logo, manifest, etc.)

## Passos:

### 1. Acessar HostGator
1. Acesse cPanel do HostGator
2. Vá para "File Manager"
3. Navegue até: public_html/
4. Crie pasta: controle-gasolina/
5. Faça upload dos arquivos

### 2. Configurar Node.js
1. Em cPanel, procure por "Setup Node.js App"
2. Selecione a pasta controle-gasolina/
3. Configure:
   - **Application URL**: /controle-gasolina
   - **Application startup file**: server.js
   - **Node.js version**: 18.x ou superior
4. Clique em "Setup"

### 3. Variáveis de Ambiente
1. Na configuração do Node.js, adicione:
   ```
   DATABASE_URL=postgresql://usuario:senha@host:porta/database
   ```
   (Use seu Supabase ou crie banco MySQL na HostGator)

### 4. Banco de Dados (Opção A - Supabase)
1. Crie conta em https://supabase.com
2. Crie projeto PostgreSQL
3. Copie connection string
4. Adicione como variável de ambiente

### 5. Banco de Dados (Opção B - MySQL HostGator)
1. Em cPanel → "MySQL Databases"
2. Crie banco: controle_gasolina
3. Anote credenciais
4. Configure variável:
   ```
   DATABASE_URL=mysql://usuario:senha@localhost/nome_banco
   ```

## URL Final:
https://SEU_DOMINIO.com/controle-gasolina/

## Vantagens:
✅ Servidor Node.js nativo
✅ Performance otimizada
✅ Build standalone
✅ Banco de dados na nuvem
✅ URL própria
✅ SSL gratuito