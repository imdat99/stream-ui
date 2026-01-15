import createVueApp from '@/shared/createVueApp';
import 'uno.css';

async function render() {
    const { app, router } = createVueApp();
    router.isReady().then(() => {
        app.mount('body', true)
    })
}
render().catch((error) => {
    console.error('Error during app initialization:', error)
})
