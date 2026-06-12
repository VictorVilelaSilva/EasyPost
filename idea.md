# Demanda: Plataforma de Orcamento para Pintores

## Contexto

Criar um site para pintores parceiros montarem orcamentos de pintura de forma rapida, profissional e padronizada.

A ideia nasceu da necessidade de calcular a quantidade de tinta com base na metragem da area a ser pintada, na linha do produto escolhido e no rendimento informado para cada tinta. A experiencia deve se inspirar principalmente na calculadora do site da Coral, usando um fluxo simples com duas opcoes:

- "Ja sei a metragem";
- "Ainda nao sei a metragem".

No primeiro caso, o pintor informa diretamente a area total do ambiente em m2. No segundo caso, o sistema abre uma calculadora detalhada para calcular a area com base em paredes, portas e janelas.

O diferencial do sistema e que ele nao deve apenas calcular tinta. Ele tambem deve permitir que o pintor informe o valor da mao de obra e gere um orcamento final somando materiais e servico.

Exemplo esperado:

- O sistema ja vem com uma tinta Coral definida como parametro inicial.
- O cliente quer pintar 200 m2 de parede.
- O sistema usa o rendimento cadastrado dessa tinta para calcular quantas embalagens serao necessarias.
- O pintor informa manualmente o valor do servico.
- O sistema soma materiais + servico e gera o valor final do orcamento.

## Objetivo do Produto

Entregar uma ferramenta web para que pintores consigam:

- calcular a area total de pintura;
- escolher a linha/produto de tinta;
- calcular automaticamente a quantidade de latas ou galoes necessarios;
- estimar o custo de materiais;
- inserir o valor da mao de obra;
- gerar um resumo claro do orcamento para apresentar ao cliente;
- salvar historico de orcamentos por cliente.

## Publico-alvo

Pintores parceiros de lojas de tintas, autônomos ou pequenas equipes que precisam gerar orcamentos com rapidez e menos erro.

O sistema tambem pode ser usado pela equipe da loja para apoiar o pintor na venda dos produtos corretos.

## Escopo MVP

### 1. Login

O site deve ter autenticação simples para pintores.

Campos minimos:

- nome;
- telefone;
- e-mail;
- senha.

Apos o login, o pintor acessa seu painel com os orcamentos criados.

### 2. Painel Inicial

O painel deve mostrar:

- botao para criar novo orcamento;
- lista de orcamentos recentes;
- nome do cliente;
- data;
- status do orcamento;
- valor total estimado.

Status sugeridos:

- rascunho;
- enviado;
- aprovado;
- recusado.

### 3. Cadastro do Cliente

Ao criar um orcamento, o pintor deve informar:

- nome do cliente;
- telefone do cliente;
- endereco da obra;
- observacoes gerais.

### 4. Calculadora de Area

A calculadora deve seguir a ideia visual e funcional da calculadora da Coral, com uma pergunta inicial:

```txt
Ja sabe a metragem que sera pintada?
```

O usuario escolhe entre duas abas/botoes:

- "Ja sei a metragem";
- "Ainda nao sei a metragem".

#### Modo 1: Ja sei a metragem

Para quando o pintor ja sabe a metragem total.

Campos:

- area total do ambiente em m2;
- quantidade de demaos;
- tipo de superficie;
- observacoes.

Regras:

- o campo deve aceitar virgula ou ponto decimal;
- exemplo de placeholder: "Ex: 25,5 ou 25.5";
- o sistema deve converter o valor para numero antes de calcular a quantidade de tinta;
- esse modo deve ser o mais rapido possivel, com poucos campos e resultado imediato.

#### Modo 2: Ainda nao sei a metragem

Para quando o pintor quer calcular a metragem a partir das medidas.

O sistema deve abrir uma tela/modal de "Calcular a quantidade", semelhante ao fluxo da Coral, com blocos separados para:

- paredes;
- portas;
- janelas;
- area total do ambiente.

Campos do bloco "Paredes":

- altura em metros;
- largura em metros;
- area total do ambiente em m2.

Campos do bloco "Possui portas?":

- quantidade de portas;
- altura da porta em metros;
- largura da porta em metros;
- area total das portas em m2.

Campos do bloco "Possui janelas?":

- quantidade de janelas;
- altura da janela em metros;
- largura da janela em metros;
- area total das janelas em m2.

Campo final:

- area total do ambiente em m2, calculada automaticamente.

O sistema deve calcular:

- area bruta das paredes;
- area descontada de portas e janelas;
- area final pintavel;
- area total considerando demaos.

Exemplo:

```txt
Area bruta das paredes = altura da parede x largura da parede
Area das portas = quantidade de portas x altura da porta x largura da porta
Area das janelas = quantidade de janelas x altura da janela x largura da janela
Descontos = area das portas + area das janelas
Area pintavel = area bruta - descontos
Area total para tinta = area pintavel x quantidade de demaos
```

Observacao para o MVP:

- nao incluir teto, rodape, moldura/gesso ou deck na primeira versao;
- manter o foco em parede, porta e janela, como no fluxo da Coral enviado nas imagens;
- permitir adicionar mais ambientes em etapa futura.

### 5. Produtos e Rendimento

O sistema deve ter uma base de produtos/tintas com rendimento por embalagem.

Para o MVP, o sistema deve iniciar com uma tinta Coral pre-selecionada como parametro padrao do calculo. Essa tinta deve vir cadastrada como seed inicial no banco e aparecer automaticamente na criacao de um novo orcamento.

Como os dados exatos do produto devem ser confirmados pela loja/time de negocio, cadastrar inicialmente como:

```txt
Nome temporario: Tinta Coral Padrao Inicial
Marca: Coral
Linha: a definir
Tipo: tinta para parede
Acabamento: a definir
Embalagem: a definir
Rendimento por embalagem: a definir
Preco: a definir
```

O time de desenvolvimento deve deixar esses dados editaveis na area administrativa, para que a loja consiga alterar nome, embalagem, rendimento e preco sem precisar alterar codigo.

Campos minimos do produto:

- nome da tinta;
- marca;
- linha do produto;
- tipo de tinta;
- acabamento;
- ambiente indicado;
- tamanho da embalagem;
- rendimento por embalagem em m2;
- preco da embalagem;
- observacoes.

Exemplos de linha:

- economica;
- standard;
- premium;
- lavavel;
- externa;
- textura.

O rendimento deve ser configuravel, pois varia por produto, acabamento, superficie, aplicacao e quantidade de demaos.

### 6. Calculo de Quantidade de Tinta

Com base na area final e no rendimento do produto, o sistema deve calcular automaticamente a quantidade necessaria.

Regra:

```txt
quantidade de embalagens = area total para tinta / rendimento por embalagem
```

O resultado deve ser arredondado para cima, pois o pintor precisa comprar embalagens inteiras.

Exemplo:

```txt
Area total: 200 m2
Produto escolhido: Tinta Coral Padrao Inicial
Rendimento cadastrado: 50 m2 por lata
Resultado: 200 / 50 = 4 latas
```

O sistema deve permitir ajuste manual caso o pintor queira alterar a quantidade sugerida.

### 7. Custos de Materiais

O sistema deve calcular:

- quantidade de embalagens;
- preco unitario;
- subtotal por produto;
- subtotal geral de materiais.

Tambem deve permitir adicionar itens extras ao orcamento, como:

- massa corrida;
- selador;
- fundo preparador;
- fita;
- lixa;
- lona;
- rolo;
- pincel;
- bandeja;
- outros materiais.

Cada item extra deve ter:

- nome;
- quantidade;
- preco unitario;
- subtotal.

### 8. Valor de Mao de Obra

O pintor deve ter um campo livre para informar o valor do servico.

Campos:

- valor da mao de obra;
- prazo estimado;
- forma de pagamento;
- observacoes do servico.

O sistema nao deve obrigar o calculo automatico da mao de obra no MVP, porque cada pintor pode cobrar de uma forma diferente.

### 9. Orcamento Final

O resumo final deve mostrar:

- dados do cliente;
- endereco da obra;
- ambientes/areas calculadas;
- area total de pintura;
- produto escolhido;
- rendimento usado no calculo;
- quantidade de embalagens;
- custo de materiais;
- valor da mao de obra;
- valor total do orcamento;
- observacoes;
- validade do orcamento.

Regra:

```txt
valor total = subtotal de materiais + valor da mao de obra
```

O pintor deve conseguir revisar o orcamento antes de salvar.

### 10. Compartilhamento

No MVP, o sistema deve permitir gerar uma visualizacao simples do orcamento para envio ao cliente.

Formatos desejados:

- pagina de resumo;
- PDF;
- link compartilhavel;
- envio por WhatsApp com texto resumido.

O PDF e o envio por WhatsApp podem entrar como segunda etapa, caso seja necessario reduzir escopo.

## Requisitos de Interface

A interface deve ser simples, responsiva e pensada para celular, pois muitos pintores usarao o sistema durante visitas a clientes.

Diretrizes:

- usar linguagem direta;
- evitar campos longos demais;
- permitir avancar por etapas;
- mostrar o resumo do valor sempre que possivel;
- destacar alertas quando faltar algum dado obrigatorio;
- permitir editar qualquer etapa antes de finalizar;
- usar unidades brasileiras: m, m2, litros, galao, lata.
- usar botoes em formato de abas para alternar entre "Ja sei a metragem" e "Ainda nao sei a metragem";
- deixar a opcao selecionada visualmente destacada;
- manter os blocos de paredes, portas e janelas bem separados;
- mostrar os calculos parciais de area ao lado dos campos principais;
- permitir fechar/cancelar a calculadora detalhada sem perder o orcamento.

Fluxo sugerido:

1. Login.
2. Novo orcamento.
3. Dados do cliente.
4. Calculo da area.
5. Produto padrao Coral ja selecionado.
6. Materiais extras.
7. Mao de obra.
8. Resumo final.
9. Salvar ou compartilhar.

## Regras Importantes

- O calculo deve deixar claro que e uma estimativa.
- A experiencia inicial da calculadora deve seguir a referencia da Coral enviada nas imagens.
- O fluxo deve comecar perguntando se o pintor ja sabe a metragem.
- Se o pintor souber a metragem, ele informa diretamente a area total do ambiente em m2.
- Se o pintor nao souber a metragem, ele calcula usando altura/largura de paredes, portas e janelas.
- O rendimento da tinta deve vir da base de produtos e poder ser editado por administrador.
- Uma tinta Coral deve vir pre-selecionada como parametro inicial do MVP.
- O pintor pode ajustar manualmente a quantidade final de tinta.
- O sistema deve arredondar a quantidade de embalagens para cima.
- Portas e janelas devem ser descontadas da area pintavel quando informadas.
- A quantidade de demaos deve impactar o consumo total.
- O valor da mao de obra deve ser informado manualmente no MVP.
- O orcamento deve separar materiais e servico antes de mostrar o total.

## Area Administrativa

Deve existir uma area para a loja ou administrador gerenciar:

- pintores cadastrados;
- produtos;
- marcas;
- linhas de tinta;
- rendimento por produto;
- precos;
- orcamentos gerados.

Essa area pode ser simples no MVP, mas precisa permitir manter a base de produtos atualizada.

## Fora do Escopo Inicial

Nao faz parte do MVP:

- pagamento online;
- assinatura digital;
- controle de estoque em tempo real;
- emissao fiscal;
- CRM completo;
- app mobile nativo;
- calculo automatico avancado de mao de obra;
- integracao com ERP da loja.

## Criterios de Aceite

- O pintor consegue criar conta, fazer login e acessar o painel.
- O pintor consegue criar um orcamento para um cliente.
- O sistema apresenta as opcoes "Ja sei a metragem" e "Ainda nao sei a metragem".
- No modo "Ja sei a metragem", o pintor consegue informar diretamente a area total do ambiente.
- No modo "Ainda nao sei a metragem", o pintor consegue calcular area usando paredes, portas e janelas.
- O sistema desconta portas e janelas quando informadas.
- O sistema considera quantidade de demaos.
- O orcamento inicia com uma tinta Coral pre-selecionada como parametro padrao.
- O pintor consegue usar uma tinta com rendimento cadastrado.
- O sistema calcula a quantidade de embalagens e arredonda para cima.
- O pintor consegue adicionar materiais extras.
- O pintor consegue informar manualmente a mao de obra.
- O sistema mostra subtotal de materiais, valor de servico e total final.
- O orcamento pode ser salvo e consultado depois.
- O resumo final fica compreensivel para ser apresentado ao cliente.

## Observacoes de Produto

Essa ferramenta tem potencial comercial forte para lojas de tintas, porque ajuda os pintores parceiros a venderem mais produtos da loja e reduz erros de compra.

O sistema deve ser construido com foco em velocidade, clareza e confianca. O pintor nao deve sentir que esta preenchendo um formulario complexo; ele deve sentir que esta montando um orcamento profissional em poucos minutos.
