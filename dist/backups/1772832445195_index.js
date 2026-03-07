"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
function createDebounce(callback, ms) {
    let timeoutId;
    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => callback(...args), ms);
    };
}
function useMeasure({ debounce, scroll, polyfill, offsetSize } = { debounce: 0, scroll: false, offsetSize: false }) {
    const ResizeObserver = polyfill || (typeof window === 'undefined' ? class ResizeObserver {
    } : window.ResizeObserver);
    if (!ResizeObserver) {
        throw new Error('This browser does not support ResizeObserver out of the box. See: https://github.com/react-spring/react-use-measure/#resize-observer-polyfills');
    }
    const [bounds, set] = (0, react_1.useState)({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
    });
    // keep all state in a ref
    const state = (0, react_1.useRef)({
        element: null,
        scrollContainers: null,
        resizeObserver: null,
        lastBounds: bounds,
        orientationHandler: null,
    });
    // set actual debounce values early, so effects know if they should react accordingly
    const scrollDebounce = debounce ? (typeof debounce === 'number' ? debounce : debounce.scroll) : null;
    const resizeDebounce = debounce ? (typeof debounce === 'number' ? debounce : debounce.resize) : null;
    // make sure to update state only as long as the component is truly mounted
    const mounted = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(() => {
        mounted.current = true;
        return () => void (mounted.current = false);
    });
    // memoize handlers, so event-listeners know when they should update
    const [forceRefresh, resizeChange, scrollChange] = (0, react_1.useMemo)(() => {
        const callback = () => {
            if (!state.current.element)
                return;
            const { left, top, width, height, bottom, right, x, y } = state.current.element.getBoundingClientRect();
            const size = {
                left,
                top,
                width,
                height,
                bottom,
                right,
                x,
                y,
            };
            if (state.current.element instanceof HTMLElement && offsetSize) {
                size.height = state.current.element.offsetHeight;
                size.width = state.current.element.offsetWidth;
            }
            Object.freeze(size);
            if (mounted.current && !areBoundsEqual(state.current.lastBounds, size))
                set((state.current.lastBounds = size));
        };
        return [
            callback,
            resizeDebounce ? createDebounce(callback, resizeDebounce) : callback,
            scrollDebounce ? createDebounce(callback, scrollDebounce) : callback,
        ];
    }, [set, offsetSize, scrollDebounce, resizeDebounce]);
    // cleanup current scroll-listeners / observers
    function removeListeners() {
        if (state.current.scrollContainers) {
            state.current.scrollContainers.forEach((element) => element.removeEventListener('scroll', scrollChange, true));
            state.current.scrollContainers = null;
        }
        if (state.current.resizeObserver) {
            state.current.resizeObserver.disconnect();
            state.current.resizeObserver = null;
        }
        if (state.current.orientationHandler) {
            if ('orientation' in screen && 'removeEventListener' in screen.orientation) {
                screen.orientation.removeEventListener('change', state.current.orientationHandler);
            }
            else if ('onorientationchange' in window) {
                window.removeEventListener('orientationchange', state.current.orientationHandler);
            }
        }
    }
    // add scroll-listeners / observers
    function addListeners() {
        if (!state.current.element)
            return;
        state.current.resizeObserver = new ResizeObserver(scrollChange);
        state.current.resizeObserver.observe(state.current.element);
        if (scroll && state.current.scrollContainers) {
            state.current.scrollContainers.forEach((scrollContainer) => scrollContainer.addEventListener('scroll', scrollChange, { capture: true, passive: true }));
        }
        // Handle orientation changes
        state.current.orientationHandler = () => {
            scrollChange();
        };
        // Use screen.orientation if available
        if ('orientation' in screen && 'addEventListener' in screen.orientation) {
            screen.orientation.addEventListener('change', state.current.orientationHandler);
        }
        else if ('onorientationchange' in window) {
            // Fallback to orientationchange event
            window.addEventListener('orientationchange', state.current.orientationHandler);
        }
    }
    // the ref we expose to the user
    const ref = (node) => {
        if (!node || node === state.current.element)
            return;
        removeListeners();
        state.current.element = node;
        state.current.scrollContainers = findScrollContainers(node);
        addListeners();
    };
    // add general event listeners
    useOnWindowScroll(scrollChange, Boolean(scroll));
    useOnWindowResize(resizeChange);
    // respond to changes that are relevant for the listeners
    (0, react_1.useEffect)(() => {
        removeListeners();
        addListeners();
    }, [scroll, scrollChange, resizeChange]);
    // remove all listeners when the components unmounts
    (0, react_1.useEffect)(() => removeListeners, []);
    return [ref, bounds, forceRefresh];
}
// Adds native resize listener to window
function useOnWindowResize(onWindowResize) {
    (0, react_1.useEffect)(() => {
        const cb = onWindowResize;
        window.addEventListener('resize', cb);
        return () => void window.removeEventListener('resize', cb);
    }, [onWindowResize]);
}
function useOnWindowScroll(onScroll, enabled) {
    (0, react_1.useEffect)(() => {
        if (enabled) {
            const cb = onScroll;
            window.addEventListener('scroll', cb, { capture: true, passive: true });
            return () => void window.removeEventListener('scroll', cb, true);
        }
    }, [onScroll, enabled]);
}
// Returns a list of scroll offsets
function findScrollContainers(element) {
    const result = [];
    if (!element || element === document.body)
        return result;
    const { overflow, overflowX, overflowY } = window.getComputedStyle(element);
    if ([overflow, overflowX, overflowY].some((prop) => prop === 'auto' || prop === 'scroll'))
        result.push(element);
    return [...result, ...findScrollContainers(element.parentElement)];
}
// Checks if element boundaries are equal
const keys = ['x', 'y', 'top', 'bottom', 'left', 'right', 'width', 'height'];
const areBoundsEqual = (a, b) => keys.every((key) => a[key] === b[key]);
exports.default = useMeasure;
