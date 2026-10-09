---
title: Política de Privacidade
updated: 2026-10-09
---

O Vital Courier exporta seus dados do Apple Saúde para uma pasta que você escolhe. Ele não tem conta nem servidor, e não envia nada ao desenvolvedor nem a mais ninguém.

## O que o Vital Courier lê

Com a sua permissão, o Vital Courier lê quatro tipos de dados do Apple Saúde:

- Passos
- Frequência Cardíaca em Repouso
- Peso
- Sono

Ele pede só acesso de leitura e nunca grava nem altera seus dados do Saúde. Quando o iOS perguntar, você escolhe quais dos quatro liberar.

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

Nos Ajustes do aplicativo, Apagar cópia local apaga a cópia local dos seus registros do Saúde. Isso não mexe nos seus dados do Apple Saúde nem nos arquivos já exportados, e suas configurações, o histórico de exportações e a pasta escolhida continuam. A próxima execução que puder ler os dados do Saúde lê de novo os quatro tipos de dados.

Para apagar arquivos exportados, apague-os no aplicativo Arquivos ou no seu serviço de armazenamento.

## Como desligar o acesso

Você pode desligar o acesso do Vital Courier a qualquer um dos quatro tipos de dados, ou a todos, quando quiser:

- No aplicativo Saúde: toque na sua foto de perfil, depois em Apps e depois em Vital Courier
- Nos Ajustes do iPhone: Saúde, depois Acesso a Dados e Dispositivos, depois Vital Courier

Para parar as exportações para uma pasta, escolha outra pasta no Vital Courier. Se você apagar a pasta no aplicativo Arquivos, o Vital Courier não consegue mais gravar nela e não a recria.

## O que nunca é coletado

O Vital Courier não tem conta nem login. Ele não tem análise de uso, publicidade, rastreamento nem relatórios de falhas, e não faz nenhuma conexão de rede por conta própria. Seus dados do Saúde nunca chegam ao desenvolvedor.

## Crianças

O Vital Courier não é voltado para crianças, e o desenvolvedor não coleta nada de ninguém, crianças incluídas.

## Mudanças nesta política

Quando esta política muda, a data no topo muda junto. Todas as versões anteriores continuam públicas: a política fica em um repositório público no GitHub, e o link no topo desta página mostra todo o histórico.

## Contato

Envie suas dúvidas como uma issue no [GitHub](https://github.com/musashinm/vital-courier-site/issues). As issues são públicas, então qualquer pessoa pode lê-las. Não publique informações de saúde nem nada privado nelas. O GitHub trata os dados da sua conta e do seu perfil conforme a própria [declaração de privacidade](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
