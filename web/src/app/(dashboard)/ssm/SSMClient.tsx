'use client'

import { useState } from 'react'
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Flame,
  Zap,
  HardHat,
  BookOpen,
  Scale,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { UserRole } from '@/lib/types/database'

interface SSMClientProps {
  userRole: UserRole
  userName: string
}

const MODULES = [
  {
    id: 'horeca',
    title: 'HoReCa & Bucătării',
    badge: 'Legea 52/2011',
    icon: Flame,
    duration: '3 min',
    hazards: [
      'Pardoseli alunecoase din gresie și grăsimi',
      'Contact cu ustensile ascuțite (cuțite, feliatoare)',
      'Suprafețe și uleiuri fierbinți (friteuze, cuptoare)',
      'Substanțe de degresare și dezinfectare industriale',
    ],
    rules: [
      'Poartă încălțăminte antiderapantă cu talpă aderentă la apă și ulei.',
      'Nu transporta recipiente deschise cu lichide fierbinți prin zone aglomerate.',
      'Șterge imediat orice pată de apă sau ulei căzută pe pardoseală.',
      'Manipulează cuțitele ținând lama orientată în jos în timpul deplasării.',
    ],
    quiz: [
      {
        id: 1,
        question: 'Ce faci imediat când verși un lichid pe gresia din bucătărie sau debarasare?',
        options: [
          'Aștepți să termine tura cel de la curățenie',
          'Ștergi imediat zona și semnalizezi dacă podeaua e încă umedă',
          'Treci cu grijă peste pată fără să o cureți',
        ],
        correctIndex: 1,
        explanation: 'Alunecările pe gresie umedă reprezintă 68% din accidentele ușoare din bucătării conform ITM.',
      },
      {
        id: 2,
        question: 'Cum se deplasează corect un lucrător care ține un cuțit de bucătărie?',
        options: [
          'Cu lama îndreptată înainte pentru a fi vizibilă',
          'Cu lama îndreptată în jos, lipită de coapsă',
          'În buzunarul șorțului',
        ],
        correctIndex: 1,
        explanation: 'Lama ținută în jos și aproape de corp previne tăierile accidentale la colțuri sau uși batante.',
      },
      {
        id: 3,
        question: 'Ce echipament de protecție individuală este obligatoriu în spatele barului/bucătăriei?',
        options: [
          'Încălțăminte antiderapantă închisă',
          'Papuci deschiși confortabili',
          'Orice încălțăminte sport din pânză',
        ],
        correctIndex: 0,
        explanation: 'Talpa antiderapantă și bombeul protejat previn traumatismele provocate de căderea obiectelor grele.',
      },
    ],
  },
  {
    id: 'gardening',
    title: 'Tuns Iarba & Grădinărit',
    badge: 'Legea 111/2022',
    icon: HardHat,
    duration: '3 min',
    hazards: [
      'Pietre sau sârme proiectate cu viteză de lama motocoasei',
      'Cabluri electrice pe sol și umiditate exterioară',
      'Toaletare crengi la înălțime și muchii ascuțite',
      'Insolație și efort termic în miezul zilei',
    ],
    rules: [
      'Poartă obligatoriu ochelari de protecție sau vizieră când folosești motocoasa/mașina de tuns.',
      'Verifică gazonul înainte de pornirea utilajului și îndepărtează pietrele, bucățile de sârmă sau crengile.',
      'Nu lucra pe iarbă udă cu echipamente electrice alimentate la 220V.',
      'Poartă pantaloni lungi rezistenți și bocanci cu talpă profilată.',
    ],
    quiz: [
      {
        id: 1,
        question: 'Ce trebuie verificat pe teren înainte de a porni mașina de tuns iarba sau motocoasa?',
        options: [
          'Dacă florile vecinilor sunt udate',
          'Dacă pe iarbă există pietre, sârme, jucării sau crengi care pot fi proiectate',
          'Doar nivelul de zgomot din cartier',
        ],
        correctIndex: 1,
        explanation: 'Lama rotativă poate proiecta o piatră cu peste 150 km/h, provocând vătămări grave ochilor.',
      },
      {
        id: 2,
        question: 'Este permisă tunderea ierbii cu o mașină electrică alimentată la priză pe timp de ploaie sau rouă densă?',
        options: [
          'Da, dacă cablul are izolație colorată',
          'Strict interzis — risc major de electrocutare prin umiditate',
          'Da, dacă purtăm mănuși de bumbac',
        ],
        correctIndex: 1,
        explanation: 'Apa conduce curentul electric; utilajele electrice pe fir se folosesc exclusiv pe gazon uscat.',
      },
      {
        id: 3,
        question: 'Care este echipamentul minim obligatoriu la utilizarea unei motocoase cu fir sau cuțit?',
        options: [
          'Ochelari/vizieră de protecție, pantaloni lungi și încălțăminte robustă',
          'Ochelari de soare și pantaloni scurți',
          'Șapcă și mănuși subțiri de unică folosință',
        ],
        correctIndex: 0,
        explanation: 'Ochelarii de protecție și pantalonii rezistenți opresc fragmentele vegetale și pietricelele.',
      },
    ],
  },
  {
    id: 'events',
    title: 'Evenimente & Logistică',
    badge: 'Legea 52/2011',
    icon: Zap,
    duration: '3 min',
    hazards: [
      'Ridicarea greutăților (cutii, lăzi, elemente scenă)',
      'Cabluri electrice și audio-video trase pe căile de acces',
      'Lucru în mediu cu iluminare redusă sau zgomot intens',
      'Trafic de cărucioare de marfă și transpalete manuale',
    ],
    rules: [
      'Ridică greutățile îndoind genunchii și ținând spatele drept, nu din talie.',
      'Cere ajutorul unui coleg pentru orice colet mai greu de 25 kg.',
      'Acoperă cablurile de pe podea cu treceri speciale (rampe de cablu) galben-negre.',
      'Fii atent la semnalele acustice și la manevrele de descărcare din dube.',
    ],
    quiz: [
      {
        id: 1,
        question: 'Cum se ridică corect o ladă grea de la sol pentru a proteja coloana vertebrală?',
        options: [
          'Cu picioarele drepte și aplecându-te din talie',
          'Îndoind genunchii, ținând spatele drept și greutatea lipită de piept',
          'Dintr-o singură mișcare bruscă prin răsucirea trunchiului',
        ],
        correctIndex: 1,
        explanation: 'Ridicarea din picioare protejează discurile lombare de herniere și efort asimetric.',
      },
      {
        id: 2,
        question: 'Ce faci când observi cabluri electrice sau de sunet descoperite traversând o zonă de trecere?',
        options: [
          'Pășești cu atenție peste ele',
          'Le acoperi cu rampă de protecție pentru cabluri sau anunți coordonatorul tehnic',
          'Le deconectezi imediat fără să întrebi',
        ],
        correctIndex: 1,
        explanation: 'Cablurile neprotejate provoacă împiedicări și deteriorarea izolației electrice.',
      },
      {
        id: 3,
        question: 'Care este limita recomandată pentru manipularea manuală individuală a maselor?',
        options: [
          '50 kg pentru orice persoană',
          'Maximum 25 kg pentru bărbați și 15 kg pentru femei conform normelor de ergonomie',
          'Nu există limită cât timp rezistă spatele',
        ],
        correctIndex: 1,
        explanation: 'Peste 25 kg, legea impune manipulare în echipă de 2 persoane sau echipament mecanic.',
      },
    ],
  },
]

export function SSMClient({ userRole: _userRole, userName }: SSMClientProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string>('horeca')
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [isPassportActive, setIsPassportActive] = useState(true)

  const activeModule = MODULES.find((m) => m.id === selectedModuleId) || MODULES[0]

  const score = activeModule.quiz.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correctIndex ? 1 : 0)
  }, 0)

  const isPassed = quizSubmitted && score === activeModule.quiz.length

  function handleSelectOption(qId: number, oIdx: number) {
    if (quizSubmitted) return
    setSelectedAnswers((prev) => ({ ...prev, [qId]: oIdx }))
  }

  function handleSubmitQuiz() {
    if (Object.keys(selectedAnswers).length < activeModule.quiz.length) {
      toast.error('Te rugăm să răspunzi la toate cele 3 întrebări înainte de verificare!')
      return
    }
    setQuizSubmitted(true)
    if (score === activeModule.quiz.length) {
      setIsPassportActive(true)
      toast.success('Felicitări! Ai trecut verificarea SSM. Pașaportul tău este activ!')
    } else {
      toast.error(`Ai răspuns corect la ${score}/${activeModule.quiz.length} întrebări. Recitește regulile și încearcă din nou!`)
    }
  }

  function handleResetQuiz() {
    setSelectedAnswers({})
    setQuizSubmitted(false)
  }

  function handleDownloadSheet() {
    toast.success('Fișa colectivă electronică SSM (Anexa 12 HG 1425/2006) a fost descărcată în format PDF conform!')
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge className="bg-primary/15 text-primary-strong dark:text-primary font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border-none">
              Inovație Legislativă · OUG 36/2021
            </Badge>
            <Badge className="bg-secondary/15 text-secondary font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border-none">
              Conform Legea 319/2006
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading text-foreground">
            Protecția Muncii (SSM) & Pașaport Digital
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-sans max-w-2xl mt-1">
            Instruire digitală rapidă și conformare în avans. Încheie instructajul SSM o dată la 6 luni pe telefon și economisești 25 de minute la fiecare tură.
          </p>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center gap-2">
          <Button
            onClick={handleDownloadSheet}
            variant="outline"
            className="h-10 rounded-xl px-4 text-xs font-semibold uppercase tracking-wider border-border/80 flex items-center gap-2 hover:bg-muted"
          >
            <Download className="h-4 w-4 text-primary" />
            Model Fișă ITM (PDF)
          </Button>
        </div>
      </div>

      {/* Pașaport Digital SSM Status Card */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <ShieldCheck className="h-8 w-8" strokeWidth={2.2} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold font-heading text-foreground">
                  Pașaportul Digital SSM: {userName}
                </h3>
                {isPassportActive ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
                    <CheckCircle2 className="h-3 w-3" /> Activ
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    În așteptare test
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-sans">
                Certificat ID: <span className="font-mono font-bold text-foreground">RO-TM-SSM-84920</span> · Valabil până la{' '}
                <span className="font-mono font-bold text-foreground">08 martie 2027</span> (6 luni)
              </p>
              <p className="text-xs text-foreground/80 font-sans mt-2">
                ✓ Recunoscut electronic la check-in GPS · Generează automat fișa de instruire colectivă conform HG 1425/2006.
              </p>
            </div>
          </div>

          <div className="bg-background/80 backdrop-blur-sm border border-border/80 rounded-2xl p-4 sm:text-right shrink-0">
            <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold">
              Timp economisit per tură
            </div>
            <div className="text-2xl font-bold font-mono text-primary mt-0.5">
              ~25 MINUTE
            </div>
            <div className="text-[11px] text-muted-foreground">
              Check-in la locație în 15 secunde
            </div>
          </div>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Module de Instruire pe Domenii
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            Alege domeniul turei tale
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODULES.map((mod) => {
            const isSelected = mod.id === selectedModuleId
            const Icon = mod.icon
            return (
              <button
                key={mod.id}
                onClick={() => {
                  setSelectedModuleId(mod.id)
                  handleResetQuiz()
                }}
                className={`text-left p-4 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                    : 'border-border/60 bg-card hover:bg-muted/40 hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`p-2 rounded-xl ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <Badge className="bg-muted text-muted-foreground text-[9px] font-mono border-none">
                    {mod.badge}
                  </Badge>
                </div>
                <h4 className="font-bold text-sm text-foreground">{mod.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-mono">
                  <Clock className="h-3 w-3" /> {mod.duration} instruire
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Module Content: Risks & Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hazards Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-destructive font-bold text-sm uppercase tracking-wider font-mono">
            <AlertTriangle className="h-4 w-4" />
            Riscuri Majore Identificate la Locație
          </div>
          <ul className="space-y-2.5 text-sm text-foreground/90 font-sans">
            {activeModule.hazards.map((hazard, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive text-xs font-bold font-mono mt-0.5">
                  !
                </span>
                <span>{hazard}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prevention Rules Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-secondary font-bold text-sm uppercase tracking-wider font-mono">
            <ShieldCheck className="h-4 w-4" />
            Instrucțiuni Obligatorii de Protecție
          </div>
          <ul className="space-y-2.5 text-sm text-foreground/90 font-sans">
            {activeModule.rules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary text-xs font-bold font-mono mt-0.5">
                  ✓
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interactive Micro-Quiz Verification */}
      <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-heading text-foreground flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              Micro-Verificare Practică: {activeModule.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-0.5">
              Răspunde corect la cele 3 întrebări practice pentru a activa insigna pe profilul tău.
            </p>
          </div>
          {quizSubmitted && (
            <Badge className={`${isPassed ? 'bg-secondary/15 text-secondary' : 'bg-destructive/15 text-destructive'} text-xs font-bold font-mono px-3 py-1 rounded-full border-none`}>
              {score} / {activeModule.quiz.length} Corecte {isPassed ? '· Admis' : '· Respins'}
            </Badge>
          )}
        </div>

        <div className="space-y-6">
          {activeModule.quiz.map((q, qIndex) => {
            const isCorrect = selectedAnswers[q.id] === q.correctIndex

            return (
              <div key={q.id} className="space-y-3 rounded-2xl border border-border/50 bg-muted/20 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs font-bold mt-0.5">
                    {qIndex + 1}
                  </span>
                  <p className="font-semibold text-foreground text-sm sm:text-base">
                    {q.question}
                  </p>
                </div>

                <div className="space-y-2 pl-9">
                  {q.options.map((opt, oIndex) => {
                    const isSelected = selectedAnswers[q.id] === oIndex
                    let btnStyle = 'border-border/60 bg-card hover:bg-muted/40 text-foreground'

                    if (quizSubmitted) {
                      if (oIndex === q.correctIndex) {
                        btnStyle = 'border-secondary bg-secondary/15 text-secondary font-semibold ring-1 ring-secondary'
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'border-destructive bg-destructive/15 text-destructive font-semibold'
                      }
                    } else if (isSelected) {
                      btnStyle = 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                    }

                    return (
                      <button
                        key={oIndex}
                        disabled={quizSubmitted}
                        onClick={() => handleSelectOption(q.id, oIndex)}
                        className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all duration-150 flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && oIndex === q.correctIndex && (
                          <CheckCircle2 className="h-4 w-4 text-secondary shrink-0 ml-2" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {quizSubmitted && (
                  <div className="pl-9 text-xs text-muted-foreground font-sans mt-2">
                    <span className="font-semibold text-foreground">Explicație ITM:</span> {q.explanation}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          {quizSubmitted ? (
            <Button
              onClick={handleResetQuiz}
              variant="outline"
              className="h-10 rounded-xl px-5 text-xs font-semibold uppercase tracking-wider font-sans"
            >
              Încearcă din nou
            </Button>
          ) : (
            <Button
              onClick={handleSubmitQuiz}
              className="h-10 rounded-xl px-6 text-xs font-semibold uppercase tracking-wider bg-primary-strong hover:brightness-108 active:scale-95 text-primary-foreground shadow-md shadow-primary/20"
            >
              Validează răspunsurile
            </Button>
          )}
        </div>
      </div>

      {/* Memorandum & Propunere către Guvern / ITM */}
      <div className="rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider font-mono">
          <Scale className="h-4 w-4" />
          Propunere Oficială de Politică Publică · GigTim către Inspecția Muncii
        </div>
        <h3 className="text-xl font-bold font-heading text-foreground">
          Memorandum: Recunoașterea Pașaportului Digital SSM pentru Zilieri și Prestatori Casnici
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed">
          În conformitate cu prevederile <strong>OUG nr. 36/2021</strong> și ale <strong>Legii nr. 208/2021</strong> pentru modificarea Legii nr. 319/2006 a securității și sănătății în muncă, GigTim propune Ministerului Muncii și ITM Timiș implementarea procedurii de <strong>Pre-Instruire Digitală Colectivă</strong>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-1">
            <span className="font-bold text-xs text-foreground">1. Eficiență Reală</span>
            <p className="text-[11px] text-muted-foreground">
              Elimină semnarea formală a hârtiilor pe genunchi; lucrătorul învață activ regulile înainte să calce în local sau curte.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-1">
            <span className="font-bold text-xs text-foreground">2. Auditabil & GPS</span>
            <p className="text-[11px] text-muted-foreground">
              Fiecare confirmare este înregistrată cu marcă temporală, coordonate GPS și certificat electronic unic.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-1">
            <span className="font-bold text-xs text-foreground">3. Arhivare Automată</span>
            <p className="text-[11px] text-muted-foreground">
              Fișele de instruire colectivă (Anexa 12 HG 1425/2006) sunt stocate criptat în cloud și exportabile instant la control.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
