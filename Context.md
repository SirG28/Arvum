# DESENVOLVIMENTO DA PLATAFORMA ARVUM — MARKETPLACE DE ALUGUEL DE MÁQUINAS AGRÍCOLAS

Atue como uma equipe sênior multidisciplinar formada por:

- Product Manager;
- UX/UI Designer;
- Arquiteto de Software;
- Desenvolvedor Front-end;
- Desenvolvedor Back-end;
- Especialista em banco de dados;
- Especialista em segurança;
- Analista de qualidade;
- Especialista em sistemas para o agronegócio.

Sua missão é planejar, estruturar e desenvolver uma plataforma digital escalável de aluguel de máquinas agrícolas, considerando produto, experiência do usuário, interface, arquitetura, regras de negócio, segurança, acessibilidade, documentação e testes.

Não implemente funcionalidades de forma isolada ou improvisada. Antes de começar, analise todo o projeto existente, identifique a tecnologia já utilizada, preserve padrões válidos do repositório e proponha uma estrutura sustentável.

---

# 1. CONTEXTO DO PROJETO

O projeto faz parte do Startup One do curso de Web Design da FIAP.

Integrantes:

- Ana Carolina Cantarelli Fernandes — RM 561491;
- Sarah Gonçalves Garcia — RM 563539.

Área de atuação:

- AgTech;
- economia compartilhada;
- marketplace;
- logística agrícola;
- sistemas para internet.

A solução será uma plataforma digital de aluguel de máquinas e equipamentos agrícolas, conectando produtores que possuem máquinas disponíveis com produtores que precisam utilizá-las em períodos específicos.

A plataforma não deve funcionar apenas como um catálogo ou classificado. Ela deve organizar todo o processo de locação, incluindo:

- descoberta de equipamentos;
- verificação de disponibilidade;
- solicitação ou reserva;
- definição do período;
- localização;
- logística;
- custos;
- comunicação entre as partes;
- pagamento;
- acompanhamento da locação;
- avaliação após a conclusão.

---

# 2. PROBLEMA IDENTIFICADO

O setor agrícola apresenta uma ineficiência no acesso e na utilização de máquinas agrícolas, especialmente entre pequenos e médios produtores.

Os principais problemas são:

## 2.1 Alto custo de aquisição

Máquinas agrícolas possuem custos elevados de aquisição, manutenção, armazenamento e operação.

Pequenos e médios produtores frequentemente não possuem recursos suficientes para adquirir todos os equipamentos necessários para plantio, manejo e colheita.

## 2.2 Uso sazonal

Muitas máquinas são utilizadas apenas em períodos específicos do calendário agrícola.

Durante o restante do ano, permanecem paradas, gerando:

- capacidade ociosa;
- custos de armazenamento;
- depreciação;
- baixa eficiência financeira do ativo.

## 2.3 Dificuldade de acesso

Produtores que não possuem máquinas próprias dependem de:

- empréstimos;
- cooperativas;
- prestadores locais;
- acordos informais;
- disponibilidade eventual de terceiros.

Essas alternativas nem sempre atendem à demanda no período correto.

Um atraso no acesso ao equipamento pode afetar o plantio, a colheita e a produtividade.

## 2.4 Problemas logísticos

Mesmo quando existe uma máquina disponível, o transporte entre propriedades pode ser:

- caro;
- demorado;
- difícil de organizar;
- dependente de veículos específicos;
- incompatível com determinadas estradas ou distâncias;
- pouco previsível.

A logística é parte central da solução e não deve ser tratada como uma funcionalidade secundária.

## 2.5 Falta de organização e transparência

O processo de aluguel pode ocorrer informalmente e sem informações claras sobre:

- preço;
- disponibilidade;
- localização;
- estado do equipamento;
- responsabilidade pelo transporte;
- condições de uso;
- avaliações do proprietário;
- avaliações do locatário;
- segurança do pagamento.

---

# 3. OPORTUNIDADE

Existe uma oportunidade de criar uma plataforma baseada em economia compartilhada que:

- conecte oferta e demanda;
- aumente o aproveitamento de máquinas ociosas;
- reduza barreiras de acesso;
- organize a logística;
- reduza custos operacionais;
- gere renda para proprietários de equipamentos;
- aumente a produtividade de pequenos e médios produtores;
- torne o processo de locação mais seguro e previsível.

A solução deverá aplicar tecnologia para melhorar a eficiência no uso dos recursos agrícolas disponíveis.

---

# 4. OBJETIVO DO PRODUTO

Desenvolver uma plataforma digital que permita que produtores rurais encontrem, reservem e recebam máquinas agrícolas adequadas para suas necessidades, enquanto proprietários possam cadastrar, disponibilizar e rentabilizar equipamentos ociosos.

A plataforma deve resolver simultaneamente três dimensões:

1. **Acesso:** permitir que produtores encontrem máquinas adequadas.
2. **Otimização de recursos:** reduzir o tempo de ociosidade dos equipamentos.
3. **Logística integrada:** organizar como a máquina será retirada, entregue e devolvida.

---

# 5. PÚBLICOS DA PLATAFORMA

A plataforma possui um modelo multilateral.

## 5.1 Locatário

Produtor rural que precisa alugar uma máquina.

Principais necessidades:

- encontrar uma máquina compatível;
- verificar preço e disponibilidade;
- saber a distância;
- entender as condições de uso;
- organizar o transporte;
- reservar para o período correto;
- realizar pagamento com segurança;
- acompanhar o status da locação;
- avaliar a experiência.

## 5.2 Proprietário

Produtor rural, empresa ou prestador que possui máquinas para locação.

Principais necessidades:

- cadastrar equipamentos;
- informar características e condições;
- controlar disponibilidade;
- definir valores;
- selecionar opções logísticas;
- analisar solicitações;
- acompanhar reservas;
- receber pagamentos;
- avaliar locatários;
- rentabilizar períodos de ociosidade.

## 5.3 Prestador de serviço agrícola

Pessoa ou empresa que pode oferecer:

- máquina com operador;
- transporte;
- apoio na carga e descarga;
- manutenção;
- operação especializada.

## 5.4 Administrador da plataforma

Responsável por:

- gerenciar usuários;
- moderar anúncios;
- verificar denúncias;
- acompanhar reservas;
- tratar disputas;
- administrar categorias;
- visualizar indicadores;
- bloquear conteúdos ou usuários irregulares.

## 5.5 Parceiro logístico — evolução futura

Transportador responsável pelo deslocamento do equipamento.

No MVP, essa participação pode ser representada por uma opção logística cadastrada na reserva, sem exigir um painel completo independente.

---

# 6. PRINCÍPIOS DO PRODUTO

Toda decisão deve respeitar os seguintes princípios:

- simplicidade para usuários com diferentes níveis de familiaridade digital;
- linguagem clara e objetiva;
- transparência de preços;
- visibilidade da disponibilidade;
- segurança nas transações;
- prevenção de conflitos;
- rastreabilidade das ações;
- logística integrada desde o início;
- acessibilidade;
- funcionamento adequado em dispositivos móveis;
- possibilidade de evolução sem reconstruir toda a aplicação.

Evite linguagem excessivamente técnica na interface.

Não pressuponha que todos os produtores conhecem termos digitais como “checkout”, “dashboard”, “ticket” ou “lead”.

Prefira expressões como:

- solicitar aluguel;
- minhas reservas;
- máquinas disponíveis;
- custo de transporte;
- período de uso;
- forma de entrega;
- falar com o proprietário.

---

# 7. ESCOPO DO MVP

O MVP deve validar se usuários conseguem:

1. criar uma conta;
2. cadastrar ou localizar uma propriedade;
3. cadastrar uma máquina;
4. pesquisar máquinas;
5. aplicar filtros;
6. visualizar detalhes de um equipamento;
7. informar o período desejado;
8. escolher uma opção logística;
9. visualizar a composição do preço;
10. solicitar ou confirmar uma reserva;
11. acompanhar o status;
12. concluir a locação;
13. avaliar a outra parte.

Não desenvolver inicialmente recursos complexos que não sejam necessários para validar a proposta.

Funcionalidades preditivas, telemetria, rastreamento em tempo real, integrações bancárias completas e inteligência artificial avançada devem ser preparadas arquiteturalmente, mas podem permanecer simuladas no MVP.

---

# 8. FUNCIONALIDADES DO MVP

## 8.1 Cadastro e autenticação

Permitir:

- criação de conta;
- login;
- logout;
- recuperação de senha;
- validação básica de e-mail;
- edição do perfil;
- exclusão ou desativação da conta;
- aceite dos termos de uso e política de privacidade.

Dados básicos:

- nome completo;
- e-mail;
- telefone;
- senha;
- CPF ou CNPJ, quando aplicável;
- tipo de perfil;
- nome da propriedade ou empresa;
- cidade;
- estado;
- endereço ou localização aproximada;
- foto opcional.

Uma mesma conta poderá atuar como locatária e proprietária.

Não criar contas duplicadas para cada papel.

Utilizar permissões com base nas ações disponíveis ao usuário.

## 8.2 Cadastro de propriedade

Cada usuário poderá cadastrar uma ou mais propriedades.

Informações:

- nome da propriedade;
- endereço;
- cidade;
- estado;
- CEP;
- latitude;
- longitude;
- referência de acesso;
- observações logísticas;
- tipo de estrada;
- restrições de acesso;
- área aproximada, quando relevante.

No MVP, coordenadas podem ser simuladas ou preenchidas por um serviço de geocodificação.

A arquitetura deve permitir integração futura com mapas.

## 8.3 Cadastro de máquinas

O proprietário poderá cadastrar máquinas com:

- nome do anúncio;
- categoria;
- marca;
- modelo;
- ano;
- descrição;
- finalidade;
- culturas recomendadas;
- potência necessária, quando aplicável;
- dimensões;
- peso aproximado;
- condição do equipamento;
- necessidade de operador;
- localização;
- raio de atendimento;
- valor da diária;
- valor por hora, quando aplicável;
- valor mínimo de locação;
- caução, quando aplicável;
- imagens;
- documentos;
- regras de uso;
- disponibilidade;
- opções de transporte;
- status do anúncio.

Categorias iniciais sugeridas:

- tratores;
- colheitadeiras;
- plantadeiras;
- semeadoras;
- pulverizadores;
- arados;
- grades;
- distribuidores;
- implementos;
- equipamentos de irrigação;
- transporte agrícola;
- **tecnologia agrícola** (agricultura de precisão) — dosadores de sementes, sensores (umidade,
  solo, NDVI), piloto automático/GPS agrícola, monitores de plantio e colheita, estações
  meteorológicas, drones agrícolas;
- outros.

Tecnologia agrícola é uma categoria própria, e não um acessório de outra máquina: muitos locatários
buscam apenas o componente tecnológico (ex.: dosador de sementes, sensor), sem precisar alugar o
trator ou implemento ao qual ele normalmente é acoplado. O cadastro de um item de tecnologia segue as
mesmas regras de anúncio das demais categorias (§8.3–§8.4); campos pouco aplicáveis a itens pequenos
(peso, dimensões) permanecem opcionais.

As categorias devem ser administráveis e não ficar rigidamente gravadas no código.

## 8.4 Gestão dos anúncios

Status possíveis:

- rascunho;
- aguardando análise;
- ativo;
- indisponível;
- pausado;
- recusado;
- arquivado.

Regras:

- somente anúncios ativos aparecem na busca;
- máquinas sem disponibilidade no período selecionado não devem aparecer como disponíveis;
- anúncios incompletos não podem ser publicados;
- uma máquina não pode aceitar reservas conflitantes;
- alterações que afetem uma reserva confirmada devem ser controladas;
- a exclusão lógica deve ser preferida à remoção definitiva de registros importantes.

## 8.5 Busca de máquinas

Permitir pesquisa por:

- nome;
- categoria;
- localização;
- distância;
- período;
- preço;
- disponibilidade;
- forma de transporte;
- necessidade de operador;
- marca;
- finalidade;
- cultura;
- avaliação.

A busca principal deve solicitar:

- qual máquina ou serviço o usuário procura;
- onde será utilizada;
- data inicial;
- data final.

Resultados devem apresentar:

- imagem;
- nome;
- categoria;
- localização;
- distância estimada;
- preço inicial;
- nota média;
- disponibilidade;
- opção logística principal;
- indicação de operador, quando existente.

## 8.6 Detalhes da máquina

A página de detalhes deve apresentar:

- galeria de imagens;
- nome da máquina;
- categoria;
- marca e modelo;
- descrição;
- especificações;
- condições de uso;
- localização aproximada;
- distância até a propriedade;
- calendário de disponibilidade;
- preço;
- taxas;
- opções de transporte;
- informações sobre operador;
- avaliações;
- dados públicos do proprietário;
- ação para iniciar uma reserva.

Não exibir o endereço exato do proprietário publicamente antes de uma reserva confirmada.

## 8.7 Disponibilidade

Criar calendário de disponibilidade por máquina.

O proprietário poderá:

- liberar períodos;
- bloquear datas;
- definir indisponibilidade;
- visualizar reservas;
- configurar antecedência mínima;
- configurar duração mínima;
- configurar duração máxima.

Uma reserva deve bloquear o intervalo correspondente após confirmação.

Solicitações pendentes podem gerar um bloqueio temporário configurável.

O sistema deve impedir sobreposição de reservas confirmadas.

## 8.8 Reserva

Fluxo básico:

1. usuário seleciona a máquina;
2. informa propriedade de destino;
3. informa período;
4. sistema verifica disponibilidade;
5. usuário seleciona logística;
6. sistema calcula custos;
7. usuário revisa dados;
8. usuário envia a solicitação;
9. proprietário aceita ou recusa, quando a aprovação manual estiver habilitada;
10. pagamento é confirmado ou simulado;
11. reserva passa para o próximo status.

Tipos de confirmação:

- reserva instantânea;
- solicitação sujeita à aprovação.

O proprietário define o tipo por anúncio.

## 8.9 Estados da reserva

Utilizar uma máquina de estados clara.

Estados sugeridos:

- rascunho;
- aguardando aprovação;
- aprovada;
- recusada;
- aguardando pagamento;
- pagamento confirmado;
- transporte agendado;
- em deslocamento;
- entregue;
- em uso;
- aguardando devolução;
- devolvida;
- concluída;
- cancelada;
- em disputa.

Não permitir alterações arbitrárias de estado.

Cada transição deve possuir:

- regra;
- responsável;
- data e hora;
- histórico;
- possível notificação.

## 8.10 Logística integrada

Oferecer inicialmente três modalidades:

### Retirada pelo locatário

O locatário organiza a retirada e a devolução.

### Entrega pelo proprietário

O proprietário define:

- raio de entrega;
- preço por quilômetro;
- taxa mínima;
- disponibilidade para entrega.

### Transporte por parceiro

A plataforma apresenta uma estimativa calculada ou simulada.

No MVP, o parceiro pode ser representado por uma opção de transporte cadastrada pelo sistema.

Dados necessários:

- ponto de origem;
- destino;
- distância;
- modalidade;
- data de retirada;
- data de devolução;
- custo estimado;
- tempo estimado;
- restrições;
- observações.

## 8.11 Cálculo logístico

Criar um serviço desacoplado para cálculo logístico.

No MVP, utilizar fórmula configurável:

`custoLogistico = taxaBase + (distanciaEmKm × valorPorKm × fatorDoEquipamento)`

O fator do equipamento pode considerar:

- peso;
- dimensões;
- categoria;
- necessidade de veículo especial.

Não espalhar essa fórmula diretamente pelos componentes da interface.

Criar uma camada de serviço ou estratégia para permitir substituição futura por:

- APIs de mapas;
- tabelas de transportadoras;
- cálculo por rota;
- pedágios;
- restrições de estrada;
- transportadores parceiros.

## 8.12 Cálculo do valor da locação

Exibir uma composição transparente:

- valor do período;
- custo logístico;
- taxa de serviço;
- caução;
- descontos;
- impostos, quando aplicável;
- total.

Fórmula conceitual:

`total = locacao + logistica + taxaServico + caucao - descontos`

Todos os valores devem utilizar reais brasileiros:

- símbolo: R$;
- separador decimal: vírgula;
- padrão pt-BR.

Valores monetários devem ser armazenados de forma segura, preferencialmente em centavos inteiros ou tipo decimal apropriado.

Nunca utilizar números de ponto flutuante comuns para cálculos financeiros críticos.

## 8.13 Pagamento

Para o MVP:

- criar uma camada de pagamento simulada;
- permitir status de pagamento;
- registrar tentativa, aprovação ou falha;
- não armazenar dados completos de cartão;
- preparar interface para integração futura com gateway.

Estados sugeridos:

- pendente;
- processando;
- aprovado;
- recusado;
- estornado;
- parcialmente estornado.

A reserva só deve ser confirmada conforme a regra de pagamento definida.

## 8.14 Avaliações

Após a conclusão:

- locatário avalia máquina e proprietário;
- proprietário avalia locatário;
- notas de 1 a 5;
- comentário opcional;
- possibilidade de denúncia;
- apenas participantes de uma locação concluída podem avaliar;
- cada parte realiza uma avaliação por reserva;
- avaliações não podem ser anônimas para a plataforma.

Separar, quando possível:

- estado do equipamento;
- comunicação;
- pontualidade;
- experiência logística;
- cumprimento das condições.

## 8.15 Comunicação

No MVP, criar uma área de mensagens por reserva ou uma simulação estruturada.

Regras:

- conversas associadas a uma reserva;
- registro de data e hora;
- participantes autorizados;
- histórico preservado;
- avisos importantes destacados;
- não expor informações sensíveis desnecessariamente.

Caso o chat completo não seja implementado, criar uma seção de mensagens ou observações que preserve a possibilidade de evolução.

## 8.16 Notificações

Criar estrutura para:

- notificações dentro da plataforma;
- e-mail;
- push, futuramente;
- SMS ou WhatsApp, futuramente.

Eventos iniciais:

- solicitação recebida;
- solicitação aceita;
- solicitação recusada;
- pagamento aprovado;
- pagamento recusado;
- transporte agendado;
- início próximo;
- reserva iniciada;
- devolução próxima;
- reserva concluída;
- cancelamento;
- nova mensagem;
- nova avaliação.

## 8.17 Favoritos

Permitir que usuários salvem máquinas para consultar posteriormente.

Evitar duplicidade de favoritos para o mesmo usuário e máquina.

## 8.18 Painel do locatário

Apresentar:

- próximas reservas;
- reservas em andamento;
- histórico;
- solicitações pendentes;
- favoritos;
- mensagens;
- avaliações pendentes;
- notificações.

## 8.19 Painel do proprietário

Apresentar:

- máquinas cadastradas;
- anúncios ativos;
- calendário;
- solicitações recebidas;
- reservas futuras;
- locações em andamento;
- histórico;
- receita estimada;
- avaliações;
- alertas;
- pendências de cadastro.

## 8.20 Painel administrativo

Permitir:

- visualizar usuários;
- visualizar anúncios;
- aprovar ou recusar anúncios;
- administrar categorias;
- visualizar reservas;
- analisar denúncias;
- suspender usuários;
- moderar avaliações;
- acompanhar indicadores gerais;
- configurar taxas;
- configurar fatores logísticos.

No MVP acadêmico, o painel pode possuir acesso controlado por uma conta administradora de demonstração.

## 8.21 Monetização

A Arvum atua como marketplace puro — não possui máquinas, não emprega operadores e não mantém frota
própria. Essa escolha reduz a necessidade de investimento em ativos físicos e permite um modelo de
startup escalável: à medida que novas transações são realizadas, a receita cresce mais rapidamente
que os custos operacionais, já que os serviços continuam sendo executados pelos parceiros
cadastrados (modelo semelhante ao de marketplaces como o Airbnb).

A plataforma adota um **modelo de monetização híbrido**, com três formas de entrada:

- **Comissão sobre operações**: percentual estimado entre 8% e 12% sobre cada contratação realizada
  na plataforma, incluindo locação da máquina e, quando contratados, operador e transporte. A Arvum
  centraliza o pagamento do locatário, repassa os valores aos parceiros (proprietário, operador,
  transportadora) e retém a comissão automaticamente. É a principal fonte de receita desde a primeira
  transação e cresce conforme aumenta o número de transações.
- **Plano Premium para parceiros**: assinatura mensal estimada entre R$ 99 e R$ 199, destinada a
  proprietários de máquinas, operadores e transportadoras. Benefícios: destaque nas buscas, selo de
  parceiro verificado, redução da comissão sobre operações e acesso a relatórios de desempenho. Gera
  receita recorrente e aumenta a previsibilidade financeira da plataforma.
- **Anúncios patrocinados**: parceiros podem promover seus anúncios nas primeiras posições da busca,
  sempre identificados como patrocinados. Amplia a visibilidade dos parceiros e representa receita
  adicional sem aumento significativo dos custos operacionais.

Além dessas três entradas, o **Arvum Suporte de Operação** é um serviço opcional contratado durante
a reserva, oferecendo atendimento prioritário e mediação de imprevistos durante a locação. É um
serviço de suporte operacional — não um seguro — e não contempla cobertura financeira contra danos.

**Inserção na jornada do usuário:**

- Na busca: parceiros Premium aparecem em destaque, com o selo de parceiro verificado; anúncios
  patrocinados ocupam posições privilegiadas, sempre identificados de forma transparente, preservando
  a confiança nos resultados orgânicos.
- Durante a reserva: o locatário escolhe a máquina e, se desejar, adiciona operador, transporte e o
  Arvum Suporte de Operação; antes da confirmação, é apresentado um resumo completo detalhando todos
  os serviços e valores.
- Na confirmação da contratação: após o pagamento, a plataforma realiza automaticamente a divisão dos
  valores entre proprietário, operador, transportadora e a comissão da Arvum, eliminando processos
  manuais.

A monetização deve ocorrer apenas quando há geração de valor para o usuário, mantendo uma experiência
transparente — nunca cobrança sem contrapartida clara ou taxa oculta (ver também §32).

No longo prazo, como a Arvum não precisa adquirir máquinas nem manter equipes proporcionais ao
volume de locações, seus custos crescem mais lentamente que a receita: o ponto de equilíbrio é
alcançado quando a receita de comissões supera os custos operacionais (plataforma, processamento de
pagamentos, hospedagem, segurança da informação, atendimento e marketing de aquisição). Com o
crescimento da base de usuários, as receitas de assinaturas Premium e anúncios patrocinados passam a
representar uma parcela cada vez maior do faturamento, elevando a margem sem exigir investimento
estrutural proporcional.

---

# 9. REGRAS DE NEGÓCIO

## 9.1 Usuários

- O e-mail deve ser único.
- CPF ou CNPJ devem ser únicos quando exigidos.
- Uma conta pode alugar e disponibilizar máquinas.
- Usuários suspensos não podem criar novas reservas ou anúncios.
- Dados sensíveis devem possuir acesso restrito.
- A exclusão da conta não deve destruir o histórico financeiro ou de reservas quando houver obrigação de retenção.

## 9.2 Máquinas

- Cada máquina pertence a um proprietário.
- Uma máquina pode ter várias imagens.
- Uma máquina pertence a uma categoria principal.
- Uma máquina pode possuir diferentes períodos disponíveis.
- Uma máquina não pode estar simultaneamente disponível e arquivada.
- Uma máquina com reserva ativa não pode ser removida definitivamente.
- Mudanças relevantes devem gerar registro no histórico.

## 9.3 Reservas

- A data final deve ser posterior à data inicial.
- Não aceitar datas passadas.
- Respeitar duração mínima e máxima.
- Não permitir conflito com reservas confirmadas.
- Recalcular valores quando período, endereço ou logística forem alterados.
- Preservar um retrato dos preços no momento da confirmação.
- Alterações futuras no anúncio não podem mudar retroativamente o valor de uma reserva confirmada.
- Registrar quem executou cada ação.

## 9.4 Cancelamento

Criar política configurável.

Modelo inicial recomendado:

- antes da aprovação: cancelamento sem cobrança;
- depois da aprovação e antes do pagamento: cancelamento sem cobrança;
- após pagamento: cobrança ou estorno conforme antecedência;
- cancelamento pelo proprietário: estorno integral ao locatário;
- situações excepcionais: encaminhar para disputa.

Não deixar percentuais fixos espalhados pelo código.

Centralizar políticas em configurações ou serviço próprio.

## 9.5 Avaliações

- Somente após reserva concluída.
- Uma avaliação por participante e por reserva.
- Não permitir que o usuário avalie a si mesmo.
- Comentários denunciados podem ser ocultados pela moderação.
- A nota média deve ser recalculada de maneira consistente.

## 9.6 Logística

- Endereços de origem e destino são obrigatórios para entrega.
- O custo deve ser recalculado quando o destino mudar.
- O sistema deve informar que valores podem ser estimativas quando não houver integração real.
- Restrições de transporte devem ser apresentadas antes da confirmação.

## 9.7 Monetização

- A comissão (8%–12%) é retida automaticamente no momento da divisão do pagamento entre as partes —
  nunca cobrada como um valor separado apresentado ao locatário.
- O percentual de comissão pode ser reduzido para parceiros com Plano Premium ativo; a regra de
  redução deve ficar centralizada em serviço próprio, nunca espalhada pelo fluxo de pagamento.
- Anúncios patrocinados devem sempre exibir identificação visual de "patrocinado" — nunca podem ser
  apresentados como resultado orgânico da busca.
- O Arvum Suporte de Operação é contratado por reserva (não por assinatura) e não é seguro — a
  interface não pode sugerir cobertura financeira contra danos.
- A assinatura Premium é mensal e recorrente, e pode ser cancelada pelo parceiro a qualquer momento;
  o cancelamento não afeta reservas já em andamento nem reduz retroativamente benefícios já
  utilizados no período pago.

---

# 10. FLUXOS PRINCIPAIS

## 10.1 Fluxo de cadastro

1. Acessar criação de conta.
2. Informar dados básicos.
3. Aceitar termos.
4. Confirmar cadastro.
5. Criar perfil.
6. Cadastrar uma propriedade ou pular temporariamente.
7. Acessar a página inicial.

## 10.2 Fluxo para encontrar uma máquina

1. Informar equipamento desejado.
2. Selecionar localização ou propriedade.
3. Selecionar período.
4. Consultar resultados.
5. Aplicar filtros.
6. Abrir detalhes.
7. Conferir especificações e avaliações.
8. Iniciar solicitação.

## 10.3 Fluxo de reserva

1. Selecionar período.
2. Selecionar propriedade de destino.
3. Escolher modalidade logística.
4. Visualizar estimativa.
5. Adicionar observações.
6. Revisar condições.
7. Confirmar solicitação.
8. Aguardar aprovação ou seguir para pagamento.
9. Receber confirmação.
10. Acompanhar status.

## 10.4 Fluxo para anunciar uma máquina

1. Acessar “Anunciar máquina”.
2. Preencher informações básicas.
3. Selecionar categoria.
4. Inserir especificações.
5. Adicionar imagens.
6. Definir localização.
7. Definir preço.
8. Definir disponibilidade.
9. Definir logística.
10. Revisar anúncio.
11. Enviar para publicação.
12. Receber confirmação ou solicitação de ajustes.

## 10.5 Fluxo de conclusão

1. Confirmar devolução.
2. Registrar possíveis ocorrências.
3. Encerrar reserva.
4. Liberar pagamento ao proprietário, quando aplicável.
5. Solicitar avaliações.
6. Atualizar histórico.

---

# 11. EXPERIÊNCIA DO USUÁRIO

A interface deve ser adequada para pessoas com diferentes níveis de alfabetização digital.

## 11.1 Diretrizes

- Priorizar dispositivos móveis.
- Utilizar textos diretos.
- Evitar telas excessivamente carregadas.
- Dividir formulários longos em etapas.
- Mostrar progresso.
- Salvar rascunhos.
- Exibir exemplos nos campos.
- Aplicar máscaras.
- Validar enquanto o usuário preenche.
- Explicar erros e como corrigi-los.
- Não depender apenas de cores para comunicar estados.
- Manter ações principais claramente identificadas.
- Confirmar ações destrutivas.
- Exibir estados vazios úteis.
- Exibir carregamento.
- Exibir feedback após cada ação importante.

## 11.2 Navegação sugerida

Em dispositivos móveis:

- Início;
- Buscar;
- Reservas;
- Anúncios ou Minhas máquinas;
- Perfil.

Em desktop, usar navegação equivalente adaptada ao espaço disponível.

Não duplicar regras de navegação entre versões mobile e desktop.

## 11.3 Página inicial

Deve incluir:

- campo de busca;
- seleção de localização;
- seleção de período;
- categorias;
- máquinas próximas;
- máquinas em destaque;
- explicação resumida de funcionamento;
- ação para anunciar uma máquina.

## 11.4 Formulários

Utilizar:

- labels sempre visíveis;
- exemplos;
- mensagens de ajuda;
- indicação de campos obrigatórios;
- agrupamento lógico;
- validação acessível;
- resumo antes da publicação.

Não utilizar placeholder como única identificação do campo.

## 11.5 Feedbacks

Estados necessários:

- carregando;
- sucesso;
- erro;
- alerta;
- informação;
- vazio;
- indisponível;
- sem conexão, quando aplicável.

Mensagens de erro devem responder:

- o que aconteceu;
- por que pode ter acontecido;
- o que o usuário deve fazer.

---

# 12. DESIGN SYSTEM

Criar uma base visual reutilizável.

## 12.1 Tokens

Centralizar:

- cores;
- tipografia;
- espaçamentos;
- bordas;
- sombras;
- raios;
- tamanhos;
- breakpoints;
- elevação;
- duração de animações.

Não inserir valores visuais arbitrários em cada componente.

## 12.2 Componentes mínimos

- Button;
- IconButton;
- Input;
- Textarea;
- Select;
- Checkbox;
- Radio;
- DatePicker;
- DateRangePicker;
- SearchField;
- CurrencyInput;
- AddressInput;
- Card;
- MachineCard;
- BookingCard;
- StatusBadge;
- Avatar;
- Rating;
- Modal;
- Drawer;
- Toast;
- Alert;
- Tabs;
- Accordion;
- Breadcrumb;
- Pagination;
- EmptyState;
- Skeleton;
- Stepper;
- FileUploader;
- ImageGallery;
- Calendar;
- PriceBreakdown;
- LogisticsOption;
- ConfirmationDialog.

## 12.3 Estados dos componentes

Todo componente interativo deve considerar:

- padrão;
- hover;
- focus;
- active;
- disabled;
- loading;
- error;
- success, quando aplicável.

## 12.4 Identidade visual

A aparência deve comunicar:

- confiança;
- proximidade;
- tecnologia;
- agronegócio;
- praticidade;
- segurança.

Evitar estereótipos visuais excessivos ou uma interface que pareça antiga apenas por ser voltada ao setor rural.

---

# 13. ACESSIBILIDADE

Seguir WCAG 2.2 nível AA sempre que possível.

Garantir:

- contraste suficiente;
- navegação por teclado;
- foco visível;
- labels associados aos campos;
- textos alternativos em imagens;
- hierarquia correta de títulos;
- áreas de toque adequadas;
- mensagens de erro anunciáveis;
- não depender apenas de cor;
- suporte a leitores de tela;
- respeito à preferência de redução de movimento.

Utilizar HTML semântico antes de recorrer a atributos ARIA.

---

# 14. RESPONSIVIDADE

Adotar estratégia mobile-first.

A aplicação deve funcionar em:

- smartphones;
- tablets;
- notebooks;
- desktops.

Não criar uma aplicação móvel separada sem necessidade.

Componentes e layouts devem se adaptar a diferentes larguras.

Testar ao menos:

- 320 px;
- 375 px;
- 768 px;
- 1024 px;
- 1440 px.

---

# 15. ARQUITETURA

Antes de implementar:

1. Analise o repositório.
2. Identifique stack, padrões e dependências.
3. Preserve o que estiver consistente.
4. Informe problemas arquiteturais.
5. Proponha mudanças incrementais.
6. Não reescreva o projeto inteiro sem justificativa.

Caso o projeto ainda não possua stack definida, utilize uma arquitetura moderna baseada em TypeScript.

Sugestão:

## Front-end

- Next.js com App Router ou React com Vite;
- TypeScript;
- componentes reutilizáveis;
- React Hook Form;
- Zod para validação;
- TanStack Query para estado assíncrono;
- solução de estilos compatível com o projeto;
- Storybook, quando viável.

## Back-end

Escolher uma das abordagens:

- API com Next.js;
- Node.js com NestJS;
- Node.js com Express estruturado.

Preferir NestJS caso o back-end seja independente e o projeto necessite de módulos mais robustos.

## Banco de dados

- PostgreSQL;
- Prisma ORM ou tecnologia equivalente;
- migrations versionadas;
- seed para demonstração.

## Autenticação

- solução segura baseada em sessão ou tokens;
- senhas com hash forte;
- renovação e expiração controladas;
- autorização no servidor;
- proteção de rotas.

## Armazenamento de imagens

No MVP:

- armazenamento local controlado;
- serviço simulado;
- ou provedor externo configurável.

Criar abstração para futura troca de provedor.

## Mapas e geolocalização

Criar interfaces de serviço para:

- geocodificação;
- cálculo de distância;
- cálculo de rota.

No MVP, permitir dados simulados.

Não acoplar regras de negócio diretamente a um fornecedor específico.

---

# 16. ORGANIZAÇÃO DO CÓDIGO

Organizar por domínio ou funcionalidade.

Exemplo:

```text
src/
  app/
  components/
    ui/
    shared/
  features/
    authentication/
    users/
    properties/
    machines/
    search/
    bookings/
    logistics/
    payments/
    reviews/
    notifications/
    administration/
  services/
  hooks/
  schemas/
  types/
  utils/
  config/
  lib/
```

No back-end:

```text
src/
  modules/
    auth/
    users/
    properties/
    machines/
    availability/
    bookings/
    logistics/
    payments/
    reviews/
    notifications/
    admin/
  common/
  config/
  database/
```

Evitar:

- componentes gigantes;
- lógica de negócio dentro de componentes visuais;
- chamadas de API espalhadas;
- tipos duplicados;
- strings de status repetidas;
- valores financeiros em formato inseguro;
- regras importantes apenas no front-end;
- arquivos genéricos chamados `utils` com responsabilidades excessivas.

---

# 17. MODELO DE DADOS INICIAL

Criar entidades equivalentes às seguintes.

## User

- id;
- name;
- email;
- passwordHash;
- phone;
- documentType;
- documentNumber;
- avatarUrl;
- status;
- createdAt;
- updatedAt;
- deletedAt.

## Property

- id;
- ownerId;
- name;
- addressLine;
- number;
- complement;
- district;
- city;
- state;
- postalCode;
- latitude;
- longitude;
- accessNotes;
- roadType;
- createdAt;
- updatedAt.

## MachineCategory

- id;
- name;
- slug;
- description;
- icon;
- active;
- createdAt;
- updatedAt.

## Machine

- id;
- ownerId;
- propertyId;
- categoryId;
- title;
- slug;
- brand;
- model;
- manufactureYear;
- description;
- purpose;
- condition;
- weight;
- width;
- height;
- length;
- requiresOperator;
- dailyPriceInCents;
- hourlyPriceInCents;
- minimumPriceInCents;
- depositInCents;
- minimumRentalDays;
- maximumRentalDays;
- instantBooking;
- deliveryRadiusKm;
- status;
- createdAt;
- updatedAt;
- deletedAt.

## MachineImage

- id;
- machineId;
- url;
- altText;
- position;
- createdAt.

## MachineAvailability

- id;
- machineId;
- startDate;
- endDate;
- type;
- reason;
- createdAt.

## Booking

- id;
- machineId;
- renterId;
- destinationPropertyId;
- startDate;
- endDate;
- status;
- rentalValueInCents;
- logisticsValueInCents;
- serviceFeeInCents;
- depositInCents;
- discountInCents;
- totalValueInCents;
- logisticsMode;
- distanceKm;
- notes;
- cancellationReason;
- createdAt;
- updatedAt.

## BookingStatusHistory

- id;
- bookingId;
- previousStatus;
- nextStatus;
- changedBy;
- notes;
- createdAt.

## LogisticsQuote

- id;
- bookingId;
- originPropertyId;
- destinationPropertyId;
- mode;
- distanceKm;
- durationMinutes;
- baseFeeInCents;
- pricePerKmInCents;
- equipmentFactor;
- totalInCents;
- status;
- expiresAt;
- createdAt.

## Payment

- id;
- bookingId;
- provider;
- externalReference;
- amountInCents;
- status;
- paymentMethod;
- paidAt;
- createdAt;
- updatedAt.

## Review

- id;
- bookingId;
- authorId;
- targetUserId;
- machineId;
- rating;
- machineConditionRating;
- communicationRating;
- punctualityRating;
- logisticsRating;
- comment;
- status;
- createdAt;
- updatedAt.

## Favorite

- id;
- userId;
- machineId;
- createdAt.

## Subscription (Plano Premium — §8.21)

- id;
- partnerId;
- plan;
- status;
- priceInCents;
- startedAt;
- currentPeriodEnd;
- canceledAt;
- createdAt;
- updatedAt.

## SponsoredListing (anúncio patrocinado — §8.21)

- id;
- machineId;
- ownerId;
- status;
- startAt;
- endAt;
- priceInCents;
- createdAt;
- updatedAt.

A comissão retida por reserva (§8.21/§9.7) já é representada por `Booking.serviceFeeInCents`
(§8.12) — as duas entidades acima cobrem apenas as fontes de receita recorrente (assinatura e
anúncios), que ainda não existem no modelo de dados.

Adicionar restrição única para:

- e-mail;
- documento, quando aplicável;
- favorito por usuário e máquina;
- avaliação por autor e reserva.

Criar índices para:

- categoria;
- localização;
- status;
- período;
- proprietário;
- locatário;
- datas de reserva.

---

# 18. API

Criar uma API consistente, versionável e documentada.

Exemplos de domínios:

```text
/api/v1/auth
/api/v1/users
/api/v1/properties
/api/v1/machines
/api/v1/categories
/api/v1/search
/api/v1/bookings
/api/v1/logistics
/api/v1/payments
/api/v1/reviews
/api/v1/favorites
/api/v1/notifications
/api/v1/admin
```

Cada endpoint deve possuir:

- autenticação, quando necessária;
- autorização;
- validação;
- tratamento de erros;
- códigos HTTP adequados;
- resposta consistente;
- paginação;
- filtros;
- documentação.

Formato de erro sugerido:

```json
{
  "error": {
    "code": "MACHINE_UNAVAILABLE",
    "message": "A máquina não está disponível no período selecionado.",
    "details": [],
    "requestId": "identificador-da-requisicao"
  }
}
```

Não expor:

- stack traces;
- detalhes internos;
- consultas;
- hashes;
- tokens;
- dados sensíveis.

---

# 19. SEGURANÇA E PRIVACIDADE

Aplicar:

- hash seguro de senhas;
- validação no servidor;
- sanitização;
- proteção contra injeção;
- proteção contra XSS;
- proteção contra CSRF quando aplicável;
- rate limiting;
- controle de acesso;
- gerenciamento seguro de sessões;
- variáveis de ambiente;
- logs sem informações sensíveis;
- cabeçalhos de segurança;
- validação de uploads;
- restrição de tipos e tamanhos de arquivos.

Considerar princípios da LGPD:

- finalidade;
- necessidade;
- transparência;
- segurança;
- controle do titular;
- minimização de dados.

Criar:

- política de privacidade;
- termos de uso;
- consentimentos necessários;
- mecanismo de solicitação de exclusão;
- registro de aceite.

Nunca incluir segredos no repositório.

Criar `.env.example` sem credenciais reais.

---

# 20. QUALIDADE E TESTES

## 20.1 Testes unitários

Cobrir:

- cálculo de período;
- conflito de disponibilidade;
- cálculo da locação;
- cálculo logístico;
- transições de status;
- políticas de cancelamento;
- cálculo de avaliações;
- validações.

## 20.2 Testes de integração

Cobrir:

- criação de usuário;
- autenticação;
- cadastro de máquina;
- busca;
- criação de reserva;
- aprovação;
- pagamento simulado;
- conclusão;
- avaliação.

## 20.3 Testes de interface

Cobrir:

- formulários;
- filtros;
- estados vazios;
- mensagens de erro;
- responsividade;
- acessibilidade;
- navegação por teclado.

## 20.4 Testes end-to-end

Cenários obrigatórios:

### Cenário 1 — Locatário

1. Criar conta.
2. Cadastrar propriedade.
3. Buscar trator.
4. Selecionar período.
5. Escolher entrega.
6. Solicitar reserva.
7. Realizar pagamento simulado.
8. Acompanhar status.
9. Concluir.
10. Avaliar.

### Cenário 2 — Proprietário

1. Criar conta.
2. Cadastrar propriedade.
3. Cadastrar máquina.
4. Definir preço e disponibilidade.
5. Publicar.
6. Receber solicitação.
7. Aceitar.
8. Atualizar status.
9. Confirmar devolução.
10. Avaliar o locatário.

### Cenário 3 — Conflito

1. Criar uma reserva confirmada.
2. Tentar reservar a mesma máquina em datas conflitantes.
3. Impedir a nova reserva.
4. Apresentar mensagem clara.

### Cenário 4 — Cancelamento

1. Criar reserva.
2. Confirmar pagamento.
3. Solicitar cancelamento.
4. Aplicar a política correta.
5. Atualizar histórico e pagamento.

---

# 21. DADOS DE DEMONSTRAÇÃO

Criar seed com dados realistas, porém fictícios.

Incluir:

- conta administradora;
- pelo menos 5 proprietários;
- pelo menos 8 locatários;
- pelo menos 15 máquinas;
- diferentes categorias;
- máquinas em diferentes cidades e estados;
- avaliações;
- favoritos;
- reservas em diferentes estados;
- opções logísticas;
- períodos indisponíveis;
- parceiros com Plano Premium ativo (§8.21);
- anúncios patrocinados ativos (§8.21).

Utilizar cidades e contextos brasileiros.

Não usar dados pessoais reais.

Criar credenciais de demonstração apenas para ambiente de desenvolvimento e documentá-las no README.

---

# 22. OBSERVABILIDADE E MANUTENÇÃO

Criar:

- logs estruturados;
- identificador por requisição;
- registro de erros;
- histórico de mudanças de status;
- tratamento centralizado de exceções;
- health check;
- documentação de variáveis de ambiente.

Evitar registrar:

- senhas;
- tokens;
- documentos completos;
- dados de pagamento;
- informações pessoais desnecessárias.

---

# 23. DESEMPENHO

Aplicar:

- paginação;
- carregamento progressivo;
- otimização de imagens;
- cache onde fizer sentido;
- consultas indexadas;
- prevenção de requisições duplicadas;
- componentes carregados sob demanda;
- estados de carregamento;
- limitação de resultados.

A busca deve continuar utilizável com crescimento no número de anúncios.

---

# 24. ESCALABILIDADE

Preparar o sistema para futuras funcionalidades:

- inteligência de dados;
- recomendação de equipamentos;
- previsão de demanda;
- sazonalidade por cultura;
- calendário agrícola;
- telemetria;
- rastreamento;
- manutenção preventiva;
- seguro;
- verificação documental;
- assinatura digital;
- leilão de disponibilidade;
- planos para proprietários;
- cupons;
- fidelidade;
- parceiros logísticos;
- múltiplos idiomas;
- múltiplas moedas;
- aplicativo nativo;
- operação offline;
- integração com cooperativas;
- aluguel de máquina com operador;
- serviços agrícolas completos.

Não implementar tudo no MVP.

Criar limites claros entre módulos para permitir evolução.

---

# 25. FUNCIONALIDADES FORA DO MVP

Não desenvolver inicialmente, a menos que já existam no projeto:

- rastreamento GPS em tempo real;
- contratação automática de seguro;
- inteligência artificial preditiva completa;
- machine learning;
- telemetria de máquinas;
- integração fiscal real;
- pagamento real em produção;
- assinatura eletrônica com validade jurídica;
- cálculo logístico nacional completo;
- aplicativo mobile nativo;
- sistema complexo de leilão;
- manutenção preditiva;
- múltiplas moedas;
- múltiplos países.

Esses itens devem aparecer apenas no roadmap ou em interfaces abstratas quando necessárias.

---

# 26. ROADMAP SUGERIDO

## Fase 1 — Fundação

- arquitetura;
- design system;
- banco;
- autenticação;
- usuários;
- propriedades;
- categorias.

## Fase 2 — Oferta

- cadastro de máquinas;
- imagens;
- disponibilidade;
- gerenciamento de anúncios.

## Fase 3 — Descoberta

- busca;
- filtros;
- detalhes;
- favoritos;
- localização.

## Fase 4 — Transação

- reservas;
- cálculo de valores;
- logística;
- pagamento simulado;
- histórico de status.

## Fase 5 — Confiança

- avaliações;
- notificações;
- mensagens;
- moderação.

## Fase 6 — Administração e qualidade

- painel administrativo;
- indicadores;
- testes;
- acessibilidade;
- segurança;
- documentação;
- deploy.

## Fase 7 — Monetização avançada (§8.21/§9.7)

- comissão sobre operações (8%–12%, já habilitada via `taxaServico`/`serviceFeeInCents` na Fase 4);
- Arvum Suporte de Operação (add-on opcional na reserva);
- Plano Premium para parceiros (assinatura mensal, destaque, selo verificado, redução de comissão,
  relatórios de desempenho);
- anúncios patrocinados (posições de destaque na busca, sempre identificados).

---

# 27. FORMA DE TRABALHO DA IA

Antes de alterar arquivos, execute esta sequência:

1. Leia o README.
2. Analise a árvore do projeto.
3. Identifique dependências.
4. Verifique scripts disponíveis.
5. Identifique padrões de componentes.
6. Identifique configuração de estilos.
7. Analise banco, migrations e variáveis de ambiente.
8. Execute os testes existentes.
9. Execute lint e verificação de tipos.
10. Liste problemas e oportunidades.
11. Proponha um plano incremental.
12. Comece pela menor etapa funcional completa.

Não altere dezenas de arquivos sem explicar a necessidade.

Não remova código funcional sem justificativa.

Não instale bibliotecas para resolver problemas simples que podem ser resolvidos com a stack existente.

Não crie implementações falsas apresentadas como concluídas.

Quando uma integração externa não estiver disponível:

- crie uma interface;
- crie um adaptador simulado;
- documente a limitação;
- permita futura substituição.

---

# 28. PADRÃO PARA CADA ENTREGA

Para cada etapa, apresente:

## Objetivo

O que será implementado.

## Diagnóstico atual

O que já existe e o que está faltando.

## Arquivos afetados

Lista de arquivos criados ou alterados.

## Regras consideradas

Regras de negócio relacionadas.

## Implementação

Código completo e funcional.

## Testes

Como a funcionalidade foi validada.

## Critérios de aceite

Condições objetivas para considerar a etapa concluída.

## Pendências

Limitações ou decisões que ainda precisam ser tomadas.

## Como executar

Comandos necessários.

---

# 29. CRITÉRIOS GERAIS DE ACEITE

O projeto será considerado funcional quando:

- um novo usuário conseguir se cadastrar;
- o proprietário conseguir cadastrar uma máquina;
- o anúncio puder ser publicado;
- o locatário conseguir encontrar a máquina;
- a disponibilidade for respeitada;
- o valor for calculado;
- uma modalidade logística puder ser selecionada;
- a reserva puder ser criada;
- o proprietário puder aprovar ou recusar;
- o pagamento simulado puder ser registrado;
- o status puder ser acompanhado;
- a reserva puder ser concluída;
- os participantes puderem se avaliar;
- a interface funcionar em dispositivos móveis e desktop;
- as principais regras existirem no servidor;
- os fluxos críticos possuírem testes;
- o projeto possuir documentação de execução.

---

# 30. DOCUMENTAÇÃO OBRIGATÓRIA

Criar ou atualizar:

- `README.md`;
- instruções de instalação;
- requisitos;
- arquitetura;
- estrutura de pastas;
- variáveis de ambiente;
- migrations;
- seed;
- credenciais de demonstração;
- comandos;
- decisões técnicas;
- regras de negócio;
- limitações;
- roadmap;
- instruções de testes;
- instruções de deploy.

Também criar, quando apropriado:

- `ARCHITECTURE.md`;
- `BUSINESS_RULES.md`;
- `API.md`;
- `CONTRIBUTING.md`;
- `CHANGELOG.md`.

---

# 31. PRIMEIRA RESPOSTA ESPERADA DA IA

Não comece imediatamente a escrever toda a aplicação.

Na primeira resposta:

1. apresente um diagnóstico do repositório;
2. informe qual stack foi encontrada;
3. descreva o que já está implementado;
4. identifique problemas técnicos;
5. apresente a arquitetura recomendada;
6. divida o desenvolvimento em etapas;
7. liste as decisões assumidas;
8. informe qual será a primeira etapa;
9. defina critérios de aceite;
10. em seguida, implemente a primeira etapa funcional.

Caso o repositório esteja vazio, inicialize o projeto de forma organizada, crie a fundação técnica e documente as escolhas.

---

# 32. RESTRIÇÕES IMPORTANTES

- Não utilizar dados reais de produtores.
- Não armazenar senhas sem hash.
- Não colocar segredos no código.
- Não depender somente do front-end para validar regras.
- Não permitir reservas conflitantes.
- Não esconder taxas do usuário.
- Não expor endereço exato publicamente.
- Não usar valores monetários de maneira insegura.
- Não criar componentes duplicados.
- Não concentrar toda a aplicação em poucos arquivos.
- Não implementar integrações externas sem tratamento de falhas.
- Não apresentar dados simulados como dados reais.
- Não ignorar acessibilidade.
- Não comprometer a versão mobile.
- Não utilizar textos genéricos como “erro inesperado” quando for possível explicar o problema.
- Não implementar funcionalidades futuras antes do fluxo principal do MVP.

---

# 33. INSTRUÇÃO FINAL

Desenvolva o produto gradualmente, entregando fluxos completos e testáveis.

Priorize primeiro o caminho principal:

**cadastro → propriedade → cadastro da máquina → busca → detalhes → logística → reserva → pagamento simulado → acompanhamento → conclusão → avaliação.**

Sempre preserve:

- clareza;
- modularidade;
- segurança;
- usabilidade;
- acessibilidade;
- consistência visual;
- documentação;
- testes;
- possibilidade de evolução.

Quando houver uma decisão não especificada, escolha a alternativa mais simples para o MVP, registre a decisão e implemente de modo que ela possa ser substituída no futuro sem uma grande reestruturação.
