import type { ExternalPluginConfig } from '@windy/interfaces.d';

const config: ExternalPluginConfig = {
    name: 'windy-plugin-wave-propegation-time',
    version: '1.0.2',
    title: 'Wave propagation time',
    icon: '🚁',
    description: 'This plugin demonstrates capabilities of Windy Plugin System.',
    author: 'Laagveen',
    repository: 'https://github.com/laagveen/windy-plugin-template',
    desktopUI: 'embedded',
    mobileUI: 'small',
    addToContextmenu: true,
    private: true,
};

export default config;

