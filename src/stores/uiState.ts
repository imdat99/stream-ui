import { defineStore } from "pinia";
import { ref } from "vue";

export const useUIState = defineStore('uiState', () => {
    const uploadDialogVisible = ref(false);

    return {
        uploadDialogVisible,
        toggleUploadDialog: () => {
            uploadDialogVisible.value = !uploadDialogVisible.value;
        },
    };
});