<script setup lang="ts">
import { ref } from 'vue';
import AppButton from '@/components/app/AppButton.vue';
import AppDialog from '@/components/app/AppDialog.vue';
import AppInput from '@/components/app/AppInput.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import PlusIcon from '@/components/icons/PlusIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import AlertTriangleIcon from '@/components/icons/AlertTriangleIcon.vue';
import { useAppConfirm } from '@/composables/useAppConfirm';
import { useAppToast } from '@/composables/useAppToast';

const toast = useAppToast();
const confirm = useAppConfirm();

// Domain whitelist for iframe embedding
const domains = ref([
    { id: '1', name: 'example.com', addedAt: '2024-01-15' },
    { id: '2', name: 'mysite.org', addedAt: '2024-02-20' },
]);

const newDomain = ref('');
const showAddDialog = ref(false);

const handleAddDomain = () => {
    if (!newDomain.value.trim()) {
        toast.add({
            severity: 'error',
            summary: 'Invalid Domain',
            detail: 'Please enter a valid domain name.',
            life: 3000
        });
        return;
    }

    // Check for duplicates
    const exists = domains.value.some(d => d.name === newDomain.value.trim().toLowerCase());
    if (exists) {
        toast.add({
            severity: 'error',
            summary: 'Domain Already Added',
            detail: 'This domain is already in your whitelist.',
            life: 3000
        });
        return;
    }

    const domainName = newDomain.value.trim().toLowerCase();
    domains.value.push({
        id: Math.random().toString(36).substring(2, 9),
        name: domainName,
        addedAt: new Date().toISOString().split('T')[0]
    });

    newDomain.value = '';
    showAddDialog.value = false;
    toast.add({
        severity: 'success',
        summary: 'Domain Added',
        detail: `${domainName} has been added to your whitelist.`,
        life: 3000
    });
};

const handleRemoveDomain = (domain: typeof domains.value[0]) => {
    confirm.require({
        message: `Are you sure you want to remove ${domain.name} from your whitelist? Embedded iframes from this domain will no longer work.`,
        header: 'Remove Domain',
        acceptLabel: 'Remove',
        rejectLabel: 'Cancel',
        accept: () => {
            const index = domains.value.findIndex(d => d.id === domain.id);
            if (index !== -1) {
                domains.value.splice(index, 1);
            }
            toast.add({
                severity: 'info',
                summary: 'Domain Removed',
                detail: `${domain.name} has been removed from your whitelist.`,
                life: 3000
            });
        }
    });
};

const getIframeCode = () => {
    return `<iframe src="https://holistream.com/embed" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`;
};

const copyIframeCode = () => {
    navigator.clipboard.writeText(getIframeCode());
    toast.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'Embed code copied to clipboard.',
        life: 2000
    });
};
</script>

<template>
    <div class="bg-surface border border-border rounded-lg">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
                <h2 class="text-base font-semibold text-foreground">Allowed Domains</h2>
                <p class="text-sm text-foreground/60 mt-0.5">
                    Add domains to your whitelist to allow embedding content via iframe.
                </p>
            </div>
            <AppButton size="sm" @click="showAddDialog = true">
                <template #icon>
                    <PlusIcon class="w-4 h-4" />
                </template>
                Add Domain
            </AppButton>
        </div>

        <!-- Info Banner -->
        <div class="px-6 py-3 bg-info/5 border-b border-info/20">
            <div class="flex items-start gap-2">
                <InfoIcon class="w-4 h-4 text-info mt-0.5" />
                <div class="text-xs text-foreground/70">
                    Only domains in your whitelist can embed your content using iframe.
                </div>
            </div>
        </div>

        <!-- Domain List -->
        <div class="border-b border-border">
            <table class="w-full">
                <thead class="bg-muted/30">
                    <tr>
                        <th class="text-left text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">Domain</th>
                        <th class="text-left text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">Added Date</th>
                        <th class="text-right text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border">
                    <tr
                        v-for="domain in domains"
                        :key="domain.id"
                        class="hover:bg-muted/30 transition-all"
                    >
                        <td class="px-6 py-3">
                            <div class="flex items-center gap-2">
                                <LinkIcon class="w-4 h-4 text-foreground/40" />
                                <span class="text-sm font-medium text-foreground">{{ domain.name }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-3 text-sm text-foreground/60">{{ domain.addedAt }}</td>
                        <td class="px-6 py-3 text-right">
                            <AppButton variant="ghost" size="sm" @click="handleRemoveDomain(domain)">
                                <template #icon>
                                    <TrashIcon class="w-4 h-4 text-danger" />
                                </template>
                            </AppButton>
                        </td>
                    </tr>
                    <tr v-if="domains.length === 0">
                        <td colspan="3" class="px-6 py-12 text-center">
                            <LinkIcon class="w-10 h-10 text-foreground/30 mb-3 block mx-auto" />
                            <p class="text-sm text-foreground/60 mb-1">No domains in whitelist</p>
                            <p class="text-xs text-foreground/40">Add a domain to allow iframe embedding</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Embed Code Section -->
        <div class="px-6 py-4 bg-muted/30">
            <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-medium text-foreground">Embed Code</h4>
                <AppButton variant="secondary" size="sm" @click="copyIframeCode">
                    <template #icon>
                        <CheckIcon class="w-4 h-4" />
                    </template>
                    Copy Code
                </AppButton>
            </div>
            <p class="text-xs text-foreground/60 mb-2">
                Use this iframe code to embed content on your whitelisted domains.
            </p>
            <pre class="bg-surface border border-border rounded-md p-3 text-xs text-foreground/70 overflow-x-auto"><code>{{ getIframeCode() }}</code></pre>
        </div>

        <!-- Add Domain Dialog -->
        <AppDialog
            :visible="showAddDialog"
            @update:visible="showAddDialog = $event"
            title="Add Domain to Whitelist"
            maxWidthClass="max-w-md"
        >
            <div class="space-y-4">
                <div class="grid gap-2">
                    <label for="domain" class="text-sm font-medium text-foreground">Domain Name</label>
                    <AppInput
                        id="domain"
                        v-model="newDomain"
                        placeholder="example.com"
                        @enter="handleAddDomain"
                    />
                    <p class="text-xs text-foreground/50">Enter domain without www or https:// (e.g., example.com)</p>
                </div>

                <div class="bg-warning/5 border border-warning/20 rounded-md p-3">
                    <div class="flex items-start gap-2">
                        <AlertTriangleIcon class="w-4 h-4 text-warning mt-0.5" />
                        <div class="text-xs text-foreground/70">
                            <p class="font-medium text-foreground mb-1">Important</p>
                            <p>Only add domains that you own and control.</p>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <AppButton variant="secondary" size="sm" @click="showAddDialog = false">
                    Cancel
                </AppButton>
                <AppButton size="sm" @click="handleAddDomain">
                    <template #icon>
                        <CheckIcon class="w-4 h-4" />
                    </template>
                    Add Domain
                </AppButton>
            </template>
        </AppDialog>
    </div>
</template>
