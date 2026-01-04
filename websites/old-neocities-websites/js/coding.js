(async () => {
    eval(await (await fetch('/js/common.js')).text());
}) ();
