<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Button from 'primevue/button';

const toast = useToast();
const confirm = useConfirm();

const handleDeleteAccount = () => {
    confirm.require({
        message: 'Are you sure you want to delete your account? This action cannot be undone.',
        header: 'Delete Account',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Delete',
        rejectLabel: 'Cancel',
        acceptClass: 'p-button-danger',
        accept: () => {
            toast.add({
                severity: 'info',
                summary: 'Account deletion requested',
                detail: 'Your account deletion request has been submitted.',
                life: 5000
            });
        }
    });
};
</script>

<template>
    <div class="bg-surface border border-border rounded-lg">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-border">
            <h2 class="text-base font-semibold text-danger">Danger Zone</h2>
            <p class="text-sm text-foreground/60 mt-0.5">
                Irreversible and destructive actions. Be careful!
            </p>
        </div>

        <!-- Danger Zone Content -->
        <div class="p-6">
            <div class="border-2 border-danger/30 rounded-md bg-danger/5">
                <!-- Delete Account -->
                <div class="flex items-start justify-between px-5 py-4 border-b border-danger/20">
                    <div>
                        <h3 class="text-sm font-semibold text-foreground">Delete Account</h3>
                        <p class="text-xs text-foreground/60 mt-1">
                            Permanently delete your account and all associated data.
                        </p>
                    </div>
                    <Button
                        label="Delete Account"
                        icon="pi pi-trash"
                        severity="danger"
                        size="small"
                        @click="handleDeleteAccount"
                        class="press-animated"
                    />
                </div>

                <!-- Clear All Data -->
                <div class="flex items-start justify-between px-5 py-4">
                    <div>
                        <h3 class="text-sm font-semibold text-foreground">Clear All Data</h3>
                        <p class="text-xs text-foreground/60 mt-1">
                            Remove all your videos, playlists, and activity history.
                        </p>
                    </div>
                    <Button
                        label="Clear Data"
                        icon="pi pi-eraser"
                        severity="danger"
                        size="small"
                        outlined
                        class="press-animated"
                    />
                </div>
            </div>

            <!-- Warning Banner -->
            <div class="mt-4 border border-warning/30 bg-warning/5 rounded-md p-4">
                <div class="flex items-start gap-2">
                    <i class="pi pi-exclamation-triangle text-warning text-sm mt-0.5"></i>
                    <div class="text-xs text-foreground/70">
                        <p class="font-medium text-foreground mb-1">Warning</p>
                        <p>
                            These actions are permanent and cannot be undone.
                            Make sure you have backed up any important data before proceeding.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
