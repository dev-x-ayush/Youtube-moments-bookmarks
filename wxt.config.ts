import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'YouTube Moment Notes',
    description: 'Save timestamped notes on YouTube videos.',
    permissions: ['activeTab', 'scripting'],
    host_permissions: ['https://www.youtube.com/*'],
    action: {
      default_title: 'YouTube Moment Notes',
    },
  },
});
