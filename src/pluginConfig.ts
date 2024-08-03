import type { ExternalPluginConfig } from '@windy/interfaces.d';

const config: ExternalPluginConfig = {
    name: 'windy-plugin-wave-propegation-time-dev',
    version: '1.0.3',
    title: 'Wave propagation time',
    icon: '🌊',
    description: 'This plugin shows wave propagation time given the wave period.',
    author: 'Laagveen',
    repository: 'https://github.com/laagveen/windy-plugin-template',
    desktopUI: 'embedded',
    mobileUI: 'small',
    addToContextmenu: true,
    private: true,
};

export default config;

