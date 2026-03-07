"use strict";
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  QANTUM v23.3.0 - i18n Manager                                          ║
// ║  "Type-Safe Sovereign" - Международна поддръжка                              ║
// ║  Internationalization system with BG/EN/DE/FR/CN/JP support                  ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
Object.defineProperty(exports, "__esModule", { value: true });
exports.translations = exports.i18n = exports.I18nManager = exports.jp = exports.cn = exports.fr = exports.de = exports.en = exports.bg = void 0;
// ══════════════════════════════════════════════════════════════════════════════
// BULGARIAN TRANSLATIONS (DEFAULT)
// ══════════════════════════════════════════════════════════════════════════════
exports.bg = {
    header: {
        title: 'QANTUM',
        codename: 'v23.0.0 "Локалният Суверен"',
        lines: 'Редове:',
        tests: 'Тестове:',
        modules: 'Модули:',
    },
    sidebar: {
        freeFeatures: '🆓 Безплатни функции',
        proFeatures: '💎 Pro функции',
        enterprise: '🏢 Enterprise',
        utilities: '🛠️ Инструменти',
    },
    modules: {
        websiteAudit: 'Одит на сайт',
        apiTest: 'API Тест',
        linkChecker: 'Проверка линкове',
        predictionMatrix: 'Матрица прогнози',
        apiSensei: 'API Sensei',
        chronosEngine: 'Chronos двигател',
        thermalPool: 'Термален пул',
        dockerManager: 'Docker мениджър',
        swarmCommander: 'Swarm командир',
        bulgarianTts: 'Български TTS',
        licenseManager: 'Лицензен мениджър',
        systemStats: 'Системна статистика',
        logger: 'Логър',
    },
    badges: {
        free: 'БЕЗПЛ.',
        pro: 'PRO',
        proRequired: 'ИЗИСКВА PRO ЛИЦЕНЗ',
    },
    panels: {
        audit: {
            title: '🔍 Одит на уебсайт',
            subtitle: 'mm.audit(url) → AuditResult',
            urlLabel: 'URL за одит',
            runButton: '▶️ Стартирай одит',
            performance: 'Производителност',
            accessibility: 'Достъпност',
            seo: 'SEO',
        },
        apiTest: {
            title: '🌐 API Тест',
            subtitle: 'mm.testAPI(endpoint, options) → APITestResult',
            endpointLabel: 'API Endpoint',
            methodLabel: 'Метод',
            runButton: '▶️ Тествай API',
        },
        linkChecker: {
            title: '🔗 Проверка на линкове',
            subtitle: 'mm.checkLinks(url, options) → CheckLinksResult',
            urlLabel: 'URL на страница',
            maxLinksLabel: 'Макс. линкове за проверка',
            runButton: '▶️ Провери линкове',
        },
        prediction: {
            title: '🔮 Матрица за прогнози',
            subtitle: 'mm.predict(options) → PredictionResult',
            codeLabel: 'Промени в кода (diff или съдържание)',
            runButton: '▶️ Анализирай и предскажи',
            description: 'Анализира промените в кода и прогнозира потенциални провали на тестове.',
        },
        apiSensei: {
            title: '🤖 API Sensei',
            subtitle: 'mm.apiSensei(config) → APISenseiResult',
            baseUrlLabel: 'Базов API URL',
            scenariosLabel: 'Тестови сценарии',
            runButton: '▶️ Генерирай и изпълни тестове',
            scenarios: {
                happyPath: 'Щастлив път',
                edgeCases: 'Гранични случаи',
                errorHandling: 'Обработка грешки',
                security: 'Сигурност',
                performance: 'Производителност',
            },
        },
        chronos: {
            title: '⏰ Chronos двигател',
            subtitle: 'mm.chronos(options) → ChronosResult',
            description: 'Дебъгване с пътуване във времето: Записва моментни снимки по време на изпълнение.',
            intervalLabel: 'Интервал на снимки (ms)',
            maxSnapshotsLabel: 'Макс. снимки',
            runButton: '▶️ Започни запис',
        },
        thermal: {
            title: '🌡️ Термален пул',
            subtitle: 'ThermalAwarePool - Управление на CPU температура',
            description: 'Автоматично регулира паралелизма според температурата на процесора.',
            states: {
                cool: '🟢 ХЛАДНО',
                warm: '🔵 ТОПЛО',
                hot: '🟠 ГОРЕЩО',
                critical: '🔴 КРИТИЧНО',
            },
            temperature: 'Температура',
            maxInstances: 'Макс. инстанции',
        },
        docker: {
            title: '🐳 Docker мениджър',
            subtitle: 'DockerManager - Selenium Grid оркестрация',
            description: 'Автоматично генерира Dockerfile и docker-compose.yml за Selenium Grid.',
        },
        swarm: {
            title: '🎖️ Swarm командир',
            subtitle: 'SwarmCommander - Commander-Soldier шаблон',
            description: 'Командирът разпределя задачите между войниците (browser instances) за паралелно изпълнение.',
        },
        tts: {
            title: '🔊 Български TTS',
            subtitle: 'BulgarianTTS - Роден текст-към-реч',
            description: '🇧🇬 Български текст-към-реч за гласова обратна връзка по време на тестове.',
            templates: {
                testPassed: '"Тестът премина успешно"',
                testFailed: '"Тестът се провали"',
                errorFound: '"Открих грешка в {element}"',
                healing: '"Намерих нов селектор"',
            },
        },
        license: {
            title: '🔐 Лицензен мениджър',
            subtitle: 'LicenseManager - Хардуерно заключен лиценз',
            description: 'Лицензът се привързва към хардуера с SHA-256 отпечатък.',
            types: {
                trial: 'Пробен',
                professional: 'Професионален',
                enterprise: 'Ентърпрайз',
                sovereign: 'Суверен',
            },
            maxInstances: 'Макс. инстанции',
            features: 'Функции',
        },
        stats: {
            title: '📊 Системна статистика',
            subtitle: 'getSystemStats() → Statistics',
            version: 'Версия',
            linesOfCode: 'Редове код',
            typescriptFiles: 'TypeScript файлове',
            testsPassing: 'Минаващи тестове',
            enterpriseModules: 'Enterprise модули',
            codename: 'Кодово име',
        },
        logger: {
            title: '📋 Структуриран логър',
            subtitle: 'mm.getLogger() → Logger',
            description: 'Професионално логване с нива: debug, info, warn, error, audit',
        },
    },
    status: {
        systemStatus: '📡 Системен статус',
        backend: 'Backend',
        license: 'Лиценз',
        circuitBreaker: 'Circuit Breaker',
        online: 'Онлайн',
        offline: 'Офлайн',
        closed: 'Затворен',
        open: 'Отворен',
        cpuTemperature: '🌡️ CPU температура',
        state: 'Състояние:',
        financialOracle: '💰 Финансов оракул',
        totalCost: 'Общи разходи',
        requests: 'Заявки',
        budgetLeft: 'Оставащ бюджет',
        activityLog: '📜 Дневник на активността',
        waitingForActivity: 'Изчакване на активност...',
        checking: 'Проверка...',
        freeTier: 'Безплатен план',
    },
    common: {
        loading: 'Зареждане...',
        processing: 'Обработка...',
        complete: 'Завършено!',
        error: 'Грешка',
        success: 'Успех',
        warning: 'Предупреждение',
        opened: 'Отворено:',
        initialized: 'QAntum v23.0.0 UI инициализиран',
        madeInBulgaria: '🇧🇬 Направено с ❤️ в България',
    },
    footer: {
        copyright: '© 2025 Димитър Продромов',
    },
};
// ══════════════════════════════════════════════════════════════════════════════
// ENGLISH TRANSLATIONS
// ══════════════════════════════════════════════════════════════════════════════
exports.en = {
    header: {
        title: 'QANTUM',
        codename: 'v23.0.0 "The Local Sovereign"',
        lines: 'Lines:',
        tests: 'Tests:',
        modules: 'Modules:',
    },
    sidebar: {
        freeFeatures: '🆓 Free Features',
        proFeatures: '💎 Pro Features',
        enterprise: '🏢 Enterprise',
        utilities: '🛠️ Utilities',
    },
    modules: {
        websiteAudit: 'Website Audit',
        apiTest: 'API Test',
        linkChecker: 'Link Checker',
        predictionMatrix: 'Prediction Matrix',
        apiSensei: 'API Sensei',
        chronosEngine: 'Chronos Engine',
        thermalPool: 'Thermal Pool',
        dockerManager: 'Docker Manager',
        swarmCommander: 'Swarm Commander',
        bulgarianTts: 'Bulgarian TTS',
        licenseManager: 'License Manager',
        systemStats: 'System Stats',
        logger: 'Logger',
    },
    badges: {
        free: 'FREE',
        pro: 'PRO',
        proRequired: 'PRO LICENSE REQUIRED',
    },
    panels: {
        audit: {
            title: '🔍 Website Audit',
            subtitle: 'mm.audit(url) → AuditResult',
            urlLabel: 'URL to Audit',
            runButton: '▶️ Run Audit',
            performance: 'Performance',
            accessibility: 'Accessibility',
            seo: 'SEO',
        },
        apiTest: {
            title: '🌐 API Test',
            subtitle: 'mm.testAPI(endpoint, options) → APITestResult',
            endpointLabel: 'API Endpoint',
            methodLabel: 'Method',
            runButton: '▶️ Test API',
        },
        linkChecker: {
            title: '🔗 Link Checker',
            subtitle: 'mm.checkLinks(url, options) → CheckLinksResult',
            urlLabel: 'Page URL',
            maxLinksLabel: 'Max Links to Check',
            runButton: '▶️ Check Links',
        },
        prediction: {
            title: '🔮 Prediction Matrix',
            subtitle: 'mm.predict(options) → PredictionResult',
            codeLabel: 'Code Changes (diff or content)',
            runButton: '▶️ Analyze & Predict',
            description: 'Analyzes code changes and predicts potential test failures.',
        },
        apiSensei: {
            title: '🤖 API Sensei',
            subtitle: 'mm.apiSensei(config) → APISenseiResult',
            baseUrlLabel: 'Base API URL',
            scenariosLabel: 'Test Scenarios',
            runButton: '▶️ Generate & Run Tests',
            scenarios: {
                happyPath: 'Happy Path',
                edgeCases: 'Edge Cases',
                errorHandling: 'Error Handling',
                security: 'Security',
                performance: 'Performance',
            },
        },
        chronos: {
            title: '⏰ Chronos Engine',
            subtitle: 'mm.chronos(options) → ChronosResult',
            description: 'Time-travel debugging: Records state snapshots during test execution.',
            intervalLabel: 'Snapshot Interval (ms)',
            maxSnapshotsLabel: 'Max Snapshots',
            runButton: '▶️ Start Recording',
        },
        thermal: {
            title: '🌡️ Thermal-Aware Pool',
            subtitle: 'ThermalAwarePool - CPU temperature management',
            description: 'Automatically adjusts parallelism based on CPU temperature to prevent throttling.',
            states: {
                cool: '🟢 COOL',
                warm: '🔵 WARM',
                hot: '🟠 HOT',
                critical: '🔴 CRITICAL',
            },
            temperature: 'Temperature',
            maxInstances: 'Max Instances',
        },
        docker: {
            title: '🐳 Docker Manager',
            subtitle: 'DockerManager - Selenium Grid orchestration',
            description: 'Auto-generates Dockerfile and docker-compose.yml for Selenium Grid.',
        },
        swarm: {
            title: '🎖️ Swarm Commander',
            subtitle: 'SwarmCommander - Commander-Soldier pattern',
            description: 'Commander distributes tasks to soldiers (browser instances) for parallel execution.',
        },
        tts: {
            title: '🔊 Bulgarian TTS',
            subtitle: 'BulgarianTTS - Native text-to-speech',
            description: '🇧🇬 Български текст-към-реч за гласова обратна връзка по време на тестове.',
            templates: {
                testPassed: '"Тестът премина успешно"',
                testFailed: '"Тестът се провали"',
                errorFound: '"Открих грешка в {element}"',
                healing: '"Намерих нов селектор"',
            },
        },
        license: {
            title: '🔐 License Manager',
            subtitle: 'LicenseManager - Hardware-locked licensing',
            description: 'License is bound to hardware using SHA-256 fingerprint.',
            types: {
                trial: 'Trial',
                professional: 'Professional',
                enterprise: 'Enterprise',
                sovereign: 'Sovereign',
            },
            maxInstances: 'Max Instances',
            features: 'Features',
        },
        stats: {
            title: '📊 System Stats',
            subtitle: 'getSystemStats() → Statistics',
            version: 'Version',
            linesOfCode: 'Lines of Code',
            typescriptFiles: 'TypeScript Files',
            testsPassing: 'Tests Passing',
            enterpriseModules: 'Enterprise Modules',
            codename: 'Codename',
        },
        logger: {
            title: '📋 Structured Logger',
            subtitle: 'mm.getLogger() → Logger',
            description: 'Professional logging with levels: debug, info, warn, error, audit',
        },
    },
    status: {
        systemStatus: '📡 System Status',
        backend: 'Backend',
        license: 'License',
        circuitBreaker: 'Circuit Breaker',
        online: 'Online',
        offline: 'Offline',
        closed: 'Closed',
        open: 'Open',
        cpuTemperature: '🌡️ CPU Temperature',
        state: 'State:',
        financialOracle: '💰 Financial Oracle',
        totalCost: 'Total Cost',
        requests: 'Requests',
        budgetLeft: 'Budget Left',
        activityLog: '📜 Activity Log',
        waitingForActivity: 'Waiting for activity...',
        checking: 'Checking...',
        freeTier: 'Free Tier',
    },
    common: {
        loading: 'Loading...',
        processing: 'Processing...',
        complete: 'Complete!',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        opened: 'Opened:',
        initialized: 'QAntum v23.0.0 UI initialized',
        madeInBulgaria: '🇧🇬 Made with ❤️ in Bulgaria',
    },
    footer: {
        copyright: '© 2025 Dimitar Prodromov',
    },
};
// ══════════════════════════════════════════════════════════════════════════════
// GERMAN TRANSLATIONS
// ══════════════════════════════════════════════════════════════════════════════
exports.de = {
    header: {
        title: 'QANTUM',
        codename: 'v23.0.0 "Der Lokale Souverän"',
        lines: 'Zeilen:',
        tests: 'Tests:',
        modules: 'Module:',
    },
    sidebar: {
        freeFeatures: '🆓 Kostenlose Funktionen',
        proFeatures: '💎 Pro-Funktionen',
        enterprise: '🏢 Unternehmen',
        utilities: '🛠️ Werkzeuge',
    },
    modules: {
        websiteAudit: 'Website-Audit',
        apiTest: 'API-Test',
        linkChecker: 'Link-Prüfer',
        predictionMatrix: 'Vorhersage-Matrix',
        apiSensei: 'API Sensei',
        chronosEngine: 'Chronos-Motor',
        thermalPool: 'Thermal-Pool',
        dockerManager: 'Docker-Manager',
        swarmCommander: 'Schwarm-Kommandant',
        bulgarianTts: 'Bulgarische TTS',
        licenseManager: 'Lizenz-Manager',
        systemStats: 'Systemstatistik',
        logger: 'Logger',
    },
    badges: {
        free: 'KOSTENLOS',
        pro: 'PRO',
        proRequired: 'PRO-LIZENZ ERFORDERLICH',
    },
    panels: {
        audit: {
            title: '🔍 Website-Audit',
            subtitle: 'mm.audit(url) → AuditResult',
            urlLabel: 'URL zum Prüfen',
            runButton: '▶️ Audit starten',
            performance: 'Leistung',
            accessibility: 'Barrierefreiheit',
            seo: 'SEO',
        },
        apiTest: {
            title: '🌐 API-Test',
            subtitle: 'mm.testAPI(endpoint, options) → APITestResult',
            endpointLabel: 'API-Endpunkt',
            methodLabel: 'Methode',
            runButton: '▶️ API testen',
        },
        linkChecker: {
            title: '🔗 Link-Prüfer',
            subtitle: 'mm.checkLinks(url, options) → CheckLinksResult',
            urlLabel: 'Seiten-URL',
            maxLinksLabel: 'Max. zu prüfende Links',
            runButton: '▶️ Links prüfen',
        },
        prediction: {
            title: '🔮 Vorhersage-Matrix',
            subtitle: 'mm.predict(options) → PredictionResult',
            codeLabel: 'Code-Änderungen (Diff oder Inhalt)',
            runButton: '▶️ Analysieren & Vorhersagen',
            description: 'Analysiert Code-Änderungen und sagt potenzielle Testfehler voraus.',
        },
        apiSensei: {
            title: '🤖 API Sensei',
            subtitle: 'mm.apiSensei(config) → APISenseiResult',
            baseUrlLabel: 'Basis-API-URL',
            scenariosLabel: 'Testszenarien',
            runButton: '▶️ Tests generieren & ausführen',
            scenarios: {
                happyPath: 'Idealer Pfad',
                edgeCases: 'Grenzfälle',
                errorHandling: 'Fehlerbehandlung',
                security: 'Sicherheit',
                performance: 'Leistung',
            },
        },
        chronos: {
            title: '⏰ Chronos-Motor',
            subtitle: 'mm.chronos(options) → ChronosResult',
            description: 'Zeitreise-Debugging: Zeichnet Zustandsschnappschüsse während der Testausführung auf.',
            intervalLabel: 'Schnappschuss-Intervall (ms)',
            maxSnapshotsLabel: 'Max. Schnappschüsse',
            runButton: '▶️ Aufnahme starten',
        },
        thermal: {
            title: '🌡️ Thermalbewusster Pool',
            subtitle: 'ThermalAwarePool - CPU-Temperaturverwaltung',
            description: 'Passt die Parallelität automatisch basierend auf der CPU-Temperatur an.',
            states: {
                cool: '🟢 KÜHL',
                warm: '🔵 WARM',
                hot: '🟠 HEIß',
                critical: '🔴 KRITISCH',
            },
            temperature: 'Temperatur',
            maxInstances: 'Max. Instanzen',
        },
        docker: {
            title: '🐳 Docker-Manager',
            subtitle: 'DockerManager - Selenium Grid-Orchestrierung',
            description: 'Generiert automatisch Dockerfile und docker-compose.yml für Selenium Grid.',
        },
        swarm: {
            title: '🎖️ Schwarm-Kommandant',
            subtitle: 'SwarmCommander - Kommandant-Soldat-Muster',
            description: 'Der Kommandant verteilt Aufgaben an Soldaten (Browser-Instanzen) zur parallelen Ausführung.',
        },
        tts: {
            title: '🔊 Bulgarische TTS',
            subtitle: 'BulgarianTTS - Native Sprachsynthese',
            description: '🇧🇬 Български текст-към-реч за гласова обратна връзка по време на тестове.',
            templates: {
                testPassed: '"Тестът премина успешно"',
                testFailed: '"Тестът се провали"',
                errorFound: '"Открих грешка в {element}"',
                healing: '"Намерих нов селектор"',
            },
        },
        license: {
            title: '🔐 Lizenz-Manager',
            subtitle: 'LicenseManager - Hardware-gebundene Lizenzierung',
            description: 'Lizenz ist mit SHA-256-Fingerabdruck an Hardware gebunden.',
            types: {
                trial: 'Testversion',
                professional: 'Professionell',
                enterprise: 'Unternehmen',
                sovereign: 'Souverän',
            },
            maxInstances: 'Max. Instanzen',
            features: 'Funktionen',
        },
        stats: {
            title: '📊 Systemstatistik',
            subtitle: 'getSystemStats() → Statistics',
            version: 'Version',
            linesOfCode: 'Codezeilen',
            typescriptFiles: 'TypeScript-Dateien',
            testsPassing: 'Erfolgreiche Tests',
            enterpriseModules: 'Enterprise-Module',
            codename: 'Codename',
        },
        logger: {
            title: '📋 Strukturierter Logger',
            subtitle: 'mm.getLogger() → Logger',
            description: 'Professionelles Logging mit Stufen: debug, info, warn, error, audit',
        },
    },
    status: {
        systemStatus: '📡 Systemstatus',
        backend: 'Backend',
        license: 'Lizenz',
        circuitBreaker: 'Circuit Breaker',
        online: 'Online',
        offline: 'Offline',
        closed: 'Geschlossen',
        open: 'Offen',
        cpuTemperature: '🌡️ CPU-Temperatur',
        state: 'Zustand:',
        financialOracle: '💰 Finanz-Orakel',
        totalCost: 'Gesamtkosten',
        requests: 'Anfragen',
        budgetLeft: 'Restbudget',
        activityLog: '📜 Aktivitätsprotokoll',
        waitingForActivity: 'Warte auf Aktivität...',
        checking: 'Prüfe...',
        freeTier: 'Kostenlose Stufe',
    },
    common: {
        loading: 'Lädt...',
        processing: 'Verarbeitung...',
        complete: 'Abgeschlossen!',
        error: 'Fehler',
        success: 'Erfolg',
        warning: 'Warnung',
        opened: 'Geöffnet:',
        initialized: 'QAntum v23.0.0 UI initialisiert',
        madeInBulgaria: '🇧🇬 Mit ❤️ in Bulgarien hergestellt',
    },
    footer: {
        copyright: '© 2025 Dimitar Prodromow',
    },
};
// ══════════════════════════════════════════════════════════════════════════════
// FRENCH TRANSLATIONS
// ══════════════════════════════════════════════════════════════════════════════
exports.fr = {
    header: {
        title: 'QANTUM',
        codename: 'v23.0.0 "Le Souverain Local"',
        lines: 'Lignes:',
        tests: 'Tests:',
        modules: 'Modules:',
    },
    sidebar: {
        freeFeatures: '🆓 Fonctionnalités gratuites',
        proFeatures: '💎 Fonctionnalités Pro',
        enterprise: '🏢 Entreprise',
        utilities: '🛠️ Utilitaires',
    },
    modules: {
        websiteAudit: 'Audit de site',
        apiTest: 'Test API',
        linkChecker: 'Vérificateur de liens',
        predictionMatrix: 'Matrice de prédiction',
        apiSensei: 'API Sensei',
        chronosEngine: 'Moteur Chronos',
        thermalPool: 'Pool thermique',
        dockerManager: 'Gestionnaire Docker',
        swarmCommander: 'Commandant d\'essaim',
        bulgarianTts: 'TTS Bulgare',
        licenseManager: 'Gestionnaire de licence',
        systemStats: 'Statistiques système',
        logger: 'Journal',
    },
    badges: {
        free: 'GRATUIT',
        pro: 'PRO',
        proRequired: 'LICENCE PRO REQUISE',
    },
    panels: {
        audit: {
            title: '🔍 Audit de site web',
            subtitle: 'mm.audit(url) → AuditResult',
            urlLabel: 'URL à auditer',
            runButton: '▶️ Lancer l\'audit',
            performance: 'Performance',
            accessibility: 'Accessibilité',
            seo: 'SEO',
        },
        apiTest: {
            title: '🌐 Test API',
            subtitle: 'mm.testAPI(endpoint, options) → APITestResult',
            endpointLabel: 'Point de terminaison API',
            methodLabel: 'Méthode',
            runButton: '▶️ Tester l\'API',
        },
        linkChecker: {
            title: '🔗 Vérificateur de liens',
            subtitle: 'mm.checkLinks(url, options) → CheckLinksResult',
            urlLabel: 'URL de la page',
            maxLinksLabel: 'Liens max. à vérifier',
            runButton: '▶️ Vérifier les liens',
        },
        prediction: {
            title: '🔮 Matrice de prédiction',
            subtitle: 'mm.predict(options) → PredictionResult',
            codeLabel: 'Modifications de code (diff ou contenu)',
            runButton: '▶️ Analyser et prédire',
            description: 'Analyse les modifications de code et prédit les échecs de test potentiels.',
        },
        apiSensei: {
            title: '🤖 API Sensei',
            subtitle: 'mm.apiSensei(config) → APISenseiResult',
            baseUrlLabel: 'URL API de base',
            scenariosLabel: 'Scénarios de test',
            runButton: '▶️ Générer et exécuter les tests',
            scenarios: {
                happyPath: 'Chemin idéal',
                edgeCases: 'Cas limites',
                errorHandling: 'Gestion des erreurs',
                security: 'Sécurité',
                performance: 'Performance',
            },
        },
        chronos: {
            title: '⏰ Moteur Chronos',
            subtitle: 'mm.chronos(options) → ChronosResult',
            description: 'Débogage temporel: Enregistre des instantanés d\'état pendant l\'exécution des tests.',
            intervalLabel: 'Intervalle d\'instantané (ms)',
            maxSnapshotsLabel: 'Instantanés max.',
            runButton: '▶️ Démarrer l\'enregistrement',
        },
        thermal: {
            title: '🌡️ Pool thermique',
            subtitle: 'ThermalAwarePool - Gestion de la température CPU',
            description: 'Ajuste automatiquement le parallélisme en fonction de la température du processeur.',
            states: {
                cool: '🟢 FRAIS',
                warm: '🔵 TIÈDE',
                hot: '🟠 CHAUD',
                critical: '🔴 CRITIQUE',
            },
            temperature: 'Température',
            maxInstances: 'Instances max.',
        },
        docker: {
            title: '🐳 Gestionnaire Docker',
            subtitle: 'DockerManager - Orchestration Selenium Grid',
            description: 'Génère automatiquement Dockerfile et docker-compose.yml pour Selenium Grid.',
        },
        swarm: {
            title: '🎖️ Commandant d\'essaim',
            subtitle: 'SwarmCommander - Modèle Commandant-Soldat',
            description: 'Le commandant distribue les tâches aux soldats (instances de navigateur) pour l\'exécution parallèle.',
        },
        tts: {
            title: '🔊 TTS Bulgare',
            subtitle: 'BulgarianTTS - Synthèse vocale native',
            description: '🇧🇬 Български текст-към-реч за гласова обратна връзка по време на тестове.',
            templates: {
                testPassed: '"Тестът премина успешно"',
                testFailed: '"Тестът се провали"',
                errorFound: '"Открих грешка в {element}"',
                healing: '"Намерих нов селектор"',
            },
        },
        license: {
            title: '🔐 Gestionnaire de licence',
            subtitle: 'LicenseManager - Licence liée au matériel',
            description: 'La licence est liée au matériel avec une empreinte SHA-256.',
            types: {
                trial: 'Essai',
                professional: 'Professionnel',
                enterprise: 'Entreprise',
                sovereign: 'Souverain',
            },
            maxInstances: 'Instances max.',
            features: 'Fonctionnalités',
        },
        stats: {
            title: '📊 Statistiques système',
            subtitle: 'getSystemStats() → Statistics',
            version: 'Version',
            linesOfCode: 'Lignes de code',
            typescriptFiles: 'Fichiers TypeScript',
            testsPassing: 'Tests réussis',
            enterpriseModules: 'Modules Enterprise',
            codename: 'Nom de code',
        },
        logger: {
            title: '📋 Journal structuré',
            subtitle: 'mm.getLogger() → Logger',
            description: 'Journalisation professionnelle avec niveaux: debug, info, warn, error, audit',
        },
    },
    status: {
        systemStatus: '📡 État du système',
        backend: 'Backend',
        license: 'Licence',
        circuitBreaker: 'Disjoncteur',
        online: 'En ligne',
        offline: 'Hors ligne',
        closed: 'Fermé',
        open: 'Ouvert',
        cpuTemperature: '🌡️ Température CPU',
        state: 'État:',
        financialOracle: '💰 Oracle financier',
        totalCost: 'Coût total',
        requests: 'Requêtes',
        budgetLeft: 'Budget restant',
        activityLog: '📜 Journal d\'activité',
        waitingForActivity: 'En attente d\'activité...',
        checking: 'Vérification...',
        freeTier: 'Niveau gratuit',
    },
    common: {
        loading: 'Chargement...',
        processing: 'Traitement...',
        complete: 'Terminé!',
        error: 'Erreur',
        success: 'Succès',
        warning: 'Avertissement',
        opened: 'Ouvert:',
        initialized: 'QAntum v23.0.0 UI initialisé',
        madeInBulgaria: '🇧🇬 Fait avec ❤️ en Bulgarie',
    },
    footer: {
        copyright: '© 2025 Dimitar Prodromov',
    },
};
// ══════════════════════════════════════════════════════════════════════════════
// CHINESE (SIMPLIFIED) TRANSLATIONS - 简体中文
// ══════════════════════════════════════════════════════════════════════════════
exports.cn = {
    header: {
        title: 'QANTUM',
        codename: 'v23.3.0 "类型安全主权"',
        lines: '代码行数:',
        tests: '测试:',
        modules: '模块:',
    },
    sidebar: {
        freeFeatures: '🆓 免费功能',
        proFeatures: '💎 专业版功能',
        enterprise: '🏢 企业版',
        utilities: '🛠️ 工具',
    },
    modules: {
        websiteAudit: '网站审计',
        apiTest: 'API 测试',
        linkChecker: '链接检查器',
        predictionMatrix: '预测矩阵',
        apiSensei: 'API 大师',
        chronosEngine: '时间引擎',
        thermalPool: '温控池',
        dockerManager: 'Docker 管理器',
        swarmCommander: '集群指挥官',
        bulgarianTts: '保加利亚语 TTS',
        licenseManager: '许可证管理器',
        systemStats: '系统统计',
        logger: '日志记录器',
    },
    badges: {
        free: '免费',
        pro: '专业版',
        proRequired: '需要专业版许可证',
    },
    panels: {
        audit: {
            title: '🔍 网站审计',
            subtitle: 'mm.audit(url) → AuditResult',
            urlLabel: '要审计的URL',
            runButton: '▶️ 开始审计',
            performance: '性能',
            accessibility: '可访问性',
            seo: 'SEO',
        },
        apiTest: {
            title: '🌐 API 测试',
            subtitle: 'mm.testAPI(endpoint, options) → APITestResult',
            endpointLabel: 'API 端点',
            methodLabel: '方法',
            runButton: '▶️ 测试 API',
        },
        linkChecker: {
            title: '🔗 链接检查器',
            subtitle: 'mm.checkLinks(url, options) → CheckLinksResult',
            urlLabel: '页面URL',
            maxLinksLabel: '最大检查链接数',
            runButton: '▶️ 检查链接',
        },
        prediction: {
            title: '🔮 预测矩阵',
            subtitle: 'mm.predict(options) → PredictionResult',
            codeLabel: '代码变更（diff或内容）',
            runButton: '▶️ 分析并预测',
            description: '分析代码变更并预测潜在的测试失败。',
        },
        apiSensei: {
            title: '🤖 API 大师',
            subtitle: 'mm.apiSensei(config) → APISenseiResult',
            baseUrlLabel: '基础 API URL',
            scenariosLabel: '测试场景',
            runButton: '▶️ 生成并运行测试',
            scenarios: {
                happyPath: '正常路径',
                edgeCases: '边界情况',
                errorHandling: '错误处理',
                security: '安全性',
                performance: '性能',
            },
        },
        chronos: {
            title: '⏰ 时间引擎',
            subtitle: 'mm.chronos(options) → ChronosResult',
            description: '时间旅行调试：在测试执行期间记录状态快照。',
            intervalLabel: '快照间隔（毫秒）',
            maxSnapshotsLabel: '最大快照数',
            runButton: '▶️ 开始录制',
        },
        thermal: {
            title: '🌡️ 温控池',
            subtitle: 'ThermalAwarePool - CPU温度管理',
            description: '根据CPU温度自动调整并行度以防止过热。',
            states: {
                cool: '🟢 冷却',
                warm: '🔵 温暖',
                hot: '🟠 高温',
                critical: '🔴 危险',
            },
            temperature: '温度',
            maxInstances: '最大实例数',
        },
        docker: {
            title: '🐳 Docker 管理器',
            subtitle: 'DockerManager - Selenium Grid 编排',
            description: '自动生成 Dockerfile 和 docker-compose.yml 用于 Selenium Grid。',
        },
        swarm: {
            title: '🎖️ 集群指挥官',
            subtitle: 'SwarmCommander - 指挥官-士兵模式',
            description: '指挥官将任务分配给士兵（浏览器实例）以实现并行执行。',
        },
        tts: {
            title: '🔊 保加利亚语 TTS',
            subtitle: 'BulgarianTTS - 原生文本转语音',
            description: '🇧🇬 Български текст-към-реч за гласова обратна връзка по време на тестове.',
            templates: {
                testPassed: '"Тестът премина успешно"',
                testFailed: '"Тестът се провали"',
                errorFound: '"Открих грешка в {element}"',
                healing: '"Намерих нов селектор"',
            },
        },
        license: {
            title: '🔐 许可证管理器',
            subtitle: 'LicenseManager - 硬件绑定许可',
            description: '许可证使用 SHA-256 指纹绑定到硬件。',
            types: {
                trial: '试用版',
                professional: '专业版',
                enterprise: '企业版',
                sovereign: '主权版',
            },
            maxInstances: '最大实例数',
            features: '功能',
        },
        stats: {
            title: '📊 系统统计',
            subtitle: 'getSystemStats() → Statistics',
            version: '版本',
            linesOfCode: '代码行数',
            typescriptFiles: 'TypeScript文件',
            testsPassing: '通过的测试',
            enterpriseModules: '企业模块',
            codename: '代号',
        },
        logger: {
            title: '📋 结构化日志',
            subtitle: 'mm.getLogger() → Logger',
            description: '专业日志记录，级别包括: debug, info, warn, error, audit',
        },
    },
    status: {
        systemStatus: '📡 系统状态',
        backend: '后端',
        license: '许可证',
        circuitBreaker: '断路器',
        online: '在线',
        offline: '离线',
        closed: '关闭',
        open: '打开',
        cpuTemperature: '🌡️ CPU 温度',
        state: '状态:',
        financialOracle: '💰 财务预言机',
        totalCost: '总成本',
        requests: '请求',
        budgetLeft: '剩余预算',
        activityLog: '📜 活动日志',
        waitingForActivity: '等待活动...',
        checking: '检查中...',
        freeTier: '免费版',
    },
    common: {
        loading: '加载中...',
        processing: '处理中...',
        complete: '完成！',
        error: '错误',
        success: '成功',
        warning: '警告',
        opened: '已打开:',
        initialized: 'QAntum v23.3.0 UI 已初始化',
        madeInBulgaria: '🇧🇬 用 ❤️ 在保加利亚制作',
    },
    footer: {
        copyright: '© 2025 Димитър Продромов',
    },
};
// ══════════════════════════════════════════════════════════════════════════════
// JAPANESE TRANSLATIONS - 日本語
// ══════════════════════════════════════════════════════════════════════════════
exports.jp = {
    header: {
        title: 'QANTUM',
        codename: 'v23.3.0 "型安全主権"',
        lines: '行数:',
        tests: 'テスト:',
        modules: 'モジュール:',
    },
    sidebar: {
        freeFeatures: '🆓 無料機能',
        proFeatures: '💎 Pro機能',
        enterprise: '🏢 エンタープライズ',
        utilities: '🛠️ ユーティリティ',
    },
    modules: {
        websiteAudit: 'ウェブサイト監査',
        apiTest: 'APIテスト',
        linkChecker: 'リンクチェッカー',
        predictionMatrix: '予測マトリックス',
        apiSensei: 'API 先生',
        chronosEngine: 'クロノスエンジン',
        thermalPool: 'サーマルプール',
        dockerManager: 'Dockerマネージャー',
        swarmCommander: 'スワームコマンダー',
        bulgarianTts: 'ブルガリア語TTS',
        licenseManager: 'ライセンスマネージャー',
        systemStats: 'システム統計',
        logger: 'ロガー',
    },
    badges: {
        free: '無料',
        pro: 'PRO',
        proRequired: 'PROライセンスが必要です',
    },
    panels: {
        audit: {
            title: '🔍 ウェブサイト監査',
            subtitle: 'mm.audit(url) → AuditResult',
            urlLabel: '監査するURL',
            runButton: '▶️ 監査を開始',
            performance: 'パフォーマンス',
            accessibility: 'アクセシビリティ',
            seo: 'SEO',
        },
        apiTest: {
            title: '🌐 APIテスト',
            subtitle: 'mm.testAPI(endpoint, options) → APITestResult',
            endpointLabel: 'APIエンドポイント',
            methodLabel: 'メソッド',
            runButton: '▶️ APIをテスト',
        },
        linkChecker: {
            title: '🔗 リンクチェッカー',
            subtitle: 'mm.checkLinks(url, options) → CheckLinksResult',
            urlLabel: 'ページURL',
            maxLinksLabel: 'チェックする最大リンク数',
            runButton: '▶️ リンクをチェック',
        },
        prediction: {
            title: '🔮 予測マトリックス',
            subtitle: 'mm.predict(options) → PredictionResult',
            codeLabel: 'コード変更（diffまたは内容）',
            runButton: '▶️ 分析＆予測',
            description: 'コード変更を分析し、潜在的なテスト失敗を予測します。',
        },
        apiSensei: {
            title: '🤖 API 先生',
            subtitle: 'mm.apiSensei(config) → APISenseiResult',
            baseUrlLabel: 'ベースAPI URL',
            scenariosLabel: 'テストシナリオ',
            runButton: '▶️ テストを生成＆実行',
            scenarios: {
                happyPath: 'ハッピーパス',
                edgeCases: 'エッジケース',
                errorHandling: 'エラーハンドリング',
                security: 'セキュリティ',
                performance: 'パフォーマンス',
            },
        },
        chronos: {
            title: '⏰ クロノスエンジン',
            subtitle: 'mm.chronos(options) → ChronosResult',
            description: 'タイムトラベルデバッグ：テスト実行中に状態のスナップショットを記録します。',
            intervalLabel: 'スナップショット間隔（ms）',
            maxSnapshotsLabel: '最大スナップショット数',
            runButton: '▶️ 録画を開始',
        },
        thermal: {
            title: '🌡️ サーマルプール',
            subtitle: 'ThermalAwarePool - CPU温度管理',
            description: 'スロットリングを防ぐため、CPU温度に基づいて並列度を自動調整します。',
            states: {
                cool: '🟢 クール',
                warm: '🔵 ウォーム',
                hot: '🟠 ホット',
                critical: '🔴 クリティカル',
            },
            temperature: '温度',
            maxInstances: '最大インスタンス数',
        },
        docker: {
            title: '🐳 Dockerマネージャー',
            subtitle: 'DockerManager - Selenium Gridオーケストレーション',
            description: 'Selenium Grid用のDockerfileとdocker-compose.ymlを自動生成します。',
        },
        swarm: {
            title: '🎖️ スワームコマンダー',
            subtitle: 'SwarmCommander - コマンダー・ソルジャーパターン',
            description: 'コマンダーがソルジャー（ブラウザインスタンス）にタスクを分配し、並列実行を行います。',
        },
        tts: {
            title: '🔊 ブルガリア語TTS',
            subtitle: 'BulgarianTTS - ネイティブテキスト読み上げ',
            description: '🇧🇬 Български текст-към-реч за гласова обратна връзка по време на тестове.',
            templates: {
                testPassed: '"Тестът премина успешно"',
                testFailed: '"Тестът се провали"',
                errorFound: '"Открих грешка в {element}"',
                healing: '"Намерих нов селектор"',
            },
        },
        license: {
            title: '🔐 ライセンスマネージャー',
            subtitle: 'LicenseManager - ハードウェアロックライセンス',
            description: 'ライセンスはSHA-256フィンガープリントでハードウェアにバインドされます。',
            types: {
                trial: 'トライアル',
                professional: 'プロフェッショナル',
                enterprise: 'エンタープライズ',
                sovereign: 'ソブリン',
            },
            maxInstances: '最大インスタンス数',
            features: '機能',
        },
        stats: {
            title: '📊 システム統計',
            subtitle: 'getSystemStats() → Statistics',
            version: 'バージョン',
            linesOfCode: 'コード行数',
            typescriptFiles: 'TypeScriptファイル',
            testsPassing: '合格テスト',
            enterpriseModules: 'エンタープライズモジュール',
            codename: 'コードネーム',
        },
        logger: {
            title: '📋 構造化ロガー',
            subtitle: 'mm.getLogger() → Logger',
            description: 'プロフェッショナルなロギング、レベル: debug, info, warn, error, audit',
        },
    },
    status: {
        systemStatus: '📡 システムステータス',
        backend: 'バックエンド',
        license: 'ライセンス',
        circuitBreaker: 'サーキットブレーカー',
        online: 'オンライン',
        offline: 'オフライン',
        closed: 'クローズ',
        open: 'オープン',
        cpuTemperature: '🌡️ CPU温度',
        state: '状態:',
        financialOracle: '💰 ファイナンシャルオラクル',
        totalCost: '合計コスト',
        requests: 'リクエスト',
        budgetLeft: '残り予算',
        activityLog: '📜 アクティビティログ',
        waitingForActivity: 'アクティビティを待機中...',
        checking: 'チェック中...',
        freeTier: '無料プラン',
    },
    common: {
        loading: '読み込み中...',
        processing: '処理中...',
        complete: '完了！',
        error: 'エラー',
        success: '成功',
        warning: '警告',
        opened: '開いた:',
        initialized: 'QAntum v23.3.0 UI 初期化完了',
        madeInBulgaria: '🇧🇬 ブルガリアで ❤️ を込めて作成',
    },
    footer: {
        copyright: '© 2025 Димитър Продромов',
    },
};
// ══════════════════════════════════════════════════════════════════════════════
// I18N MANAGER CLASS
// ══════════════════════════════════════════════════════════════════════════════
class I18nManager {
    currentLanguage = 'en';
    translations = { bg: exports.bg, en: exports.en, de: exports.de, fr: exports.fr, cn: exports.cn, jp: exports.jp };
    listeners = [];
    constructor(initialLanguage = 'en') {
        this.currentLanguage = initialLanguage;
    }
    /**
     * Get current language
     */
    getLanguage() {
        return this.currentLanguage;
    }
    /**
     * Set language and notify listeners
     */
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            this.listeners.forEach(listener => listener(lang));
        }
    }
    /**
     * Get current translations object
     */
    t() {
        return this.translations[this.currentLanguage];
    }
    /**
     * Get translation by dot-notation path
     * Example: i18n.get('header.title') returns 'QANTUM'
     */
    get(path) {
        const keys = path.split('.');
        let value = this.translations[this.currentLanguage];
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            }
            else {
                return path; // Return path if translation not found
            }
        }
        return typeof value === 'string' ? value : path;
    }
    /**
     * Subscribe to language changes
     */
    onLanguageChange(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }
    /**
     * Get all supported languages with their display names
     */
    getSupportedLanguages() {
        return [
            { code: 'bg', name: 'Български', flag: '🇧🇬' },
            { code: 'en', name: 'English', flag: '🇬🇧' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
            { code: 'fr', name: 'Français', flag: '🇫🇷' },
            { code: 'cn', name: '简体中文', flag: '🇨🇳' },
            { code: 'jp', name: '日本語', flag: '🇯🇵' },
        ];
    }
    /**
     * Detect browser language and return closest supported language
     */
    detectBrowserLanguage() {
        if (typeof navigator === 'undefined')
            return 'en';
        const browserLang = navigator.language.toLowerCase().slice(0, 2);
        if (browserLang in this.translations) {
            return browserLang;
        }
        return 'en';
    }
    /**
     * Export translations for use in browser
     */
    static getTranslationsJSON() {
        return JSON.stringify({ bg: exports.bg, en: exports.en, de: exports.de, fr: exports.fr, cn: exports.cn, jp: exports.jp });
    }
}
exports.I18nManager = I18nManager;
// Export singleton instance
exports.i18n = new I18nManager();
// Export all translations for direct use
exports.translations = { bg: exports.bg, en: exports.en, de: exports.de, fr: exports.fr, cn: exports.cn, jp: exports.jp };
