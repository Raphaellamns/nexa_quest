# Modelagem lógica

[Arquivo editável do brModelo](brmodelo/Nexa-Quest-Logico.brM3) · [Imagem do modelo lógico](brmodelo/Nexa-Quest-Logico.png)

| Relação | Coluna | Tipo | Restrição |
| --- | --- | --- | --- |
| Usuarios | id | INT | PK, auto incremento |
| Usuarios | nome, email, senha | VARCHAR(255) | Obrigatórios. E-mail único. Senha guarda hash bcrypt. |
| Usuarios | tipo | ENUM | operador ou administrador. Padrão operador. |
| Usuarios | nivel | INT | Padrão 1. Calculado a partir dos pontos. |
| Usuarios | pontos_totais | INT | Padrão 0. Saldo histórico. |
| Missaos | id | INT | PK, auto incremento |
| Missaos | titulo, jornada | VARCHAR(255) | Obrigatórios |
| Missaos | descricao | TEXT | Opcional |
| Missaos | pontos_recompensa | INT | Obrigatório, mínimo 1 |
| Progressos | id | INT | PK, auto incremento |
| Progressos | usuario_id | INT | FK obrigatória → Usuarios.id. Exclusão em cascata. |
| Progressos | missao_id | INT | FK opcional → Missaos.id. Exclusão define NULL. |
| Progressos | data | DATETIME | Data de conclusão em UTC |
| Todas | createdAt, updatedAt | DATETIME | Datas mantidas pelo Sequelize |

`UNIQUE (usuario_id, missao_id)` assegura uma conclusão por missão existente e usuário. No MySQL, o índice aceita múltiplas ocorrências de `NULL`, preservando registros de diferentes missões removidas.

Cada entidade guarda seus próprios atributos. `Progressos` resolve a relação muitos-para-muitos entre usuários e missões. O nível é derivado do saldo e armazenado em conjunto com ele. O saldo preserva a recompensa concedida na conclusão, mesmo após mudanças no catálogo. A API grava a conclusão e atualiza o saldo e o nível na mesma transação.

A implementação física está nos [scripts SQL](../arquivos-adicionais/).
