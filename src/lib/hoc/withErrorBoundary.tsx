import { defineComponent, onErrorCaptured, ref } from "vue";

export function withErrorBoundary(WrappedComponent: any) {
    return defineComponent({
        name: `WithErrorBoundary(${WrappedComponent.name})`,
        render() {
            if (this.hasError) {
                return (
                    <div class="flex items-center justify-center min-h-screen-sm">
                        <div class="p-8 space-y-lg max-w-lg w-full">
                            <p>
                                <b>500.&nbsp;</b>
                                <ins class="text-gray-500 decoration-none">Something went wrong.</ins>
                            </p>
                            <div class="font-thin">
                                <p>The server is currently experiencing temporary issues and cannot process your request. Please <a class="underline text-primary" href="/">try again</a> in a few minutes.</p>
                            </div>
                        </div>
                    </div>
                );
            }
            return <WrappedComponent {...this.$props} v-slots={this.$slots} />;
        },
        setup() {
            const hasError = ref(false);
            const error = ref<Error | null>(null);
            onErrorCaptured((err) => {
                hasError.value = true;
                error.value = err as Error;
                console.error("Error captured in withErrorBoundary:", err);
                return false; // Prevent further propagation
            });
            return { hasError, error, reset: () => { hasError.value = false; error.value = null; } };
        },
    });
}