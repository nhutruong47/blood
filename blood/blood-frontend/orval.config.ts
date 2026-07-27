import { defineConfig } from 'orval';

export default defineConfig({
  bloodapi: {
    input: 'http://localhost:8080/v3/api-docs',
    output: {
      mode: 'tags-split',
      target: 'src/shared/api/generated/bloodapi.ts',
      schemas: 'src/shared/api/generated/model',
      client: 'react-query',
      mock: false,
      prettier: true,
      override: {
        mutator: {
          path: 'src/shared/api/axios-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
