function main() {
    var head = document.getElementsByTagName('head')[0];

    var css = document.createElement('link');
    css.setAttribute('rel', 'stylesheet');
    css.setAttribute('type', 'text/css');
    css.setAttribute('href', @@CSS@@);
    head.appendChild(css);

    var jshref = @@JS@@;@@CHECK@@
    var js = document.createElement('script');
    js.setAttribute('type', 'text/javascript');
    js.setAttribute('src', jshref);
    head.appendChild(js);
}

main();
