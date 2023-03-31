import { defineLocale } from './index'

export default defineLocale({
  back: 'Retour',
  'confirmModal.defaultTitle': 'Êtes-vous sûr ?',
  'dashboard.header.settingsButton.label': 'Paramètres & Membres',
  'dashboard.redirectionMessage': "Vous êtes en train d'être redirigé...",
  'dashboard.title': 'Mes typebots',
  delete: 'Supprimer',
  errorMessage: "Une erreur s'est produite",
  'folders.createFolderButton.label': 'Créer un dossier',
  'folders.createTypebotButton.label': 'Créer un typebot',
  'folders.folderButton.deleteConfirmationMessage':
    "Êtes-vous sûr de vouloir supprimer le dossier {folderName} ? (Tout ce qui est à l'intérieur sera déplacé dans le dossier parent ou sur votre tableau de bord)",
  'folders.typebotButton.live': 'Live',
  'folders.typebotButton.showMoreOptions': "Afficher plus d'options",
  'folders.typebotButton.unpublish': 'Dépublier',
  'folders.typebotButton.duplicate': 'Dupliquer',
  'folders.typebotButton.delete': 'Supprimer',
  'folders.typebotButton.deleteConfirmationMessage':
    'Êtes-vous sûr de vouloir supprimer votre typebot {typebotName} ?',
  'folders.typebotButton.deleteConfirmationMessageWarning':
    'Toutes les données associées seront supprimées et ne pourront pas être récupérées.',
  'account.apiTokens.heading': 'Tokens API',
  'account.apiTokens.description':
    "Ces tokens permettent à d'autres applications de contrôler votre compte et vos typebots. Soyez prudent !",
  'account.apiTokens.createButton.label': 'Créer',
  'account.apiTokens.deleteButton.label': 'Supprimer',
  'account.apiTokens.table.nameHeader': 'Nom',
  'account.apiTokens.table.createdHeader': 'Créé',
  'account.apiTokens.deleteConfirmationMessage':
    'Le token {tokenName} sera définitivement révoqué, êtes-vous sûr de vouloir continuer ?',
  'account.apiTokens.createModal.createHeading': 'Créer un token',
  'account.apiTokens.createModal.createdHeading': 'Token créé',
  'account.apiTokens.createModal.nameInput.label':
    'Entrez un nom unique pour votre token afin de le différencier des autres tokens.',
  'account.apiTokens.createModal.nameInput.placeholder':
    'Ex. Zapier, Github, Make.com',
  'account.apiTokens.createModal.createButtonLabel': 'Créer un token',
  'account.apiTokens.createModal.doneButtonLabel': 'Terminé',
  'account.apiTokens.createModal.copyInstruction':
    'Veuillez copier votre token et le stocker dans un endroit sûr.',
  'account.apiTokens.createModal.securityWarning':
    'Pour des raisons de sécurité, nous ne pouvons pas le montrer à nouveau.',
  'account.preferences.graphNavigation.heading': "Navigation de l'éditeur",
  'account.preferences.graphNavigation.mouse.label': 'Souris',
  'account.preferences.graphNavigation.mouse.description':
    'Déplacez en glissant et zoom en avant/arrière en utilisant la molette',
  'account.preferences.graphNavigation.trackpad.label': 'Trackpad',
  'account.preferences.graphNavigation.trackpad.description':
    'Déplacez le board en utilisant 2 doigts et zoomer en avant/arrière en pincant',
  'account.preferences.appearance.heading': 'Apparence',
  'account.preferences.appearance.systemLabel': 'Système',
  'account.preferences.appearance.lightLabel': 'Clair',
  'account.preferences.appearance.darkLabel': 'Sombre',
  'account.myAccount.changePhotoButton.label': 'Changer de photo',
  'account.myAccount.changePhotoButton.specification': '.jpg ou.png, max 1MB',
  'account.myAccount.emailInput.disabledTooltip':
    "La mise à jour de l'adresse e-mail n'est pas disponible. Contactez le service d'assistance si vous souhaitez la modifier.",
  'account.myAccount.emailInput.label': 'Adresse e-mail:',
  'account.myAccount.nameInput.label': 'Nom:',
  'analytics.viewsLabel': 'Vues',
  'analytics.startsLabel': 'Démarrés',
  'analytics.completionRateLabel': 'Taux de complétion',
  'auth.signin.heading': 'Se connecter',
  'auth.signin.noAccountLabel.preLink': "Vous n'avez pas de compte?",
  'auth.signin.noAccountLabel.link': 'Inscrivez-vous gratuitement',
  'auth.register.heading': 'Créer un compte',
  'auth.register.alreadyHaveAccountLabel.preLink': 'Vous avez déjà un compte?',
  'auth.register.alreadyHaveAccountLabel.link': 'Se connecter',
  'auth.error.default': 'Essayez de vous connecter avec un compte différent.',
  'auth.error.email':
    'Email non trouvé. Essayez de vous connecter avec un fournisseur différent.',
  'auth.error.oauthNotLinked':
    'Pour confirmer votre identité, connectez-vous avec le même compte que vous avez utilisé à lorigine.',
  'auth.error.unknown': 'Une erreur est survenue. Veuillez réessayer.',
  'auth.signinErrorToast.title': 'Non autorisé',
  'auth.signinErrorToast.description': 'Les inscriptions sont désactivées.',
  'auth.noProvider.preLink': 'Vous avez besoin de',
  'auth.noProvider.link':
    "configurer au moins un fournisseur d'authentification (E-mail, Google, GitHub, Facebook ou Azure AD).",
  'auth.orEmailLabel': 'Ou avec votre email',
  'auth.emailSubmitButtonLabel': 'Se connecter',
  'auth.magicLink.title':
    "Un email avec un lien d'authentification a été envoyé. 🪄",
  'auth.magicLink.description':
    'Assurez-vous de vérifier votre dossier de spam.',
  'auth.socialLogin.githubButtonLabel': 'Continuer avec GitHub',
  'auth.socialLogin.googleButtonLabel': 'Continuer avec Google',
  'auth.socialLogin.facebookButtonLabel': 'Continuer avec Facebook',
  'auth.socialLogin.azureButtonLabel': 'Continuer avec {azureProviderName}',
  'auth.socialLogin.gitlabButtonLabel': 'Continuer avec {gitlabProviderName}',
  'auth.socialLogin.customButtonLabel': 'Continuer avec {customProviderName}',
})
