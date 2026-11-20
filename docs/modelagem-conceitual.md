# Modelagem conceitual

O **Usuário** é um participante identificado por e-mail. O perfil operador joga, enquanto o perfil administrador também gerencia o catálogo de missões.

A **Missão** é uma atividade com título, descrição, recompensa e jornada. A jornada organiza as missões em grupos temáticos usando o nome cadastrado pelo administrador.

O **Progresso** registra a conclusão de uma missão por um usuário. Um usuário pode ter zero ou várias conclusões. Cada missão pode aparecer em zero ou várias conclusões, com uma conclusão por par usuário–missão. Cada conclusão pertence a exatamente um usuário e referencia uma missão enquanto ela existe. A remoção de uma missão preserva a conclusão e o saldo de pontos.

O nível é calculado a cada 100 pontos. As medalhas e os conteúdos desbloqueados são determinados pelas regras documentadas no README.
