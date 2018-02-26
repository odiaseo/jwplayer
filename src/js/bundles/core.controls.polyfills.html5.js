import Controls from 'view/controls/controls';
import VideoProvider from 'providers/html5';
import Controller from 'controller/controller';
import * as IntersectionObserver from 'intersection-observer';

export const CoreMixin = Controller;
export const controls = Controls;
export const xo = IntersectionObserver;
export const html5 = VideoProvider;
