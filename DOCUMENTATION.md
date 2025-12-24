```
# README

# GitScribe: Strumenti per la Generazione di Documentazione Alimentati da AI

## Panoramica

GitScribe è un'applicazione web innovativa progettata per automatizzare la generazione di documentazione completa dai repository GitHub. Sfruttando un sistema di workflow multi-agente intelligente, GitScribe crea documentazione dettagliata e ben strutturata, su misura per le esigenze specifiche di sviluppatori e team. Costruito con tecnologie moderne come React, TypeScript e Vite, lo strumento sfrutta la potenza dei modelli di linguaggio di OpenAI tramite LangChain, consentendo di produrre documentazione in vari formati e lingue, garantendo chiarezza e precisione.

L'applicazione affronta un problema critico nello sviluppo software: mantenere una documentazione aggiornata e completa che rifletta accuratamente lo stato attuale di un codice base. I processi di documentazione tradizionali sono spesso manuali, dispendiosi in termini di tempo e soggetti a diventare obsoleti con l'evolversi dei progetti. GitScribe risolve questo problema analizzando automaticamente la struttura del repository, i modelli di codice, i file di configurazione e le dipendenze per generare documentazione contestualmente rilevante che cresce con il tuo progetto.

L'architettura di GitScribe è costruita su un sofisticato sistema basato su agenti in cui agenti AI specializzati gestiscono diversi aspetti del processo di generazione della documentazione. Questi agenti lavorano in collaborazione per scoprire i contenuti del repository, analizzare la qualità e la struttura del codice, pianificare strategie di documentazione e generare sezioni di documentazione complete. Il sistema supporta più formati di output, inclusi Markdown, HTML, MDX, specifiche OpenAPI e PDF, rendendolo versatile per diverse esigenze di documentazione e piattaforme di pubblicazione.

## Caratteristiche

### Caratteristiche Principali

1. **AgentWorkflow** (src/components/AgentWorkflow.tsx): Gestisce l'esecuzione del workflow dell'agente, coordinando tra diversi agenti. Gestisce le transizioni di stato, il tracciamento dei progressi e la gestione degli errori durante l'intero processo di generazione della documentazione. Il componente si iscrive agli aggiornamenti di stato dall'AgentManager e visualizza i progressi in tempo reale agli utenti.

2. **Agente DocsWriter** (src/lib/agents/DocsWriter.ts): Responsabile della generazione del contenuto effettivo della documentazione. Utilizza RAG (Retrieval-Augmented Generation) per recuperare il contesto del codice rilevante, chiama LangChain con prompt completi e formatta l'output secondo i formati e le sezioni selezionate dall'utente. L'agente genera documentazione estesa (0-8000+ parole) seguendo standard professionali di documentazione.

3. **Agente RepoAnalysis** (src/lib/agents/RepoAnalysis.ts): Analizza la struttura del repository, lo stack tecnologico e i modelli di codice. Fornisce approfondimenti che informano il processo di pianificazione e scrittura della documentazione. L'analisi include il rilevamento del framework, l'identificazione del linguaggio, la valutazione della complessità e l'estrazione delle caratteristiche chiave.

4. **MultiRepoSelector** (src/components/MultiRepoSelector.tsx): Consente agli utenti di selezionare più repository per la generazione della documentazione. Si integra con l'API GitHub per recuperare i repository dell'utente e fornisce un'interfaccia ricercabile e filtrabile per la selezione dei repository. Il componente gestisce lo stato di autenticazione e la gestione dei token.

5. **DocumentationEditor** (src/pages/DocumentationEditor.tsx): Il componente principale per la generazione e la modifica della documentazione. Orchestri l'interazione tra selezione del repository, configurazione del formato e workflow dell'agente. Il componente gestisce viste a schede per più repository e fornisce funzionalità di esportazione per la documentazione generata.

### Funzionalità Avanzate

1. **Integrazione LangChain** (src/lib/langchain-service.ts): Utilizza LangChain come strato di astrazione sull'API di OpenAI, fornendo interfacce coerenti per diversi modelli e consentendo funzionalità come RAG per una maggiore consapevolezza del contesto. Questa integrazione consente la ricerca semantica su codice base, consentendo all'AI di trovare esempi di codice rilevanti e contesto durante la generazione della documentazione.

2. **Implementazione Vector Store** (src/rag/vector-store.ts): Utilizza embedding per consentire la ricerca semantica su codice base. Questa funzionalità consente al sistema di eseguire un recupero efficiente e accurato di frammenti di codice rilevanti e contesto documentale, migliorando la qualità e la rilevanza della documentazione generata.

3. **Modello a Macchina a Stati** (src/lib/agents/Manager.ts): Il sistema di workflow dell'agente utilizza un modello a macchina a stati per gestire il complesso processo multi-step di generazione della documentazione. Ogni agente nel pipeline riceve lo stato attuale, esegue il suo compito specifico e restituisce lo stato aggiornato che fluisce all'agente successivo nella sequenza.

## Installazione/Configurazione

### Prerequisiti

Per configurare GitScribe, assicurati di avere i seguenti prerequisiti:

- **Node.js**: Un runtime JavaScript costruito sul motore JavaScript V8 di Chrome.
- **npm**: Un gestore di pacchetti per JavaScript, incluso con Node.js.
- **Git**: Un sistema di controllo versione distribuito per gestire il tuo codice base.

### Istruzioni di Configurazione Passo-Passo

1. **Clonare il Repository**: Clona il repository GitScribe sulla tua macchina locale usando il seguente comando:
   ```bash
   git clone https://github.com/DimitarHristovski/GitScribe.git
   ```

2. **Installare le Dipendenze**: Naviga nella directory del progetto e installa le dipendenze necessarie:
   ```bash
   cd GitScribe
   npm install
   ```

3. **Configurare le Variabili di Ambiente**: Crea un file `.env` nella directory principale e aggiungi la tua chiave API OpenAI:
   ```plaintext
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Avviare il Server di Sviluppo**: Avvia il server di sviluppo per iniziare a lavorare con GitScribe:
   ```bash
   npm run dev
   ```

5. **Costruire per la Produzione**: Quando sei pronto per il deploy, costruisci l'applicazione per la produzione:
   ```bash
   npm run build
   ```

### Risoluzione dei Problemi

- **Errori di Installazione**: Se incontri errori durante l'installazione, assicurati di avere le versioni corrette di Node.js e npm installate. Puoi controllare le tue versioni con `node -v` e `npm -v`.

- **Problemi con la Chiave API**: Se l'applicazione non riesce a connettersi all'API di OpenAI, ricontrolla la tua chiave API nel file `.env`. Assicurati che non ci siano spazi extra o caratteri errati.

- **Errori di Costruzione**: Se il processo di costruzione fallisce, prova a svuotare la cache di npm e reinstallare le dipendenze:
  ```bash
  npm cache clean --force
  npm install
  ```

## Uso

### Guida Rapida

1. **Seleziona i Repository**: Usa il componente MultiRepoSelector per scegliere i repository che vuoi documentare.

2. **Configura la Documentazione**: Imposta il formato di documentazione e le sezioni preferite nel DocumentationEditor.

3. **Genera la Documentazione**: Avvia il processo di generazione della documentazione tramite il componente AgentWorkflow.

4. **Revisiona ed Edita**: Usa il DocumentationEditor per rivedere e fare eventuali modifiche necessarie alla documentazione generata.

5. **Esporta la Documentazione**: Esporta la documentazione finale nel formato scelto per la distribuzione o la pubblicazione.

### Esempi di Uso Dettagliati

#### Esempio Base

```typescript
import { AgentManager } from './lib/agents/Manager';

const manager = new AgentManager();
manager.startWorkflow();
```

Questo esempio base dimostra come avviare il workflow dell'agente usando la classe `AgentManager`. Il metodo `startWorkflow` inizia il processo di generazione della documentazione.

#### Esempio Avanzato

```typescript
import { DocsWriter } from './lib/agents/DocsWriter';
import { LangChainService } from './lib/langchain-service';

const docsWriter = new DocsWriter();
const langChain = new LangChainService();

docsWriter.generateDocumentation(langChain);
```

In questo esempio avanzato, l'agente `DocsWriter` viene utilizzato in combinazione con il `LangChainService` per generare documentazione con una maggiore consapevolezza del contesto.

#### Esempio di Gestione degli Errori

```typescript
try {
  const manager = new AgentManager();
  manager.startWorkflow();
} catch (error) {
  console.error('Errore durante l'esecuzione del workflow:', error);
}
```

Questo esempio mostra come gestire gli errori durante l'esecuzione del workflow, assicurandosi che eventuali problemi vengano registrati per scopi di debugging.

## Esempi di API/Funzione

### `fetchGitHubFile`

- **Parametri**:
  - `filePath: string`: Il percorso del file nel repository GitHub.
  - `repoName: string`: Il nome del repository.

- **Restituisce**: Una promessa che si risolve con il contenuto del file.

- **Esempio di Uso**:
  ```typescript
  fetchGitHubFile('README.md', 'DimitarHristovski/GitScribe')
    .then(content => console.log(content))
    .catch(error => console.error(error));
  ```

### `listGitHubContents`

- **Parametri**:
  - `directoryPath: string`: Il percorso della directory nel repository GitHub.
  - `repoName: string`: Il nome del repository.

- **Restituisce**: Una promessa che si risolve con un array di nomi di file e directory.

- **Esempio di Uso**:
  ```typescript
  listGitHubContents('src', 'DimitarHristovski/GitScribe')
    .then(contents => console.log(contents))
    .catch(error => console.error(error));
  ```

## Configurazione

### Variabili di Ambiente

| Variabile         | Richiesto | Descrizione                        |
|------------------|----------|------------------------------------|
| OPENAI_API_KEY   | Sì       | La tua chiave API OpenAI per accedere all'API. |

### Configurazione del Token GitHub

1. **Genera un Token GitHub**: Visita [GitHub Settings](https://github.com/settings/tokens) per creare un nuovo token di accesso personale.

2. **Imposta il Token**: Aggiungi il token al tuo file `.env`:
   ```plaintext
   GITHUB_TOKEN=your_github_token
   ```

## Panoramica Architetturale

### Progettazione del Sistema

GitScribe è progettato come un'applicazione lato client senza server di backend richiesto. Si integra direttamente con le API GitHub e OpenAI per eseguire le sue operazioni. L'architettura è modulare, con ogni componente responsabile di una parte specifica del workflow. Questa scelta di design garantisce che gli utenti mantengano il pieno controllo sulle loro chiavi API e dati, con tutta l'elaborazione che avviene nell'ambiente del browser.

L'applicazione segue un modello di flusso di dati unidirezionale, dove lo stato fluisce verso il basso attraverso i componenti e gli eventi fluiscono verso l'alto. Il sistema di workflow dell'agente utilizza un modello a macchina a stati per gestire il complesso processo multi-step di generazione della documentazione. Ogni agente nel pipeline riceve lo stato attuale, esegue il suo compito specifico e restituisce lo stato aggiornato che fluisce all'agente successivo nella sequenza.

### Relazioni tra Componenti

- **AgentManager**: La classe principale di orchestrazione che gestisce l'esecuzione del workflow degli agenti. Mantiene la macchina a stati degli agenti, coordina l'esecuzione degli agenti e gestisce le transizioni tra i passaggi del workflow. Il Manager utilizza il grafo degli agenti per determinare l'ordine di esecuzione e le dipendenze.

- **Agente DocsWriter**: Responsabile della generazione del contenuto effettivo della documentazione. Usa RAG per recuperare il contesto del codice rilevante, chiama LangChain con prompt completi e formatta l'output secondo i formati e le sezioni selezionate dall'utente. L'agente genera documentazione estesa (0-8000+ parole) seguendo standard professionali di documentazione.

- **Agente RepoAnalysis**: Analizza la struttura del repository, lo stack tecnologico e i modelli di codice. Fornisce approfondimenti che informano il processo di pianificazione e scrittura della documentazione. L'analisi include il rilevamento del framework, l'identificazione del linguaggio, la valutazione della complessità e l'estrazione delle caratteristiche chiave.

### Struttura del Progetto

```
src/
├── components/          # Componenti React riutilizzabili
│   ├── AgentWorkflow.tsx
│   ├── Assistant.tsx
│   ├── Footer.tsx
│   └── MultiRepoSelector.tsx
├── lib/                 # Logica di business principale
│   ├── agents/          # Implementazioni degli agenti AI
│   │   ├── Manager.ts
│   │   ├── RepoDiscovery.ts
│   │   ├── RepoAnalysis.ts
│   │   ├── DocsPlanner.ts
│   │   ├── DocsWriter.ts
│   │   └── GitOps.ts
│   ├── documentation-writer.ts
│   ├── format-generators.ts
│   ├── github-service.ts
│   ├── langchain-service.ts
│   ├── pdf-exporter.ts
│   ├── translations.ts
│   └── url-importer.ts
├── pages/
│   ├── DocumentationEditor.tsx
│   ├── InfoPage.tsx
│   └── Landing.tsx
├── rag/
│   ├── chunker.ts
│   ├── embedder.ts
│   ├── index.ts
│   ├── retriever.ts
│   ├── types.ts
│   └── vector-store.ts
├── types/
│   ├── core.ts
│   └── index.ts
├── App.tsx
├── index.css
├── main.tsx
└── vite-env.d.ts
```

## Contributi

### Linee Guida per i Contributori

1. **Fork del Repository**: Crea una copia personale del repository cliccando sul pulsante "Fork" su GitHub.

2. **Crea un Branch per la Feature**: Usa il seguente comando per creare un nuovo branch per la tua feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Commetti le Tue Modifiche**: Dopo aver apportato modifiche, commettili con un messaggio descrittivo:
   ```bash
   git commit -m "Add feature: your-feature-name"
   ```

4. **Push al Tuo Branch**: Esegui il push delle modifiche al tuo repository forkato:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Apri una Pull Request**: Naviga al repository originale e apri una pull request per unire le tue modifiche.

### Standard di Sviluppo

- **Migliori Pratiche TypeScript**: Assicura la sicurezza dei tipi e la chiarezza utilizzando efficacemente le funzionalità di TypeScript.
- **Componenti Funzionali**: Usa componenti funzionali in React per una migliore performance e leggibilità.
- **Commenti al Codice**: Fornisci commenti chiari e concisi per spiegare logiche e decisioni complesse.
- **Documentazione**: Mantieni documentazione aggiornata per tutte le funzionalità e i componenti.
- **Testing**: Scrivi test unitari e di integrazione per garantire la qualità e l'affidabilità del codice.

## Licenza

GitScribe è concesso in licenza sotto la Licenza MIT. Sei libero di usare, modificare e distribuire questo software, a condizione che includi la licenza originale e l'attribuzione.

## Sezioni Aggiuntive

### FAQ

- **Q1: Come imposto la chiave API di OpenAI?**
  A1: Crea un file `.env` nella directory principale e aggiungi la tua chiave API OpenAI come `OPENAI_API_KEY=your_openai_api_key`.

- **Q2: Posso usare GitScribe con repository privati?**
  A2: Sì, puoi usare GitScribe con repository privati fornendo un token GitHub con le autorizzazioni necessarie.

- **Q3: Quali formati supporta GitScribe per l'esportazione della documentazione?**
  A3: GitScribe supporta più formati, inclusi Markdown, HTML, MDX, specifiche OpenAPI e PDF.

- **Q4: Come gestisce GitScribe i grandi repository?**
  A4: GitScribe utilizza un'implementazione vector store per gestire efficientemente i grandi repository consentendo la ricerca semantica su codice base.

- **Q5: C'è un limite al numero di repository che posso documentare contemporaneamente?**
  A5: Non c'è un limite rigido, ma le prestazioni possono variare in base alla dimensione e complessità dei repository.

### Risoluzione dei Problemi

- **Problemi di Connessione API**: Assicurati che la tua connessione internet sia stabile e che le tue chiavi API siano configurate correttamente nel file `.env`.

- **Errori di Autenticazione**: Verifica che il tuo token GitHub abbia le autorizzazioni necessarie per accedere ai repository che vuoi documentare.

- **Problemi di Prestazioni**: Se l'applicazione è lenta, considera di aumentare le risorse del tuo sistema o di ottimizzare la struttura del repository.

### Problemi Noti

- **Limitazioni nell'Esportazione PDF**: La funzione di esportazione PDF potrebbe non supportare completamente tutte le funzionalità Markdown, portando a discrepanze di formattazione.

- **Timeout del Workflow**: Grandi repository possono causare il timeout del workflow. Considera di suddividere il processo di documentazione in parti più piccole.

- **Problemi di CORS**: Assicurati che le impostazioni del tuo browser consentano richieste cross-origin se incontri errori relativi a CORS.

### Roadmap

- **Supporto Linguistico Migliorato**: Piani per migliorare il supporto linguistico per la generazione della documentazione, consentendo traduzioni e localizzazioni più accurate.

- **Modelli AI Potenziati**: Futuri aggiornamenti includeranno l'integrazione con nuovi modelli AI per migliorare la qualità e la rilevanza della documentazione generata.

- **Miglioramenti all'Interfaccia Utente**: Sforzi continui per perfezionare l'interfaccia utente per un'esperienza più intuitiva e senza soluzione di continuità.

Questa documentazione completa fornisce una panoramica dettagliata di GitScribe, le sue funzionalità, configurazione, utilizzo e architettura. Seguendo le linee guida e gli esempi forniti, gli utenti possono sfruttare efficacemente GitScribe per automatizzare i loro processi di documentazione e mantenere una documentazione aggiornata e di alta qualità per i loro progetti.
```