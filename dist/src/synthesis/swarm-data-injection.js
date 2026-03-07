"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                               ║
 * ║  ███████╗██╗    ██╗ █████╗ ██████╗ ███╗   ███╗    ██████╗  █████╗ ████████╗ █████╗            ║
 * ║  ██╔════╝██║    ██║██╔══██╗██╔══██╗████╗ ████║    ██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗           ║
 * ║  ███████╗██║ █╗ ██║███████║██████╔╝██╔████╔██║    ██║  ██║███████║   ██║   ███████║           ║
 * ║  ╚════██║██║███╗██║██╔══██║██╔══██╗██║╚██╔╝██║    ██║  ██║██╔══██║   ██║   ██╔══██║           ║
 * ║  ███████║╚███╔███╔╝██║  ██║██║  ██║██║ ╚═╝ ██║    ██████╔╝██║  ██║   ██║   ██║  ██║           ║
 * ║  ╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝           ║
 * ║                                                                                               ║
 * ║                            SWARM DATA INJECTION ENGINE                                        ║
 * ║                   "Neural Fingerprint-Based Unique Data for Each Worker"                      ║
 * ║                                                                                               ║
 * ║   THE FINAL SYNTHESIS - Task 3: Data Factory Injection                                        ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                                        ║
 * ║                                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSwarmDataInjector = exports.SwarmDataInjector = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// DATA POOLS (Region-specific)
// ═══════════════════════════════════════════════════════════════════════════════
const DATA_POOLS = {
    firstNames: {
        NA: [
            'James',
            'John',
            'Robert',
            'Michael',
            'William',
            'David',
            'Emma',
            'Olivia',
            'Ava',
            'Isabella',
            'Sophia',
            'Mia',
        ],
        EU: [
            'Hans',
            'Pierre',
            'Marco',
            'Lars',
            'Erik',
            'Jan',
            'Sophie',
            'Marie',
            'Anna',
            'Emma',
            'Laura',
            'Julia',
        ],
        APAC: [
            'Hiroshi',
            'Takeshi',
            'Wei',
            'Jin',
            'Raj',
            'Amit',
            'Yuki',
            'Sakura',
            'Mei',
            'Lin',
            'Priya',
            'Aisha',
        ],
        LATAM: [
            'Carlos',
            'Miguel',
            'José',
            'Luis',
            'Juan',
            'Diego',
            'María',
            'Ana',
            'Carmen',
            'Rosa',
            'Elena',
            'Sofia',
        ],
        MEA: [
            'Ahmed',
            'Mohammed',
            'Omar',
            'Ali',
            'Hassan',
            'Ibrahim',
            'Fatima',
            'Aisha',
            'Sara',
            'Mariam',
            'Layla',
            'Noor',
        ],
    },
    lastNames: {
        NA: [
            'Smith',
            'Johnson',
            'Williams',
            'Brown',
            'Jones',
            'Garcia',
            'Miller',
            'Davis',
            'Rodriguez',
            'Martinez',
        ],
        EU: [
            'Müller',
            'Schmidt',
            'Dubois',
            'Martin',
            'Rossi',
            'Ferrari',
            'Nielsen',
            'Johansson',
            'Kowalski',
            'Novak',
        ],
        APAC: ['Tanaka', 'Suzuki', 'Wang', 'Li', 'Kim', 'Park', 'Patel', 'Singh', 'Nguyen', 'Tran'],
        LATAM: [
            'García',
            'Rodríguez',
            'Martínez',
            'López',
            'González',
            'Hernández',
            'Pérez',
            'Sánchez',
            'Ramírez',
            'Torres',
        ],
        MEA: [
            'Hassan',
            'Ahmed',
            'Ali',
            'Ibrahim',
            'Mohamed',
            'Youssef',
            'Mahmoud',
            'Mustafa',
            'Khalil',
            'Said',
        ],
    },
    cities: {
        NA: [
            'New York',
            'Los Angeles',
            'Chicago',
            'Houston',
            'Phoenix',
            'Toronto',
            'Vancouver',
            'Montreal',
        ],
        EU: ['London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Amsterdam', 'Stockholm', 'Vienna'],
        APAC: ['Tokyo', 'Shanghai', 'Singapore', 'Sydney', 'Mumbai', 'Seoul', 'Hong Kong', 'Bangkok'],
        LATAM: [
            'São Paulo',
            'Mexico City',
            'Buenos Aires',
            'Lima',
            'Bogotá',
            'Santiago',
            'Caracas',
            'Havana',
        ],
        MEA: ['Dubai', 'Cairo', 'Istanbul', 'Tel Aviv', 'Riyadh', 'Lagos', 'Johannesburg', 'Nairobi'],
    },
    industries: [
        'Technology',
        'Healthcare',
        'Finance',
        'Education',
        'Retail',
        'Manufacturing',
        'Energy',
        'Transportation',
        'Media',
        'Real Estate',
        'Hospitality',
        'Agriculture',
        'Construction',
        'Telecommunications',
        'Consulting',
    ],
    domains: [
        'tech',
        'solutions',
        'systems',
        'digital',
        'cloud',
        'data',
        'smart',
        'next',
        'prime',
        'core',
        'hub',
        'lab',
        'works',
    ],
    userAgents: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ],
    timezones: {
        NA: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'],
        EU: ['Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome'],
        APAC: ['Asia/Tokyo', 'Asia/Shanghai', 'Asia/Singapore', 'Australia/Sydney'],
        LATAM: ['America/Sao_Paulo', 'America/Mexico_City', 'America/Buenos_Aires'],
        MEA: ['Africa/Cairo', 'Asia/Dubai', 'Africa/Johannesburg', 'Asia/Istanbul'],
    },
};
// ═══════════════════════════════════════════════════════════════════════════════
// SEEDED RANDOM GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
class SeededRandom {
    seed;
    constructor(seed) {
        this.seed = seed;
    }
    // Complexity: O(1)
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
    // Complexity: O(1)
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
    pick(array) {
        return array[Math.floor(this.next() * array.length)];
    }
    shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(this.next() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// SWARM DATA INJECTOR
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * SwarmDataInjector - Generates unique data for each Swarm worker
 */
class SwarmDataInjector {
    static instance;
    workerDataCache = new Map();
    fingerprintRegistry = new Map();
    constructor() { }
    static getInstance() {
        if (!SwarmDataInjector.instance) {
            SwarmDataInjector.instance = new SwarmDataInjector();
        }
        return SwarmDataInjector.instance;
    }
    /**
     * Generate unique neural fingerprint for worker
     */
    // Complexity: O(1) — lookup
    generateFingerprint(workerId) {
        if (this.fingerprintRegistry.has(workerId)) {
            return this.fingerprintRegistry.get(workerId);
        }
        // Generate seed from worker ID
        const seed = this.hashString(workerId);
        const random = new SeededRandom(seed);
        const fingerprint = {
            workerId,
            seed,
            createdAt: Date.now(),
            entropy: random.next(),
            traits: {
                archetype: random.pick(['explorer', 'builder', 'analyst', 'guardian', 'creator']),
                region: random.pick(['NA', 'EU', 'APAC', 'LATAM', 'MEA']),
                industry: random.pick(DATA_POOLS.industries),
                language: this.getLanguageForRegion(random.pick(['NA', 'EU', 'APAC', 'LATAM', 'MEA'])),
                complexity: random.nextInt(1, 10),
            },
        };
        this.fingerprintRegistry.set(workerId, fingerprint);
        return fingerprint;
    }
    /**
     * Generate complete data package for worker
     */
    // Complexity: O(N)
    generateWorkerData(workerId) {
        if (this.workerDataCache.has(workerId)) {
            return this.workerDataCache.get(workerId);
        }
        const fingerprint = this.generateFingerprint(workerId);
        const random = new SeededRandom(fingerprint.seed);
        const region = fingerprint.traits.region;
        const user = this.generateUser(random, region);
        const company = this.generateCompany(random, fingerprint.traits.industry);
        const credentials = this.generateCredentials(random, user);
        const context = this.generateContext(random, region);
        const data = {
            fingerprint,
            user,
            company,
            credentials,
            context,
        };
        this.workerDataCache.set(workerId, data);
        console.log(`🐝 [SwarmDataInjector] Generated data for worker: ${workerId.slice(0, 8)}...`);
        return data;
    }
    /**
     * Inject data into multiple workers
     */
    // Complexity: O(N) — loop
    injectBatch(workerIds) {
        const result = new Map();
        for (const workerId of workerIds) {
            result.set(workerId, this.generateWorkerData(workerId));
        }
        return result;
    }
    /**
     * Get worker data by fingerprint traits
     */
    // Complexity: O(N) — linear scan
    getWorkersByTrait(trait, value) {
        return Array.from(this.workerDataCache.values()).filter((data) => data.fingerprint.traits[trait] === value);
    }
    /**
     * Reset worker data (for re-generation)
     */
    // Complexity: O(1)
    resetWorker(workerId) {
        this.workerDataCache.delete(workerId);
        this.fingerprintRegistry.delete(workerId);
    }
    /**
     * Get statistics
     */
    // Complexity: O(N) — loop
    getStats() {
        const workers = Array.from(this.workerDataCache.values());
        const byArchetype = {};
        const byRegion = {};
        for (const worker of workers) {
            const { archetype, region } = worker.fingerprint.traits;
            byArchetype[archetype] = (byArchetype[archetype] || 0) + 1;
            byRegion[region] = (byRegion[region] || 0) + 1;
        }
        return {
            totalWorkers: workers.length,
            byArchetype,
            byRegion,
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE GENERATORS
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    generateUser(random, region) {
        const firstName = random.pick(DATA_POOLS.firstNames[region] ||
            DATA_POOLS.firstNames.NA);
        const lastName = random.pick(DATA_POOLS.lastNames[region] || DATA_POOLS.lastNames.NA);
        const city = random.pick(DATA_POOLS.cities[region] || DATA_POOLS.cities.NA);
        return {
            id: this.generateUUID(random),
            firstName,
            lastName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${random.pick(DATA_POOLS.domains)}.com`,
            phone: this.generatePhone(random, region),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
            birthDate: this.generateBirthDate(random),
            address: {
                street: `${random.nextInt(100, 9999)} ${random.pick(['Main', 'Oak', 'Pine', 'Maple', 'Cedar'])} ${random.pick(['St', 'Ave', 'Blvd', 'Dr', 'Ln'])}`,
                city,
                state: this.getStateForCity(city, region),
                zip: this.generateZip(random, region),
                country: this.getCountryForRegion(region),
            },
        };
    }
    // Complexity: O(1)
    generateCompany(random, industry) {
        const prefix = random.pick([
            'Apex',
            'Nova',
            'Vertex',
            'Prime',
            'Quantum',
            'Nexus',
            'Atlas',
            'Zenith',
            'Titan',
            'Omega',
        ]);
        const suffix = random.pick(DATA_POOLS.domains);
        const sizes = [
            'startup',
            'small',
            'medium',
            'large',
            'enterprise',
        ];
        const size = random.pick(sizes);
        const employeeRanges = {
            startup: [1, 50],
            small: [51, 200],
            medium: [201, 1000],
            large: [1001, 5000],
            enterprise: [5001, 100000],
        };
        return {
            name: `${prefix} ${suffix.charAt(0).toUpperCase() + suffix.slice(1)}`,
            domain: `${prefix.toLowerCase()}${suffix}.com`,
            industry,
            size,
            founded: random.nextInt(1990, 2024),
            employees: random.nextInt(...employeeRanges[size]),
        };
    }
    // Complexity: O(1)
    generateCredentials(random, user) {
        return {
            username: `${user.firstName.toLowerCase()}_${user.lastName.toLowerCase()}${random.nextInt(1, 999)}`,
            password: this.generatePassword(random),
            token: this.generateToken(random),
            apiKey: this.generateApiKey(random),
        };
    }
    // Complexity: O(1)
    generateContext(random, region) {
        const viewports = [
            { width: 1920, height: 1080 },
            { width: 1366, height: 768 },
            { width: 1536, height: 864 },
            { width: 1440, height: 900 },
            { width: 2560, height: 1440 },
        ];
        return {
            sessionId: this.generateUUID(random),
            userAgent: random.pick(DATA_POOLS.userAgents),
            viewport: random.pick(viewports),
            timezone: random.pick(DATA_POOLS.timezones[region] || DATA_POOLS.timezones.NA),
            locale: this.getLocaleForRegion(region),
        };
    }
    // Complexity: O(N) — loop
    generateUUID(random) {
        const hex = '0123456789abcdef';
        let uuid = '';
        for (let i = 0; i < 36; i++) {
            if (i === 8 || i === 13 || i === 18 || i === 23) {
                uuid += '-';
            }
            else if (i === 14) {
                uuid += '4';
            }
            else if (i === 19) {
                uuid += hex[Math.floor(random.next() * 4) + 8];
            }
            else {
                uuid += hex[Math.floor(random.next() * 16)];
            }
        }
        return uuid;
    }
    // Complexity: O(1)
    generatePhone(random, region) {
        const prefixes = {
            NA: '+1',
            EU: '+44',
            APAC: '+81',
            LATAM: '+55',
            MEA: '+971',
        };
        const prefix = prefixes[region] || '+1';
        return `${prefix} ${random.nextInt(100, 999)}-${random.nextInt(100, 999)}-${random.nextInt(1000, 9999)}`;
    }
    // Complexity: O(1)
    generateBirthDate(random) {
        const year = random.nextInt(1960, 2005);
        const month = random.nextInt(1, 12).toString().padStart(2, '0');
        const day = random.nextInt(1, 28).toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    // Complexity: O(1)
    generateZip(random, region) {
        if (region === 'NA')
            return random.nextInt(10000, 99999).toString();
        if (region === 'EU')
            return `${random.pick(['SW', 'NW', 'SE', 'E', 'W'])}${random.nextInt(1, 20)} ${random.nextInt(1, 9)}${random.pick(['AA', 'AB', 'BA', 'BB'])}`;
        return random.nextInt(100000, 999999).toString();
    }
    // Complexity: O(N) — loop
    generatePassword(random) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 16; i++) {
            password += chars[Math.floor(random.next() * chars.length)];
        }
        return password;
    }
    // Complexity: O(N) — loop
    generateToken(random) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = 'qt_';
        for (let i = 0; i < 32; i++) {
            token += chars[Math.floor(random.next() * chars.length)];
        }
        return token;
    }
    // Complexity: O(N) — loop
    generateApiKey(random) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let key = 'QANTUM-';
        for (let i = 0; i < 24; i++) {
            if (i > 0 && i % 4 === 0)
                key += '-';
            key += chars[Math.floor(random.next() * chars.length)];
        }
        return key;
    }
    // Complexity: O(N) — loop
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    // Complexity: O(1)
    getLanguageForRegion(region) {
        const languages = {
            NA: 'en-US',
            EU: 'en-GB',
            APAC: 'ja-JP',
            LATAM: 'es-MX',
            MEA: 'ar-AE',
        };
        return languages[region] || 'en-US';
    }
    // Complexity: O(1)
    getLocaleForRegion(region) {
        return this.getLanguageForRegion(region);
    }
    // Complexity: O(1)
    getCountryForRegion(region) {
        const countries = {
            NA: 'United States',
            EU: 'United Kingdom',
            APAC: 'Japan',
            LATAM: 'Brazil',
            MEA: 'United Arab Emirates',
        };
        return countries[region] || 'United States';
    }
    // Complexity: O(1)
    getStateForCity(city, region) {
        // Simplified state lookup
        const cityStates = {
            'New York': 'NY',
            'Los Angeles': 'CA',
            Chicago: 'IL',
            London: 'England',
            Paris: 'Île-de-France',
            Tokyo: 'Tokyo',
            Sydney: 'NSW',
        };
        return cityStates[city] || 'Unknown';
    }
}
exports.SwarmDataInjector = SwarmDataInjector;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getSwarmDataInjector = () => SwarmDataInjector.getInstance();
exports.getSwarmDataInjector = getSwarmDataInjector;
exports.default = SwarmDataInjector;
