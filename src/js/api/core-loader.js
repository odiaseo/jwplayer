import Item from 'playlist/item';
import ProvidersSupported from 'providers/providers-supported';
import registerProvider from 'providers/providers-register';
import { ControlsLoader } from 'controller/controls-loader';
import { resolved } from 'polyfills/promise';

let bundlePromise = null;

export const bundleContainsProviders = {};

export default function loadCoreBundle(model) {
    if (!bundlePromise) {
        bundlePromise = selectBundle(model);
    }
    return bundlePromise;
}

export function chunkLoadErrorHandler(/* error */) {
    // Webpack require.ensure error: "Loading chunk 3 failed"
    throw new Error('Network error');
}

export function selectBundle(model) {
    const controls = model.get('controls');
    const polyfills = requiresPolyfills();
    const html5Provider = requiresProvider(model, 'html5');

    if (controls && polyfills && html5Provider) {
        return loadControlsPolyfillHtml5Bundle();
    }
    if (controls && html5Provider) {
        return loadControlsHtml5Bundle();
    }
    if (controls && polyfills) {
        return loadControlsPolyfillBundle();
    }
    if (controls) {
        return loadControlsBundle();
    }
    return loadCore();
}

export function requiresPolyfills() {
    const IntersectionObserverEntry = window.IntersectionObserverEntry;
    return !IntersectionObserverEntry ||
        !('IntersectionObserver' in window) ||
        !('intersectionRatio' in IntersectionObserverEntry.prototype);
}

export function requiresProvider(model, providerName) {
    const playlist = model.get('playlist');
    if (Array.isArray(playlist) && playlist.length) {
        const sources = Item(playlist[0]).sources;
        for (let i = 0; i < sources.length; i++) {
            const source = sources[i];
            const providersManager = model.getProviders();
            for (let j = 0; j < ProvidersSupported.length; j++) {
                const provider = ProvidersSupported[j];
                if (providersManager.providerSupports(provider, source)) {
                    return (provider.name === providerName);
                }
            }
        }
    }
    return false;
}

function loadControlsPolyfillHtml5Bundle() {
    return import(
        /* webpackChunkName: "jwplayer.core.controls.polyfills.html5" */
        'bundles/core.controls.polyfills.html5'
    ).then(module => {
        ControlsLoader.controls = module.controls;
        registerProvider(module.html5);
        return module.CoreMixin;
    }).catch(chunkLoadErrorHandler);
}

function loadControlsHtml5Bundle() {
    return import(
        /* webpackChunkName: "jwplayer.core.controls.html5" */
        'bundles/core.controls.html5'
    ).then(module => {
        ControlsLoader.controls = module.controls;
        registerProvider(module.html5);
        return module.CoreMixin;
    }).catch(chunkLoadErrorHandler);
}

function loadControlsPolyfillBundle() {
    return import(
        /* webpackChunkName: "jwplayer.core.controls.polyfills" */
        'bundles/core.controls.polyfills'
    ).then(module => {
        ControlsLoader.controls = module.controls;
        return module.CoreMixin;
    }).catch(chunkLoadErrorHandler);
}

function loadControlsBundle() {
    return import(
        /* webpackChunkName: "jwplayer.core.controls" */
        'bundles/core.controls'
    ).then(module => {
        ControlsLoader.controls = module.controls;
        return module.CoreMixin;
    }).catch(chunkLoadErrorHandler);
}

function loadCore() {
    return loadIntersectionObserverIfNeeded().then(() => {
        return import(
            /* webpackChunkName: "jwplayer.core" */
            'controller/controller'
        ).then(module => module.default).catch(chunkLoadErrorHandler);
    });
}

function loadIntersectionObserverIfNeeded() {
    if (requiresPolyfills()) {
        return import(
            /* webpackChunkName: "polyfills.intersection-observer" */
            'intersection-observer'
        ).catch(chunkLoadErrorHandler);
    }
    return resolved;
}
