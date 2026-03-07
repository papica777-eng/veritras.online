"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM DATA MODULE                                                          ║
 * ║   "Unified test data management facade"                                       ║
 * ║                                                                               ║
 * ║   TODO B #38-40 - Data Module Complete                                        ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = exports.getQAntumData = exports.QAntumData = exports.fixture = exports.configureFixtures = exports.getFixtureManager = exports.FixtureData = exports.FixtureLoader = exports.FixtureConfig = exports.FixtureSet = exports.FixtureManager = exports.fake = exports.faker = exports.Faker = exports.factories = exports.factory = exports.defineFactory = exports.getFactoryManager = exports.FactoryTrait = exports.FactoryDefinition = exports.FactoryConfig = exports.FactoryBuilder = exports.FactoryManager = exports.Factory = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
var factory_1 = require("./factory");
Object.defineProperty(exports, "Factory", { enumerable: true, get: function () { return factory_1.Factory; } });
Object.defineProperty(exports, "FactoryManager", { enumerable: true, get: function () { return factory_1.FactoryManager; } });
Object.defineProperty(exports, "FactoryBuilder", { enumerable: true, get: function () { return factory_1.FactoryBuilder; } });
Object.defineProperty(exports, "FactoryConfig", { enumerable: true, get: function () { return factory_1.FactoryConfig; } });
Object.defineProperty(exports, "FactoryDefinition", { enumerable: true, get: function () { return factory_1.FactoryDefinition; } });
Object.defineProperty(exports, "FactoryTrait", { enumerable: true, get: function () { return factory_1.FactoryTrait; } });
Object.defineProperty(exports, "getFactoryManager", { enumerable: true, get: function () { return factory_1.getFactoryManager; } });
Object.defineProperty(exports, "defineFactory", { enumerable: true, get: function () { return factory_1.defineFactory; } });
Object.defineProperty(exports, "factory", { enumerable: true, get: function () { return factory_1.factory; } });
Object.defineProperty(exports, "factories", { enumerable: true, get: function () { return factory_1.factories; } });
var faker_1 = require("./faker");
Object.defineProperty(exports, "Faker", { enumerable: true, get: function () { return faker_1.Faker; } });
Object.defineProperty(exports, "faker", { enumerable: true, get: function () { return faker_1.faker; } });
Object.defineProperty(exports, "fake", { enumerable: true, get: function () { return faker_1.fake; } });
var fixtures_1 = require("./fixtures");
Object.defineProperty(exports, "FixtureManager", { enumerable: true, get: function () { return fixtures_1.FixtureManager; } });
Object.defineProperty(exports, "FixtureSet", { enumerable: true, get: function () { return fixtures_1.FixtureSet; } });
Object.defineProperty(exports, "FixtureConfig", { enumerable: true, get: function () { return fixtures_1.FixtureConfig; } });
Object.defineProperty(exports, "FixtureLoader", { enumerable: true, get: function () { return fixtures_1.FixtureLoader; } });
Object.defineProperty(exports, "FixtureData", { enumerable: true, get: function () { return fixtures_1.FixtureData; } });
Object.defineProperty(exports, "getFixtureManager", { enumerable: true, get: function () { return fixtures_1.getFixtureManager; } });
Object.defineProperty(exports, "configureFixtures", { enumerable: true, get: function () { return fixtures_1.configureFixtures; } });
Object.defineProperty(exports, "fixture", { enumerable: true, get: function () { return fixtures_1.fixture; } });
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED DATA
// ═══════════════════════════════════════════════════════════════════════════════
const factory_2 = require("./factory");
const faker_2 = require("./faker");
const fixtures_2 = require("./fixtures");
/**
 * Unified QAntum Data
 */
class QAntumData {
    static instance;
    faker;
    factories;
    fixtures;
    constructor() {
        this.faker = faker_2.faker;
        this.factories = factory_2.FactoryManager.getInstance();
        this.fixtures = fixtures_2.FixtureManager.getInstance();
    }
    static getInstance() {
        if (!QAntumData.instance) {
            QAntumData.instance = new QAntumData();
        }
        return QAntumData.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // QUICK DATA GENERATION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Generate user data
     */
    user(overrides) {
        return {
            id: this.faker.uuid(),
            firstName: this.faker.firstName(),
            lastName: this.faker.lastName(),
            email: this.faker.email(),
            username: this.faker.username(),
            avatar: this.faker.avatar(),
            createdAt: this.faker.pastDate(),
            ...overrides
        };
    }
    /**
     * Generate multiple users
     */
    users(count, overrides) {
        return Array.from({ length: count }, () => this.user(overrides));
    }
    /**
     * Generate product data
     */
    product(overrides) {
        return {
            id: this.faker.uuid(),
            name: this.faker.words(2),
            description: this.faker.paragraph(),
            price: parseFloat(this.faker.price()),
            category: this.faker.pick(['Electronics', 'Clothing', 'Books', 'Food', 'Sports']),
            inStock: this.faker.boolean(0.8),
            createdAt: this.faker.pastDate(),
            ...overrides
        };
    }
    /**
     * Generate multiple products
     */
    products(count, overrides) {
        return Array.from({ length: count }, () => this.product(overrides));
    }
    /**
     * Generate order data
     */
    order(overrides) {
        const items = Array.from({ length: this.faker.number(1, 5) }, () => ({
            productId: this.faker.uuid(),
            quantity: this.faker.number(1, 10),
            price: parseFloat(this.faker.price())
        }));
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return {
            id: this.faker.uuid(),
            userId: this.faker.uuid(),
            items,
            total,
            status: this.faker.pick(['pending', 'processing', 'shipped', 'delivered']),
            createdAt: this.faker.pastDate(),
            ...overrides
        };
    }
    /**
     * Generate address
     */
    address() {
        return this.faker.address();
    }
    /**
     * Generate company
     */
    company(overrides) {
        return {
            id: this.faker.uuid(),
            name: this.faker.companyName(),
            industry: this.faker.pick(['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing']),
            employees: this.faker.number(10, 10000),
            website: this.faker.url(),
            address: this.address(),
            ...overrides
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // SEEDING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Set seed for reproducible data
     */
    seed(value) {
        this.faker.seed(value);
        return this;
    }
    /**
     * Generate seeded data set
     */
    seededDataSet(seed) {
        this.seed(seed);
        const users = this.users(10);
        const products = this.products(20);
        const orders = Array.from({ length: 15 }, () => this.order({ userId: this.faker.pick(users).id }));
        return { users, products, orders };
    }
}
exports.QAntumData = QAntumData;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getQAntumData = () => QAntumData.getInstance();
exports.getQAntumData = getQAntumData;
// Combined data utilities
exports.data = {
    // Faker shortcuts
    fake: faker_2.fake,
    // Factory shortcuts
    factory: (name) => new factory_2.Factory({ definition: () => ({}) }),
    define: factory_2.defineFactory,
    // Fixture shortcuts
    fixture: fixtures_2.fixture,
    // Quick generators
    user: (o) => QAntumData.getInstance().user(o),
    users: (n, o) => QAntumData.getInstance().users(n, o),
    product: (o) => QAntumData.getInstance().product(o),
    products: (n, o) => QAntumData.getInstance().products(n, o),
    order: (o) => QAntumData.getInstance().order(o),
    company: (o) => QAntumData.getInstance().company(o),
    address: () => QAntumData.getInstance().address(),
    // Seeding
    seed: (s) => QAntumData.getInstance().seed(s),
    seededSet: (s) => QAntumData.getInstance().seededDataSet(s)
};
exports.default = QAntumData;
