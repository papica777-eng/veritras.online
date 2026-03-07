"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM IMMUTABLE STATE HELPERS                                              ║
 * ║   "Type-safe immutable state patterns"                                        ║
 * ║                                                                               ║
 * ║   TODO B #6 - Immutable State                                                 ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createImmutableState = exports.ImmutableState = exports.ImmutableSet = exports.ImmutableMap = exports.ImmutableArray = void 0;
exports.deepFreeze = deepFreeze;
exports.deepClone = deepClone;
exports.merge = merge;
exports.setIn = setIn;
exports.setPath = setPath;
exports.getPath = getPath;
exports.removeKey = removeKey;
// ═══════════════════════════════════════════════════════════════════════════════
// IMMUTABLE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Deep freeze - runtime immutability
 */
function deepFreeze(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach((prop) => {
        const value = obj[prop];
        if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
            // Complexity: O(1)
            deepFreeze(value);
        }
    });
    return obj;
}
/**
 * Deep clone - създава mutable копие
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => deepClone(item));
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof Map) {
        return new Map(Array.from(obj.entries()).map(([k, v]) => [deepClone(k), deepClone(v)]));
    }
    if (obj instanceof Set) {
        return new Set(Array.from(obj).map((v) => deepClone(v)));
    }
    const cloned = {};
    for (const key of Object.keys(obj)) {
        cloned[key] = deepClone(obj[key]);
    }
    return cloned;
}
// ═══════════════════════════════════════════════════════════════════════════════
// IMMUTABLE UPDATE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Type-safe shallow merge
 */
function merge(base, updates) {
    return { ...base, ...updates };
}
/**
 * Update nested property immutably
 */
function setIn(obj, key, value) {
    return { ...obj, [key]: value };
}
/**
 * Update deep nested property with path
 */
function setPath(obj, path, value) {
    if (path.length === 0) {
        return value;
    }
    const [head, ...tail] = path;
    const current = obj?.[head];
    if (Array.isArray(obj)) {
        const result = [...obj];
        result[head] = tail.length === 0 ? value : setPath(current, tail, value);
        return result;
    }
    return {
        ...obj,
        [head]: tail.length === 0 ? value : setPath(current, tail, value),
    };
}
/**
 * Get nested property by path
 */
function getPath(obj, path) {
    return path.reduce((acc, key) => acc?.[key], obj);
}
/**
 * Remove property immutably
 */
function removeKey(obj, key) {
    const { [key]: _, ...rest } = obj;
    return rest;
}
// ═══════════════════════════════════════════════════════════════════════════════
// ARRAY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
exports.ImmutableArray = {
    /**
     * Push item to array (returns new array)
     */
    push(arr, item) {
        return [...arr, item];
    },
    /**
     * Remove item at index
     */
    removeAt(arr, index) {
        return [...arr.slice(0, index), ...arr.slice(index + 1)];
    },
    /**
     * Remove first matching item
     */
    remove(arr, predicate) {
        const index = arr.findIndex(predicate);
        return index >= 0 ? exports.ImmutableArray.removeAt(arr, index) : [...arr];
    },
    /**
     * Update item at index
     */
    updateAt(arr, index, updater) {
        return arr.map((item, i) => (i === index ? updater(item) : item));
    },
    /**
     * Insert item at index
     */
    insertAt(arr, index, item) {
        return [...arr.slice(0, index), item, ...arr.slice(index)];
    },
    /**
     * Move item from one index to another
     */
    move(arr, fromIndex, toIndex) {
        const result = [...arr];
        const [item] = result.splice(fromIndex, 1);
        result.splice(toIndex, 0, item);
        return result;
    },
    /**
     * Replace all matching items
     */
    replaceWhere(arr, predicate, newItem) {
        return arr.map((item) => (predicate(item) ? newItem : item));
    },
};
// ═══════════════════════════════════════════════════════════════════════════════
// MAP HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
exports.ImmutableMap = {
    /**
     * Set key in map (returns new map)
     */
    set(map, key, value) {
        return new Map(map).set(key, value);
    },
    /**
     * Delete key from map
     */
    delete(map, key) {
        const result = new Map(map);
        result.delete(key);
        return result;
    },
    /**
     * Merge two maps
     */
    merge(map1, map2) {
        return new Map([...map1, ...map2]);
    },
    /**
     * Update value in map
     */
    update(map, key, updater) {
        const value = map.get(key);
        if (value === undefined)
            return new Map(map);
        return new Map(map).set(key, updater(value));
    },
};
// ═══════════════════════════════════════════════════════════════════════════════
// SET HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
exports.ImmutableSet = {
    /**
     * Add item to set
     */
    add(set, item) {
        return new Set(set).add(item);
    },
    /**
     * Delete item from set
     */
    delete(set, item) {
        const result = new Set(set);
        result.delete(item);
        return result;
    },
    /**
     * Union of sets
     */
    union(set1, set2) {
        return new Set([...set1, ...set2]);
    },
    /**
     * Intersection of sets
     */
    intersection(set1, set2) {
        return new Set([...set1].filter((x) => set2.has(x)));
    },
    /**
     * Difference of sets (set1 - set2)
     */
    difference(set1, set2) {
        return new Set([...set1].filter((x) => !set2.has(x)));
    },
};
// ═══════════════════════════════════════════════════════════════════════════════
// IMMUTABLE STATE CLASS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Immutable state container with history
 */
class ImmutableState {
    _state;
    _history = [];
    _maxHistory;
    _listeners = new Set();
    constructor(initialState, maxHistory = 50) {
        this._state = deepFreeze(deepClone(initialState));
        this._maxHistory = maxHistory;
    }
    /**
     * Get current state
     */
    get state() {
        return this._state;
    }
    /**
     * Update state with partial updates
     */
    // Complexity: O(1)
    update(updates) {
        this.saveHistory();
        const newState = merge(this._state, updates);
        this._state = deepFreeze(newState);
        this.notify();
    }
    /**
     * Set specific path
     */
    // Complexity: O(1)
    setPath(path, value) {
        this.saveHistory();
        const newState = setPath(this._state, path, value);
        this._state = deepFreeze(newState);
        this.notify();
    }
    /**
     * Reset to initial or specific state
     */
    // Complexity: O(1)
    reset(state) {
        this.saveHistory();
        this._state = deepFreeze(deepClone(state));
        this.notify();
    }
    /**
     * Undo last change
     */
    // Complexity: O(N) — potential recursive descent
    undo() {
        if (this._history.length === 0)
            return false;
        this._state = this._history.pop();
        this.notify();
        return true;
    }
    /**
     * Subscribe to changes
     */
    // Complexity: O(1)
    subscribe(listener) {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    }
    /**
     * Get mutable clone
     */
    // Complexity: O(1)
    mutableClone() {
        return deepClone(this._state);
    }
    // Complexity: O(1)
    saveHistory() {
        this._history.push(this._state);
        if (this._history.length > this._maxHistory) {
            this._history.shift();
        }
    }
    // Complexity: O(N) — linear iteration
    notify() {
        for (const listener of this._listeners) {
            // Complexity: O(1)
            listener(this._state);
        }
    }
}
exports.ImmutableState = ImmutableState;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const createImmutableState = (initialState, maxHistory) => {
    return new ImmutableState(initialState, maxHistory);
};
exports.createImmutableState = createImmutableState;
exports.default = {
    deepFreeze,
    deepClone,
    merge,
    setIn,
    setPath,
    getPath,
    removeKey,
    Array: exports.ImmutableArray,
    Map: exports.ImmutableMap,
    Set: exports.ImmutableSet,
    State: ImmutableState,
    createState: exports.createImmutableState,
};
