import {Config} from '@stencil/core';
import {postcss} from '@stencil/postcss';
import {sass} from '@stencil/sass';
// @ts-ignore
import autoprefixer from 'autoprefixer';

export const config: Config = {
  namespace: 'stylo',
  outputTargets: [
    {
      type: 'dist'
    },
    {
      type: 'www',
      serviceWorker: null
    },
    {
      type: 'docs-readme'
    },
    {
      type: 'dist-custom-elements',
      autoDefineCustomElements: true
    }
  ],
  plugins: [
    sass(),
    postcss({
      plugins: [autoprefixer()]
    })
  ],
  devServer: {
    openBrowser: false
  },
  testing: {setupFilesAfterEnv: ['<rootDir>/src/jest-setup.ts']},
  extras: {
    experimentalImportInjection: true
  }
};
