import { defineLocale } from './index'

export default defineLocale({
  back: 'Voltar',
  'confirmModal.defaultTitle': 'Tem certeza?',
  'dashboard.header.settingsButton.label': 'Configurações & Membros',
  'dashboard.redirectionMessage': 'Você está sendo redirecionado...',
  'dashboard.title': 'Meus typebots',
  delete: 'Apagar',
  errorMessage: 'Ocorreu um erro',
  cancel: 'Cancelar',
  update: 'Atualizar',
  upgrade: 'Upgrade',
  downgrade: 'Downgrade',
  'folders.createFolderButton.label': 'Criar uma pasta',
  'folders.createTypebotButton.label': 'Criar um typebot',
  'folders.folderButton.deleteConfirmationMessage':
    'Tem certeza de que deseja excluir a pasta {folderName}? (Tudo o que estiver dentro será movido para o seu painel)',
  'folders.typebotButton.live': 'Live',
  'folders.typebotButton.showMoreOptions': 'Mostrar mais opções',
  'folders.typebotButton.unpublish': 'Despublicar',
  'folders.typebotButton.duplicate': 'Duplicar',
  'folders.typebotButton.delete': 'Apagar',
  'folders.typebotButton.deleteConfirmationMessage':
    'Tem certeza de que deseja excluir seu typebot {typebotName}?',
  'folders.typebotButton.deleteConfirmationMessageWarning':
    'Todos os dados associados serão excluídos e não poderão ser recuperados.',
  'account.apiTokens.heading': 'Tokens de API',
  'account.apiTokens.description':
    'Esses tokens permitem que outros aplicativos controlem toda a sua conta e typebots. Tenha cuidado!',
  'account.apiTokens.createButton.label': 'Criar',
  'account.apiTokens.deleteButton.label': 'Excluir',
  'account.apiTokens.table.nameHeader': 'Nome',
  'account.apiTokens.table.createdHeader': 'Criado',
  'account.apiTokens.deleteConfirmationMessage':
    'O token {tokenName} será revogado permanentemente. Tem certeza de que deseja continuar?',
  'account.apiTokens.createModal.createHeading': 'Criar Token',
  'account.apiTokens.createModal.createdHeading': 'Token Criado',
  'account.apiTokens.createModal.nameInput.label':
    'Insira um nome único para o seu token para diferenciá-lo de outros tokens.',
  'account.apiTokens.createModal.nameInput.placeholder':
    'Ex. Zapier, Github, Make.com',
  'account.apiTokens.createModal.createButton.label': 'Criar token',
  'account.apiTokens.createModal.doneButton.label': 'Concluído',
  'account.apiTokens.createModal.copyInstruction':
    'Por favor, copie seu token e guarde-o em um lugar seguro.',
  'account.apiTokens.createModal.securityWarning':
    'Por motivos de segurança, não podemos mostrá-lo novamente.',
  'account.preferences.graphNavigation.heading': 'Navegação do Editor',
  'account.preferences.graphNavigation.mouse.label': 'Mouse',
  'account.preferences.graphNavigation.mouse.description':
    'Mova arrastando o quadro e amplie/reduza usando a roda de rolagem',
  'account.preferences.graphNavigation.trackpad.label': 'Trackpad',
  'account.preferences.graphNavigation.trackpad.description':
    'Mova o quadro usando 2 dedos e amplie/reduza fazendo pinça',
  'account.preferences.appearance.heading': 'Aparência',
  'account.preferences.appearance.systemLabel': 'Sistema',
  'account.preferences.appearance.lightLabel': 'Claro',
  'account.preferences.appearance.darkLabel': 'Escuro',
  'account.myAccount.changePhotoButton.label': 'Alterar foto',
  'account.myAccount.changePhotoButton.specification':
    '.jpg ou.png, máximo 1MB',
  'account.myAccount.emailInput.disabledTooltip':
    'A atualização do e-mail não está disponível. Entre em contato com o suporte se quiser alterá-lo.',
  'account.myAccount.emailInput.label': 'Endereço de e-mail:',
  'account.myAccount.nameInput.label': 'Nome:',
  'analytics.viewsLabel': 'Visualizações',
  'analytics.startsLabel': 'Inícios',
  'analytics.completionRateLabel': 'Taxa de conclusão',
  'auth.signin.heading': 'Entrar',
  'auth.signin.noAccountLabel.preLink': 'Não tem uma conta?',
  'auth.signin.noAccountLabel.link': 'Registre-se gratuitamente',
  'auth.register.heading': 'Criar uma conta',
  'auth.register.alreadyHaveAccountLabel.preLink': 'Já tem uma conta?',
  'auth.register.alreadyHaveAccountLabel.link': 'Entrar',
  'auth.error.default': 'Tente entrar com uma conta diferente.',
  'auth.error.email':
    'E-mail não encontrado. Tente entrar com um provedor diferente.',
  'auth.error.oauthNotLinked':
    'Para confirmar sua identidade, entre com a mesma conta que você usou originalmente.',
  'auth.error.unknown': 'Ocorreu um erro. Tente novamente.',
  'auth.signinErrorToast.title': 'Não autorizado',
  'auth.signinErrorToast.description': 'As inscrições estão desativadas.',
  'auth.noProvider.preLink': 'Você precisa',
  'auth.noProvider.link':
    'configurar pelo menos um provedor de autenticação (E-mail, Google, GitHub, Facebook ou Azure AD).',
  'auth.orEmailLabel': 'Ou com seu email',
  'auth.emailSubmitButton.label': 'Enviar',
  'auth.magicLink.title': 'Um email com o link mágico foi enviado. 🪄',
  'auth.magicLink.description': 'Certifique-se de verificar sua pasta de spam.',
  'auth.socialLogin.githubButton.label': 'Continuar com GitHub',
  'auth.socialLogin.googleButton.label': 'Continuar com Google',
  'auth.socialLogin.facebookButton.label': 'Continuar com Facebook',
  'auth.socialLogin.azureButton.label': 'Continuar com {azureProviderName}',
  'auth.socialLogin.gitlabButton.label': 'Continuar com {gitlabProviderName}',
  'auth.socialLogin.customButton.label': 'Continuar com {customProviderName}',
  'billing.billingPortalButton.label': 'Portal de cobrança',
  'billing.contribution.preLink':
    'A Typebot está contribuindo com 1% da sua assinatura para remover o CO₂ da atmosfera.',
  'billing.contribution.link': 'Saiba mais.',
  'billing.updateSuccessToast.description':
    'Sua assinatura {plan} foi atualizada com sucesso 🎉',
  'billing.customLimit.preLink':
    'Precisa de limites personalizados? Recursos específicos?',
  'billing.customLimit.link': 'Vamos conversar!',
  'billing.upgradeLimitLabel':
    'Você precisa atualizar sua assinatura para {type}',
  'billing.currentSubscription.heading': 'Assinatura',
  'billing.currentSubscription.subheading':
    'Assinatura atual do espaço de trabalho:',
  'billing.currentSubscription.cancelLink': 'Cancelar minha assinatura',
  'billing.invoices.heading': 'Faturas',
  'billing.invoices.empty':
    'Nenhuma fatura encontrada para este espaço de trabalho.',
  'billing.invoices.paidAt': 'Pago em',
  'billing.invoices.subtotal': 'Subtotal',
  'billing.preCheckoutModal.companyInput.label': 'Nome da empresa:',
  'billing.preCheckoutModal.emailInput.label': 'E-mail:',
  'billing.preCheckoutModal.taxId.label': 'Identificação fiscal (CPF):',
  'billing.preCheckoutModal.taxId.placeholder': 'Tipo de ID',
  'billing.preCheckoutModal.submitButton.label':
    'Ir para a finalização da compra',
  'billing.pricingCard.heading': 'Mudar para {plan}',
  'billing.pricingCard.perMonth': '/ mês',
  'billing.pricingCard.plus': ', mais:',
  'billing.pricingCard.upgradeButton.current': 'Sua assinatura atual',
  'billing.pricingCard.chatsPerMonth': 'chats/mês',
  'billing.pricingCard.chatsTooltip':
    'Um chat é contado sempre que um usuário inicia uma discussão. Ele é independente do número de mensagens que ele envia e recebe.',
  'billing.pricingCard.storageLimit': 'GB de armazenamento',
  'billing.pricingCard.storageLimitTooltip':
    'Você acumula armazenamento para cada arquivo que seu usuário carrega em seu bot. Se você excluir o resultado, ele liberará espaço.',
  'billing.pricingCard.starter.description':
    'Para indivíduos e pequenas empresas.',
  'billing.pricingCard.starter.includedSeats': '2 assentos incluídos',
  'billing.pricingCard.starter.brandingRemoved': 'Marca removida',
  'billing.pricingCard.starter.fileUploadBlock': 'Bloco de envio de arquivo',
  'billing.pricingCard.starter.createFolders': 'Criar pastas',
  'billing.pricingCard.pro.mostPopularLabel': 'Mais popular',
  'billing.pricingCard.pro.description':
    'Para agências e startups em crescimento.',
  'billing.pricingCard.pro.everythingFromStarter': 'Tudo em Starter',
  'billing.pricingCard.pro.includedSeats': '5 assentos incluídos',
  'billing.pricingCard.pro.customDomains': 'Domínios personalizados',
  'billing.pricingCard.pro.analytics': 'Análises aprofundadas',
  'billing.usage.heading': 'Uso',
  'billing.usage.chats.heading': 'Chats',
  'billing.usage.chats.alert.soonReach':
    'Seus typebots são populares! Você logo alcançará o limite de chats de seu plano. 🚀',
  'billing.usage.chats.alert.updatePlan':
    'Certifique-se de atualizar seu plano para aumentar esse limite e continuar conversando com seus usuários.',
  'billing.usage.chats.resetInfo': '(reiniciado todo dia 1)',
  'billing.usage.storage.heading': 'Armazenamento',
  'billing.usage.storage.alert.soonReach':
    'Seus typebots são populares! Você logo alcançará o limite de armazenamento de seu plano. 🚀',
  'billing.usage.storage.alert.updatePlan':
    'Certifique-se de atualizar seu plano para continuar coletando arquivos enviados. Você também pode excluir arquivos para liberar espaço.',
  'billing.limitMessage.brand': 'remover a marca',
  'billing.limitMessage.customDomain': 'adicionar domínios personalizados',
  'billing.limitMessage.analytics': 'desbloquear análises aprofundadas',
  'billing.limitMessage.fileInput': 'usar blocos de envio de arquivo',
  'billing.limitMessage.folder': 'criar pastas',
  'billing.upgradeAlert.buttonDefaultLabel': 'Mais informações',
})
