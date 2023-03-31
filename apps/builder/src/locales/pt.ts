import { defineLocale } from './index'

export default defineLocale({
  back: 'Voltar',
  'confirmModal.defaultTitle': 'Tem certeza?',
  'dashboard.header.settingsButton.label': 'Configurações & Membros',
  'dashboard.redirectionMessage': 'Você está sendo redirecionado...',
  'dashboard.title': 'Meus typebots',
  delete: 'Deletar',
  errorMessage: 'Ocorreu um erro',
  'folders.createFolderButton.label': 'Criar uma pasta',
  'folders.createTypebotButton.label': 'Criar um typebot',
  'folders.folderButton.deleteConfirmationMessage':
    'Tem certeza de que deseja excluir a pasta {folderName}? (Tudo o que estiver dentro será movido para o seu painel)',
  'folders.typebotButton.live': 'Live',
  'folders.typebotButton.showMoreOptions': 'Mostrar mais opções',
  'folders.typebotButton.unpublish': 'Despublicar',
  'folders.typebotButton.duplicate': 'Duplicar',
  'folders.typebotButton.delete': 'Deletar',
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
  'account.apiTokens.createModal.createButtonLabel': 'Criar token',
  'account.apiTokens.createModal.doneButtonLabel': 'Concluído',
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
  'auth.signin.noAccountLabel.link': 'Registe-se gratuitamente',
  'auth.register.heading': 'Criar uma conta',
  'auth.register.alreadyHaveAccountLabel.preLink': 'Já tem uma conta?',
  'auth.register.alreadyHaveAccountLabel.link': 'Entrar',
  'auth.error.default': 'Tente entrar com uma conta diferente.',
  'auth.error.email':
    'E-mail não encontrado. Tente entrar com um fornecedor diferente.',
  'auth.error.oauthNotLinked':
    'Para confirmar sua identidade, entre com a mesma conta que você usou originalmente.',
  'auth.error.unknown': 'Ocorreu um erro. Tente novamente.',
  'auth.signinErrorToast.title': 'Não autorizado',
  'auth.signinErrorToast.description': 'As inscrições estão desativadas.',
  'auth.noProvider.preLink': 'Você precisa',
  'auth.noProvider.link':
    'configurar pelo menos um fornecedor de autenticação (E-mail, Google, GitHub, Facebook ou Azure AD).',
  'auth.orEmailLabel': 'Ou com seu email',
  'auth.emailSubmitButtonLabel': 'Enviar',
  'auth.magicLink.title': 'Um email de link mágico foi enviado. 🪄',
  'auth.magicLink.description': 'Certifique-se de verificar sua pasta de spam.',
  'auth.socialLogin.githubButtonLabel': 'Continuar com GitHub',
  'auth.socialLogin.googleButtonLabel': 'Continuar com Google',
  'auth.socialLogin.facebookButtonLabel': 'Continuar com Facebook',
  'auth.socialLogin.azureButtonLabel': 'Continuar com {azureProviderName}',
  'auth.socialLogin.gitlabButtonLabel': 'Continuar com {gitlabProviderName}',
  'auth.socialLogin.customButtonLabel': 'Continuar com {customProviderName}',
})
