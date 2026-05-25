# User Stories - Trade Platform

## US1: Autenticação via Steam (Onboarding)

**Statement:** Como utilizador, quero autenticar-me no site usando a minha conta Steam, para que o sistema tenha acesso seguro ao meu inventário e perfil.

**Acceptance Criteria:**
- AC1: O site deve usar o protocolo OpenID da Steam para login.
- AC2: No primeiro login, o sistema deve criar um perfil interno vinculado ao SteamID64.
- AC3: O utilizador deve ser obrigado a fornecer o seu Trade URL da Steam para que as trocas possam ser iniciadas pelo site.
- AC4: O sistema deve validar se a conta Steam do utilizador não possui "VAC Ban" ou "Trade Ban".

## US2: Sincronização e Listagem de Inventário

**Statement:** Como vendedor, quero ver os meus itens de Dota 2 e selecionar quais desejo colocar à venda, para que outros utilizadores os possam comprar.

**Acceptance Criteria:**
- AC1: O sistema deve consumir a API da Steam para carregar apenas itens de Dota 2 (AppID 570).
- AC2: Itens marcados como "Não trocáveis" (Non-tradable) no inventário Steam não devem ser exibidos para venda.
- AC3: O vendedor deve poder definir o preço em Reais (BRL).
- AC4: O sistema deve exibir claramente se o item está em Trade Lock (bloqueio de 7 dias) e a data exacta em que ficará disponível.

## US3: Checkout com Escrow (O "Handshake")

**Statement:** Como comprador, quero pagar por um item de forma segura, sabendo que o meu dinheiro só será entregue ao vendedor se o item chegar ao meu inventário.

**Acceptance Criteria:**
- AC1: Ao clicar em comprar, o item deve ficar com o status "Reservado".
- AC2: O sistema deve integrar com um gateway de pagamento (ex: Pix) e confirmar o recebimento do valor.
- AC3: Após o pagamento, o saldo deve ser retido numa carteira virtual de custódia controlada pela plataforma (Escrow).
- AC4: O comprador deve receber uma confirmação de que o pagamento foi processado e que o vendedor foi notificado para enviar o item.

## US4: Execução da Troca P2P

**Statement:** Como vendedor, quero ser guiado para enviar o item correto ao comprador correto, evitando erros manuais ou golpes.

**Acceptance Criteria:**
- AC1: O vendedor deve receber uma notificação (E-mail/Dashboard) com um botão "Enviar Proposta de Troca".
- AC2: O sistema deve gerar um link que abra a janela de troca da Steam com o item já selecionado.
- AC3: O sistema deve fornecer um "Código de Segurança" único para aquela transação, que deve ser inserido na mensagem da troca da Steam para verificação mútua.
- AC4: O vendedor tem um prazo limite (ex: 12 horas) para iniciar a troca antes de a venda ser cancelada por inatividade.

## US5: Monitorização e Liberação de Saldo (O Fechamento)

**Statement:** Como sistema, quero monitorizar o estado da troca na Steam para concluir a transação automaticamente assim que o item for entregue.

**Acceptance Criteria:**
- AC1: O sistema deve consultar a IEconService/GetTradeOffer da Steam periodicamente usando a API Key fornecida pelo utilizador (ou via bot de monitorização).
- AC2: Assim que o estado da troca mudar para TradeOfferState: Accepted, o sistema deve marcar a venda como "Concluída".
- AC3: O sistema deve calcular a comissão da plataforma (ex: 10%) e creditar o valor líquido no saldo do vendedor.
- AC4: Se a troca for cancelada ou recusada na Steam, o sistema deve bloquear a liberação do dinheiro e notificar o suporte.

## US6: Sistema de Estorno Automático

**Statement:** Como comprador, quero ser reembolsado automaticamente caso o vendedor não envie o item no prazo estipulado.

**Acceptance Criteria:**
- AC1: Se o vendedor não enviar a proposta de troca em até 12 horas (ou o tempo definido no MVP), a transação deve expirar.
- AC2: O valor retido no Escrow deve ser devolvido integralmente para a carteira virtual do comprador ou via estorno no gateway.
- AC3: O vendedor que falhar na entrega deve ter a sua reputação diminuída ou ser temporariamente bloqueado de anunciar novos itens.
