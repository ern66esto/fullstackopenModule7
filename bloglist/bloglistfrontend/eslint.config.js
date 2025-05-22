import js from '@eslint/js';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import pluginVitest from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';
import configPrettier from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';

export default defineConfig([
  {
    ignores: ['dist', '.eslintrc.cjs', 'node_modules', 'vite.config.js'],
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: { js, react: pluginReact, vitest: pluginVitest, prettier: pluginPrettier },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        'vitest-globals/env': true,
        jsdom: true,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
      'no-console': 'warn',
      eqeqeq: 'error',
      'prettier/prettier': 'error',
    },
  },
  { files: ['**/*.{js,mjs,cjs,jsx}'], languageOptions: { globals: globals.browser } },
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/prop-types': 'off',
      'react/jsx-uses-vars': 'error',
    },
  },
  pluginReact.configs.flat['jsx-runtime'],
  configPrettier,
]);
