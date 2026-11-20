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
