<script setup lang="ts">
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { ref, computed, watch } from 'vue';

const props = defineProps<{
    visible: boolean;
}>();

const emit = defineEmits<{
    'update:visible': [value: boolean];
    save: [data: { currentPassword: string; newPassword: string }];
}>();

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');

watch(() => props.visible, (val) => {
    if (val) {
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
        error.value = '';
    }
});

const isValid = computed(() => {
    return currentPassword.value.length >= 1 
        && newPassword.value.length >= 6 
        && newPassword.value === confirmPassword.value;
});

const passwordMismatch = computed(() => {
    return confirmPassword.value.length > 0 && newPassword.value !== confirmPassword.value;
});

const passwordTooShort = computed(() => {
    return newPassword.value.length > 0 && newPassword.value.length < 6;
});

const handleSave = () => {
    if (!isValid.value) return;
    loading.value = true;
    error.value = '';
    emit('save', { 
        currentPassword: currentPassword.value, 
        newPassword: newPassword.value 
    });
};

const handleClose = () => {
    emit('update:visible', false);
};

// Expose methods for parent to control loading state
defineExpose({
    setLoading: (val: boolean) => { loading.value = val; },
    setError: (msg: string) => { error.value = msg; loading.value = false; }
});
</script>

<template>
    <Dialog :visible="visible" @update:visible="emit('update:visible', $event)" modal header="Change Password" 
        :style="{ width: '28rem' }" :closable="true" :draggable="false">
        <div class="space-y-6 pt-2">
            <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
            
            <div class="flex flex-col gap-2">
                <label for="current-password" class="text-sm font-medium text-gray-700">Current Password</label>
                <InputText id="current-password" v-model="currentPassword" type="password" class="w-full" 
                    placeholder="Enter current password" />
            </div>
            
            <div class="flex flex-col gap-2">
                <label for="new-password" class="text-sm font-medium text-gray-700">New Password</label>
                <InputText id="new-password" v-model="newPassword" type="password" class="w-full" 
                    placeholder="Enter new password (min 6 characters)" 
                    :class="{ 'p-invalid': passwordTooShort }" />
                <small v-if="passwordTooShort" class="text-red-500">Password must be at least 6 characters</small>
            </div>
            
            <div class="flex flex-col gap-2">
                <label for="confirm-password" class="text-sm font-medium text-gray-700">Confirm New Password</label>
                <InputText id="confirm-password" v-model="confirmPassword" type="password" class="w-full" 
                    placeholder="Confirm new password" 
                    :class="{ 'p-invalid': passwordMismatch }" />
                <small v-if="passwordMismatch" class="text-red-500">Passwords do not match</small>
            </div>
        </div>
        <template #footer>
            <div class="flex justify-end gap-3 pt-4">
                <Button label="Cancel" severity="secondary" @click="handleClose" :disabled="loading" />
                <Button label="Change Password" @click="handleSave" :loading="loading" :disabled="!isValid" />
            </div>
        </template>
    </Dialog>
</template>
