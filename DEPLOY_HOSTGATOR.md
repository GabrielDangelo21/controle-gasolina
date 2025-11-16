# Deploy para HostGator

## Arquivos necessários:
1. .next/ (pasta do build)
2. api/database.php (backend PHP)
3. .htaccess (configuração Apache)
4. .env.production (variáveis de ambiente)

## Passos:

### 1. Configurar Banco de Dados
1. Acesse cPanel do HostGator
2. Clique em "MySQL Databases"
3. Crie novo banco:
   - Database name: controle_gasolina
   - Username: gabriel_gasolina
   - Password: (gere uma senha forte)
4. Anote as credenciais

### 2. Upload dos Arquivos
1. Acesse cPanel → "File Manager"
2. Vá para pasta public_html/
3. Crie pasta: controle-gasolina/
4. Upload todos os arquivos para essa pasta

### 3. Configurar Banco
1. Edite api/database.php
2. Substitua as credenciais:
   - $host = 'localhost'
   - $database = 'controle_gasolina'  
   - $username = 'gabriel_gasolina'
   - $password = 'SUA_SENHA_AQUI'

### 4. Configurar Frontend
1. Copie conteúdo de .next/ para pasta static/
2. Ou redirecione para a pasta principal

### 5. Acessar App
URL: https://seusite.com/controle-gasolina/

## Vantagens do HostGator:
✅ Banco MySQL grátis
✅ Domínio próprio
✅ SSL gratuito
✅ Backup automático
✅ Suporte 24/7