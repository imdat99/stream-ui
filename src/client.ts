import { createApp } from './main';
import 'uno.css';
async function render() {
    const { app, router } = createApp();
    router.isReady().then(() => {
        app.mount('body', true)
    })
}
render().catch((error) => {
    console.error('Error during app initialization:', error)
})
