<script setup lang="ts">
import AlertTriangleIcon from '@/components/icons/AlertTriangle.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import SlidersIcon from '@/components/icons/SlidersIcon.vue';
import AppButton from '@/components/app/AppButton.vue';
import { useAppConfirm } from '@/composables/useAppConfirm';
import { useAppToast } from '@/composables/useAppToast';

const toast = useAppToast();
const confirm = useAppConfirm();

const handleDeleteAccount = () => {
    confirm.require({
        message: 'Are you sure you want to delete your account? This action cannot be undone.',
        header: 'Delete Account',
        acceptLabel: 'Delete',
        rejectLabel: 'Cancel',
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

const handleClearData = () => {
    confirm.require({
        message: 'Are you sure you want to clear all your data? This action cannot be undone.',
        header: 'Clear All Data',
        acceptLabel: 'Clear',
        rejectLabel: 'Cancel',
        accept: () => {
            toast.add({
                severity: 'info',
                summary: 'Data cleared',
                detail: 'All your data has been permanently deleted.',
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

        <!-- Content -->
        <div class="divide-y divide-border">
            <!-- Delete Account -->
            <div class="flex items-center justify-between px-6 py-4 hover:bg-danger/5 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-md bg-danger/10 flex items-center justify-center shrink-0">
                        <AlertTriangleIcon class="w-5 h-5 text-danger" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Delete Account</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            Permanently delete your account and all associated data.
                        </p>
                    </div>
                </div>
                <AppButton variant="danger" size="sm" @click="handleDeleteAccount">
                    <template #icon>
                        <TrashIcon class="w-4 h-4" />
                    </template>
                    Delete Account
                </AppButton>
            </div>

            <!-- Clear All Data -->
            <div class="flex items-center justify-between px-6 py-4 hover:bg-danger/5 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-md bg-danger/10 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Clear All Data</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            Remove all your videos, playlists, and activity history.
                        </p>
                    </div>
                </div>
                <AppButton variant="danger" size="sm" @click="handleClearData">
                    <template #icon>
                        <SlidersIcon class="w-4 h-4" />
                    </template>
                    Clear Data
                </AppButton>
            </div>
        </div>

        <!-- Warning Banner -->
        <div class="mx-6 my-4 border border-warning/30 bg-warning/5 rounded-md p-4">
            <div class="flex items-start gap-2">
                <InfoIcon class="w-4 h-4 text-warning mt-0.5" />
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
</template>
