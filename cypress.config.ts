import { defineConfig } from 'cypress';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/features/**/*.feature',
    supportFile: 'cypress/support/e2e.ts',
    
    async setupNodeEvents(on, config) {
      // Cucumber 전처리기 플러그인 추가
      await addCucumberPreprocessorPlugin(on, config);

      // esbuild 번들러 설정
      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      );

      return config;
    },

    // 스크린샷 및 비디오 설정
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: false,
    
    // 타임아웃 설정
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    
    // 뷰포트 설정
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});

