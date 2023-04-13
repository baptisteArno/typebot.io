import { defineLocale } from './index'

export default defineLocale({
  back: 'Retour',
  'confirmModal.defaultTitle': 'Êtes-vous sûr ?',
  'dashboard.header.settingsButton.label': 'Paramètres & Membres',
  'dashboard.redirectionMessage': "Vous êtes en train d'être redirigé...",
  'dashboard.title': 'Mes typebots',
  delete: 'Supprimer',
  errorMessage: "Une erreur s'est produite",
  cancel: 'Annuler',
  update: 'Mettre à jour',
  upgrade: 'Upgrade',
  downgrade: 'Downgrade',
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
  'account.apiTokens.createModal.createButton.label': 'Créer un token',
  'account.apiTokens.createModal.doneButton.label': 'Terminé',
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
  'auth.emailSubmitButton.label': 'Se connecter',
  'auth.magicLink.title':
    "Un email avec un lien d'authentification a été envoyé. 🪄",
  'auth.magicLink.description':
    'Assurez-vous de vérifier votre dossier de spam.',
  'auth.socialLogin.githubButton.label': 'Continuer avec GitHub',
  'auth.socialLogin.googleButton.label': 'Continuer avec Google',
  'auth.socialLogin.facebookButton.label': 'Continuer avec Facebook',
  'auth.socialLogin.azureButton.label': 'Continuer avec {azureProviderName}',
  'auth.socialLogin.gitlabButton.label': 'Continuer avec {gitlabProviderName}',
  'auth.socialLogin.customButton.label': 'Continuer avec {customProviderName}',
  'billing.billingPortalButton.label': 'Portail de facturation',
  'billing.contribution.preLink':
    "Typebot contribue à hauteur de 1% de votre abonnement pour éliminer le CO₂ de l'atmosphère.",
  'billing.contribution.link': 'En savoir plus.',
  'billing.updateSuccessToast.description':
    'Votre abonnement {plan} a été mis à jour avec succès 🎉',
  'billing.customLimit.preLink':
    'Vous avez besoin de limites personnalisées ? De fonctionnalités spécifiques ?',
  'billing.customLimit.link': 'Discutons-en!',
  'billing.upgradeLimitLabel':
    'Vous devez mettre à niveau votre abonnement pour {type}',
  'billing.currentSubscription.heading': 'Abonnement',
  'billing.currentSubscription.subheading': 'Abonnement actuel du workspace :',
  'billing.currentSubscription.cancelLink': "Annuler l'abonnement",
  'billing.invoices.heading': 'Factures',
  'billing.invoices.empty': 'Aucune facture trouvée pour ce workspace.',
  'billing.invoices.paidAt': 'Payé le',
  'billing.invoices.subtotal': 'Sous-total',
  'billing.preCheckoutModal.companyInput.label': "Nom de l'entreprise :",
  'billing.preCheckoutModal.emailInput.label': 'E-mail :',
  'billing.preCheckoutModal.taxId.label': 'Numéro de TVA :',
  'billing.preCheckoutModal.taxId.placeholder': 'Type',
  'billing.preCheckoutModal.submitButton.label': 'Continuer',
  'billing.pricingCard.heading': 'Passer à {plan}',
  'billing.pricingCard.perMonth': '/ mois',
  'billing.pricingCard.plus': ', plus :',
  'billing.pricingCard.upgradeButton.current': 'Abonnement actuel',
  'billing.pricingCard.chatsPerMonth': 'chats/mois',
  'billing.pricingCard.chatsTooltip':
    "Un chat est comptabilisé chaque fois qu'un utilisateur démarre une discussion. Il est indépendant du nombre de messages qu'il envoie et reçoit.",
  'billing.pricingCard.storageLimit': 'Go de stockage',
  'billing.pricingCard.storageLimitTooltip':
    "Vous accumulez du stockage pour chaque fichier que votre utilisateur télécharge dans votre bot. Si vous supprimez le résultat, cela libérera de l'espace.",
  'billing.pricingCard.starter.description':
    'Pour les particuliers et les petites entreprises.',
  'billing.pricingCard.starter.includedSeats': '2 collègues inclus',
  'billing.pricingCard.starter.brandingRemoved': 'Marque enlevée',
  'billing.pricingCard.starter.fileUploadBlock': "Bloc d'upload de fichier",
  'billing.pricingCard.starter.createFolders': 'Créer des dossiers',
  'billing.pricingCard.pro.mostPopularLabel': 'Le plus populaire',
  'billing.pricingCard.pro.description':
    'Pour les agences et les startups en croissance.',
  'billing.pricingCard.pro.everythingFromStarter':
    "Tout ce qu'il y a dans Starter",
  'billing.pricingCard.pro.includedSeats': '5 collègues inclus',
  'billing.pricingCard.pro.customDomains': 'Domaines personnalisés',
  'billing.pricingCard.pro.analytics': 'Analyses approfondies',
  'billing.usage.heading': 'Utilisation',
  'billing.usage.chats.heading': 'Chats',
  'billing.usage.chats.alert.soonReach':
    'Vos typebots sont populaires ! Vous atteindrez bientôt la limite de chats de votre abonnement. 🚀',
  'billing.usage.chats.alert.updatePlan':
    'Assurez-vous de mettre à jour votre abonnement pour augmenter cette limite et continuer à discuter avec vos utilisateurs.',
  'billing.usage.chats.resetInfo': '(réinitialisé le 1er de chaque mois)',
  'billing.usage.storage.heading': 'Stockage',
  'billing.usage.storage.alert.soonReach':
    'Vos typebots sont populaires ! Vous atteindrez bientôt la limite de stockage de votre abonnement. 🚀',
  'billing.usage.storage.alert.updatePlan':
    "Assurez-vous de mettre à jour votre abonnement pour continuer à collecter des fichiers téléchargés. Vous pouvez également supprimer des fichiers pour libérer de l'espace.",
  'billing.limitMessage.brand': 'supprimer la marque',
  'billing.limitMessage.customDomain': 'ajouter des domaines personnalisés',
  'billing.limitMessage.analytics': 'débloquer des analyses approfondies',
  'billing.limitMessage.fileInput': 'utiliser des blocs de saisie de fichiers',
  'billing.limitMessage.folder': 'créer des dossiers',
  'billing.upgradeAlert.buttonDefaultLabel': "Plus d'informations",
})
