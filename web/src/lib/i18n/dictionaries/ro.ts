export const ro = {
  common: {
    back: 'Înapoi',
    continue: 'Continuă',
    loading: 'Se procesează...',
    close: 'Închide',
    search: 'Caută...',
    noResults: 'Niciun rezultat găsit',
    or: 'sau',
  },
  nav: {
    howItWorks: 'Cum funcționează',
    earnings: 'Câștiguri',
    whyGigtim: 'De ce GigTim',
    features: 'Funcționalități',
    login: 'Conectare',
    register: 'Începe acum',
    createAccount: 'Creează cont',
  },
  auth: {
    loginTitle: 'Conectare',
    loginSubtitle: 'Accesează contul tău GigTim',
    loginButton: 'Conectează-te',
    loggingIn: 'Se conectează...',
    noAccount: 'Nu ai un cont?',
    createNewAccount: 'Creează cont nou',
    alreadyHaveAccount: 'Ai deja un cont?',
    logInHere: 'Conectează-te',
    forgotPassword: 'Ai uitat parola?',
    emailLabel: 'Email',
    emailPlaceholder: 'nume@exemplu.ro',
    passwordLabel: 'Parolă',
    passwordPlaceholder: '••••••••',
    confirmPasswordLabel: 'Confirmă Parola',
    passwordMinLength: 'Parola trebuie să aibă minim 6 caractere.',
    passwordsMismatch: 'Parolele nu coincid.',

    // Register Wizard
    registerTitle: 'GigTim',
    registerSubtitle: 'Creează-ți contul în câteva secunde',
    step1Title: 'Tipul contului',
    step1Desc: 'Alege cum vrei să folosești platforma',
    step2Title: 'Date autentificare',
    step2Desc: 'Introdu adresa de email și o parolă sigură',
    step3Title: 'Profil utilizator',
    step3Desc: 'Completează detaliile pentru a-ți finaliza profilul',
    step4Title: 'Cont creat cu succes!',
    step4Desc: 'Urmează ultimul pas pentru activare',

    accountType: 'Tip cont',
    roleWorkerTitle: 'Zilier / Lucrător',
    roleWorkerDesc: 'Găsește ture zilnice plătite pe loc',
    roleEmployerTitle: 'Angajator',
    roleEmployerDesc: 'Publică ture și găsește personal verificat',

    fullNameLabel: 'Nume și prenume',
    fullNamePlaceholder: 'Ion Popescu',
    phoneLabel: 'Telefon',
    phonePlaceholder: '0712 345 678',
    companyNameLabel: 'Nume Companie',
    companyNamePlaceholder: 'SC Exemplu SRL',
    cuiLabel: 'CUI (Cod Unic de Înregistrare)',
    cuiPlaceholder: 'RO12345678',
    addressLabel: 'Adresă sediu',
    addressPlaceholder: 'Str. Revoluției nr. 10',
    countyLabel: 'Județ',
    cityLabel: 'Oraș',

    submitCreateAccount: 'Creează cont',
    emailVerifyTitle: 'Verifică-ți adresa de email',
    emailVerifyBody: 'Am trimis un link de confirmare la adresa',
    emailVerifyAction: 'Te rugăm să deschizi emailul și să apeși pe link pentru a-ți activa contul.',
    goToLogin: 'Mergi la Autentificare',
  },
  hero: {
    liveBadge: 'TURE LIVE PE HARTA ORAȘULUI',
    titleLine1: 'Orașul lucrează.',
    titleLine2: 'Tu doar alegi tura.',
    description: 'Ture de o zi în HoReCa, pe harta orașului tău. Aplici cu un click, angajatorul te acceptă, iar registrul ITM se generează automat.',
    createAccount: 'Creează cont',
    whyGigtim: 'De ce GigTim?',
  },
} as const

type DeepString<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? T[K]
    : T[K] extends object
    ? DeepString<T[K]>
    : string
}

export type TranslationDictionary = DeepString<typeof ro>
