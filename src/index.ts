const { app, globalShortcut } = require('electron');

app.whenReady().then(() => {
    globalShortcut.register('F9', () => {
        console.log('F9 key pressed');
    });
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});