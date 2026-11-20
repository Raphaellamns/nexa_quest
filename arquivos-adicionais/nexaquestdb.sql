CREATE DATABASE IF NOT EXISTS nexaquest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexaquest;

CREATE TABLE IF NOT EXISTS Usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  tipo ENUM('operador','administrador') NOT NULL DEFAULT 'operador',
  nivel INT NOT NULL DEFAULT 1,
  pontos_totais INT NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CHECK (pontos_totais >= 0 AND nivel = FLOOR(pontos_totais / 100) + 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Missaos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  jornada VARCHAR(255) NOT NULL,
  descricao TEXT NULL,
  pontos_recompensa INT NOT NULL DEFAULT 10,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CHECK (pontos_recompensa > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Progressos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usuario_id INT NOT NULL,
  missao_id INT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  UNIQUE KEY uq_progresso_usuario_missao (usuario_id, missao_id),
  FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (missao_id) REFERENCES Missaos(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO Missaos (titulo, jornada, descricao, pontos_recompensa, createdAt, updatedAt)
SELECT demo.titulo, demo.jornada, demo.descricao, demo.pontos, UTC_TIMESTAMP(), UTC_TIMESTAMP()
FROM (
  SELECT 'Alfabeto manual' AS titulo, 'Primeiros passos em Libras' AS jornada,
         'Pratique o alfabeto manual e soletre seu primeiro nome.' AS descricao, 50 AS pontos
  UNION ALL
  SELECT 'Cumprimentos em Libras', 'Primeiros passos em Libras',
         'Pratique três cumprimentos e use um deles em uma conversa.', 50
  UNION ALL
  SELECT 'Apresentação em Libras', 'Comunicação em Libras',
         'Grave uma apresentação breve com seu nome e um cumprimento.', 75
) AS demo
WHERE NOT EXISTS (
  SELECT 1 FROM Missaos AS existente
  WHERE existente.titulo = demo.titulo AND existente.jornada = demo.jornada
);


