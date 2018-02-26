import { chunkLoadErrorHandler } from '../api/core-loader';

let controlsPromise = null;

export const ControlsLoader = {};

export function load() {
    if (!controlsPromise) {
        controlsPromise = import(
            /* webpackChunkName: "jwplayer.controls" */
            'view/controls/controls'
        ).then(module => {
            const ControlsModule = module.default;
            ControlsLoader.controls = ControlsModule;
            return ControlsModule;
        }).catch(error => {
            controlsPromise = null;
            chunkLoadErrorHandler(error);
        });
    }
    return controlsPromise;
}
