-- Banco de dados da aplicação MyProjects
CREATE DATABASE IF NOT EXISTS myproject_bd;
USE myproject_bd;

-- Criação da tabela de usuários
CREATE TABLE IF NOT EXISTS usuario (
    ID_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nomeUsuario VARCHAR(100) NOT NULL,
    nicknameUsuario VARCHAR(12) NOT NULL UNIQUE,
    emailUsuario VARCHAR(100) NOT NULL UNIQUE,
    senhaUsuario VARCHAR(255) NOT NULL
);

-- Criação da tabela de projetos
CREATE TABLE IF NOT EXISTS projeto (
    ID_projeto INT AUTO_INCREMENT PRIMARY KEY,
    nomeprojeto VARCHAR(120) NOT NULL DEFAULT 'Sem Nome',
    descricaoProjeto TEXT NOT NULL,
    dataEntrega DATETIME NOT NULL,
    projetoPublico BOOLEAN DEFAULT FALSE,
    statusProjeto ENUM ('Não Iniciado', 'Em Desenvolvimento', 'Concluído') DEFAULT 'Não Iniciado',
    dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela intermediaria de usuários e projetos
CREATE TABLE IF NOT EXISTS usuario_projeto (
    ID_relacionamento INT AUTO_INCREMENT PRIMARY KEY,
    ID_usuario INT NOT NULL,
    FOREIGN KEY (ID_usuario) REFERENCES usuario(ID_usuario) ON DELETE CASCADE,
    ID_projeto INT NOT NULL,
    FOREIGN KEY (ID_projeto) REFERENCES projeto(ID_projeto) ON DELETE CASCADE
);

-- Criação da tabela de tarefas do projeto
CREATE TABLE IF NOT EXISTS tarefa (
    ID_tarefa INT AUTO_INCREMENT PRIMARY KEY,
    descricaoTarefa TEXT NOT NULL,
    nomeTarefa VARCHAR(100) NOT NULL,
    dataInicio DATETIME NOT NULL,
    dataFim DATETIME NOT NULL,
    ID_projeto INT NOT NULL,
    FOREIGN KEY (ID_projeto) REFERENCES projeto(ID_projeto) ON DELETE CASCADE,
    statusTarefa ENUM('Não Iniciada', 'Em Desenvolvimento', 'Concluída') DEFAULT 'Não Iniciada',
    dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de permissões de usuários com os projetos
CREATE TABLE IF NOT EXISTS permissao (
    ID_permissao INT AUTO_INCREMENT PRIMARY KEY,
    tipoPermissao ENUM('R-PTA', 'CRUD-A', 'CRUD-TA','CRUD-PTA'),
    valorPermissao INT NOT NULL,
    ID_usuario INT NOT NULL,
    FOREIGN KEY (ID_usuario) REFERENCES usuario(ID_usuario) ON DELETE CASCADE,
    ID_projeto INT NOT NULL,
    FOREIGN KEY (ID_projeto) REFERENCES projeto(ID_projeto) ON DELETE CASCADE
);

-- Criação da tabela anotações de projetos
CREATE TABLE IF NOT EXISTS anotacao (
    ID_anotacao INT AUTO_INCREMENT PRIMARY KEY,
    textoAnotacao TEXT NOT NULL,
    ID_projeto INT NOT NULL,
    FOREIGN KEY (ID_projeto) REFERENCES projeto(ID_projeto) ON DELETE CASCADE,
    dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
);