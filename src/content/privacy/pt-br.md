---
title: Política de Privacidade
updated: 2026-10-17
---

O Vital Courier exporta seus dados do Apple Saúde para uma pasta que você escolhe. Ele não tem conta nem servidor, e não envia nada ao desenvolvedor nem a mais ninguém.

## O que o Vital Courier lê

Com a sua permissão, o Vital Courier lê dados de saúde do Apple Saúde. Quando o iOS perguntar, você escolhe quais tipos de dados liberar e quanto dos seus dados antigos ele pode ler, e o Vital Courier lê só o que você liberar. Ele pede só acesso de leitura e nunca grava nem altera seus dados do Saúde.

Se você ligar o Monitoramento do ciclo nos Ajustes do aplicativo, ele também lê dois tipos de dados do ciclo:

- Fluxo menstrual, incluindo se você marcou um dia como início da menstruação
- Sangramento

O Monitoramento do ciclo fica desligado até você ligá-lo.

De cada registro, ele obtém o identificador, o horário de início e de fim, o valor, o nome do aplicativo ou dispositivo que fez o registro, o nome do aparelho quando o Saúde tem essa informação e qualquer detalhe extra que o Saúde guarda junto com o registro (os metadados, como a indicação de que um valor foi digitado à mão).

## Leitura em segundo plano

O Vital Courier pede ao iOS que o acorde quando chegam dados novos no Saúde, para que as exportações fiquem em dia sem você abrir o aplicativo. Ele pode ler e exportar dados enquanto roda em segundo plano. Também pode agendar uma execução em segundo plano, com pelo menos uma hora de intervalo, para tentar de novo uma exportação que não terminou.

Se os dados do Saúde estiverem indisponíveis enquanto o iPhone está bloqueado, o Vital Courier pula essa leitura e tenta de novo na próxima oportunidade: quando novos dados do Saúde o acordarem, na próxima execução em segundo plano ou quando você abrir o aplicativo.

## Para onde vão seus dados

O Vital Courier grava os arquivos exportados na pasta que você escolhe no aplicativo Arquivos. Pode ser No Meu iPhone, o iCloud Drive, o Dropbox ou qualquer outro serviço de armazenamento que apareça no Arquivos. Os arquivos contêm os campos listados acima.

Depois que os arquivos estão nessa pasta, o serviço de armazenamento cuida deles conforme os próprios termos e a própria política de privacidade. Arquivos no iCloud Drive são sincronizados pelo iCloud, por exemplo, e arquivos no Dropbox, pelo Dropbox. O Vital Courier nunca apaga arquivos que já exportou.

## O que fica no seu iPhone

Além dos arquivos exportados, o Vital Courier guarda só o que precisa para funcionar, e só no seu iPhone, no próprio armazenamento do aplicativo:

- Uma cópia local protegida dos dados que ele leu do Saúde, inclusive os que ainda aguardam exportação, com os mesmos campos da exportação mais o fuso horário de cada registro e o dia e o mês a que ele pertence
- Outros dados de funcionamento derivados dos seus dados do Saúde, como os valores diários e quais dias ainda precisam ser exportados
- Suas configurações
- O controle de quais registros já foram exportados
- Um histórico das exportações
- A permissão salva para gravar na pasta escolhida

O Vital Courier não usa o iCloud nem o CloudKit para guardar ou sincronizar nada disso. Ele marca a cópia local dos seus dados do Saúde, o controle das exportações, o histórico de exportações e outros dados de funcionamento para ficarem fora dos backups do iPhone. A Apple trata isso como um pedido e não garante a exclusão. A pasta escolhida, outras configurações e as mensagens pendentes de erro de configuração ou de proteção de arquivos podem entrar em um backup do iPhone.

## Como guardar e apagar dados

Nos Ajustes do aplicativo, Apagar cópia local apaga a cópia local dos seus registros do Saúde. Isso não mexe nos seus dados do Apple Saúde nem nos arquivos já exportados, e suas configurações, o histórico de exportações e a pasta escolhida continuam. A próxima execução que puder ler os dados do Saúde lê de novo os tipos de dados que você ligou.

Para apagar arquivos exportados, apague-os no aplicativo Arquivos ou no seu serviço de armazenamento.

Apagar o Vital Courier do iPhone apaga tudo o que ele guarda no próprio armazenamento, inclusive a cópia local dos seus dados do Saúde. Seus dados do Apple Saúde e os arquivos já exportados continuam onde estão, assim como o que já estiver salvo em um backup do iPhone.

## Como desligar o acesso

Você pode desligar o acesso do Vital Courier a qualquer um dos tipos de dados que você liberou, ou a todos, quando quiser:

- No aplicativo Saúde: toque na sua foto de perfil, depois em Apps e depois em Vital Courier
- Nos Ajustes do iPhone: Saúde, depois Acesso a Dados e Dispositivos, depois Vital Courier

Desligar o Monitoramento do ciclo nos Ajustes do aplicativo faz o Vital Courier parar de ler Fluxo menstrual e Sangramento. Os arquivos já exportados e a cópia local continuam. Apagar cópia local apaga a cópia local.

Para parar as exportações para uma pasta, escolha outra pasta no Vital Courier. Se você apagar a pasta no aplicativo Arquivos, o Vital Courier não consegue mais gravar nela e não a recria.

## Contribuições

As contribuições são opcionais e passam pela compra dentro do app da Apple (In-App Purchase). O Vital Courier não recebe nenhuma informação sobre quem contribui. O aplicativo guarda só uma anotação no seu iPhone de que você contribuiu, para mostrar um agradecimento.

## O que nunca é coletado

O aplicativo Vital Courier não tem conta nem login. Ele não tem análise de uso, publicidade, rastreamento nem relatórios de falhas, e não faz nenhuma conexão de rede por conta própria. Seus dados do Saúde nunca chegam ao desenvolvedor.

## Este site

Este site, vitalcourier.app, usa o Cloudflare Web Analytics para contar visitas. Quando você abre uma página no navegador, a Cloudflare acrescenta um pequeno script que envia à Cloudflare um relatório de como a página carregou. O relatório inclui o endereço da página, o endereço da página que trouxe você até aqui, se o seu navegador o informar, as versões do seu navegador e do sistema operacional, quanto tempo a página levou para carregar, quanta memória os scripts da página usaram e um identificador aleatório daquele carregamento. Como em qualquer acesso pela web, a Cloudflare também vê o seu endereço IP, que usa para saber de qual país veio a visita.

O site não grava cookies nem guarda nada no seu navegador. Segundo a Cloudflare, o Web Analytics não coleta nem usa dados pessoais dos visitantes e não rastreia pessoas individualmente entre sites. A Cloudflare guarda todos os relatórios por sete dias e, depois, só uma amostra de cerca de um em cada dez. O desenvolvedor vê relatórios resumidos no painel da Cloudflare, como visualizações de página por país, página, site de origem, tipo de dispositivo, navegador e sistema operacional, dos últimos seis meses. Bloqueadores de anúncios costumam bloquear o script, e a página funciona igual sem ele. A Cloudflare também hospeda este site, então trata todos os acessos a ele, não só esses relatórios, conforme a própria [política de privacidade](https://www.cloudflare.com/policies/privacy/).

Os Workers Logs e os Workers Traces da Cloudflare também estão ligados para este site. Eles só registram acessos que executam código nos servidores da Cloudflare, e este site é feito só de arquivos estáticos, então hoje não registram nada. Se o site passar a executar esse tipo de código, esses registros podem incluir o endereço da página, o seu endereço IP, a localização aproximada que a Cloudflare deduz dele (como país, região e cidade), o seu provedor de internet, o identificador do seu navegador (user agent), a página que trouxe você até aqui e as suas preferências de idioma. A Cloudflare guarda esses registros por no máximo sete dias.

## Crianças

O Vital Courier não é voltado para crianças. O aplicativo não coleta nada de ninguém, crianças incluídas, e este site reúne só as estatísticas de visita descritas acima.

## Mudanças nesta política

Quando esta política muda, a data no topo muda junto. Todas as versões anteriores continuam públicas: a política fica em um repositório público no GitHub, e o link no topo desta página mostra todo o histórico.

## Contato

Envie suas dúvidas como uma issue no [GitHub](https://github.com/musashinm/vital-courier-site/issues). As issues são públicas, então qualquer pessoa pode lê-las. Não publique informações de saúde nem nada privado nelas. O GitHub trata os dados da sua conta e do seu perfil conforme a própria [declaração de privacidade](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
