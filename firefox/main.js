var pageMod = require('sdk/page-mod');
var data = require('sdk/self').data;

pageMod.PageMod({
    include: /https?:\/\/battlelog\.battlefield\.com\/bf4\/.*/,
    attachTo: [ 'existing', 'top' ],
    contentScriptWhen: 'ready',
    contentScriptFile: data.url('inject.js'),
    contentScriptOptions: {
        css: data.url('battletag.css'),
        js: data.url('battletag.js')
    }
});
