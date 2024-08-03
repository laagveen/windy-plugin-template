import type { ExternalPluginConfig } from '@windy/interfaces.d';

const config: ExternalPluginConfig = {
    name: 'windy-plugin-wave-propegation-time',
    version: '1.0.1',
    title: 'Wave propegation time',
    icon: '🚁',
    description: 'This plugin demonstrates capabilities of Windy Plugin System.',
    author: 'IL (Windy.com)',
    repository: 'https://github.com/windycom/windy-plugin-template',
    desktopUI: 'embedded',
    mobileUI: 'small',
    // Link to this plugin will be additional add to RH button context menu
    // which will enable to open plugin from context menu, with lat, lon
    // parameters passed to onopen method
    addToContextmenu: true,
    // Whenever user clicks on map and plugin i opened,
    // singleclick events is emitted with name of this plugin
    //listenToSingleclick: true,
};

export default config;
