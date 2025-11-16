<?php
// Configuração para banco de dados MySQL no HostGator
$host = 'localhost';
$database = 'seu_usuario_bd'; // Mude para seu usuário do banco
$username = 'seu_usuario_bd'; // Mude para seu usuário do banco  
$password = 'sua_senha_bd'; // Mude para sua senha do banco

// Conexão com o banco
try {
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("ERRO: " . $e->getMessage());
}

// Criar tabelas se não existirem
$criarTabelas = "
CREATE TABLE IF NOT EXISTS pessoas (
    id VARCHAR(255) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    observacoes TEXT,
    saldo DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lancamentos (
    id VARCHAR(255) PRIMARY KEY,
    pessoaId VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    tipo ENUM('DEBITO', 'CREDITO') NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    descricao TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pessoaId) REFERENCES pessoas(id) ON DELETE CASCADE
);
";

// Executar criação das tabelas
try {
    $pdo->exec($criarTabelas);
    echo "✅ Tabelas criadas com sucesso!";
} catch(PDOException $e) {
    echo "❌ Erro ao criar tabelas: " . $e->getMessage();
}

// API endpoints
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api/', '', $path);

// Router simples
switch ($path) {
    case 'pessoas':
        handlePessoas($pdo, $method);
        break;
    case 'lancamentos':
        handleLancamentos($pdo, $method);
        break;
    default:
        if (strpos($path, 'pessoas/') === 0) {
            $id = str_replace('pessoas/', '', $path);
            handlePessoaById($pdo, $method, $id);
        } elseif (strpos($path, 'lancamentos/') === 0) {
            $id = str_replace('lancamentos/', '', $path);
            handleLancamentoById($pdo, $method, $id);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint não encontrado']);
        }
        break;
}

function handlePessoas($pdo, $method) {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM pessoas ORDER BY nome ASC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("INSERT INTO pessoas (id, nome, observacoes, saldo) VALUES (?, ?, ?, ?)");
            $id = uniqid();
            $stmt->execute([$id, $data['nome'], $data['observacoes'] ?? null, 0]);
            echo json_encode(['id' => $id, 'nome' => $data['nome']]);
            break;
    }
}

function handleLancamentos($pdo, $method) {
    switch ($method) {
        case 'GET':
            $pessoaId = $_GET['pessoaId'] ?? null;
            if ($pessoaId) {
                $stmt = $pdo->prepare("SELECT * FROM lancamentos WHERE pessoaId = ? ORDER BY data DESC");
                $stmt->execute([$pessoaId]);
            } else {
                $stmt = $pdo->query("SELECT * FROM lancamentos ORDER BY data DESC");
            }
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("INSERT INTO lancamentos (id, pessoaId, data, tipo, valor, descricao) VALUES (?, ?, ?, ?, ?, ?)");
            $id = uniqid();
            $stmt->execute([$id, $data['pessoaId'], $data['data'], $data['tipo'], $data['valor'], $data['descricao']]);
            
            // Atualizar saldo da pessoa
            $pessoaStmt = $pdo->prepare("SELECT saldo FROM pessoas WHERE id = ?");
            $pessoaStmt->execute([$data['pessoaId']]);
            $pessoa = $pessoaStmt->fetch(PDO::FETCH_ASSOC);
            
            $novoSaldo = $data['tipo'] === 'DEBITO' 
                ? $pessoa['saldo'] + $data['valor']
                : $pessoa['saldo'] - $data['valor'];
                
            $updateStmt = $pdo->prepare("UPDATE pessoas SET saldo = ? WHERE id = ?");
            $updateStmt->execute([$novoSaldo, $data['pessoaId']]);
            
            echo json_encode(['id' => $id, 'pessoaId' => $data['pessoaId']]);
            break;
    }
}

function handlePessoaById($pdo, $method, $id) {
    // Implementar GET, PUT, DELETE para pessoa específica
    // Similar às funções acima
}

function handleLancamentoById($pdo, $method, $id) {
    // Implementar GET, PUT, DELETE para lançamento específico  
    // Similar às funções acima
}
?>