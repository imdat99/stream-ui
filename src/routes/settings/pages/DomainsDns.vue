<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';

const toast = useToast();
const confirm = useConfirm();

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

    domains.value.push({
        id: Math.random().toString(36).substring(2, 9),
        name: newDomain.value.trim().toLowerCase(),
        addedAt: new Date().toISOString().split('T')[0]
    });

    newDomain.value = '';
    showAddDialog.value = false;
    toast.add({
        severity: 'success',
        summary: 'Domain Added',
        detail: `${newDomain.value} has been added to your whitelist.`,
        life: 3000
    });
};

const handleRemoveDomain = (domain: typeof domains.value[0]) => {
    confirm.require({
        message: `Are you sure you want to remove ${domain.name} from your whitelist? Embedded iframes from this domain will no longer work.`,
        header: 'Remove Domain',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Remove',
        rejectLabel: 'Cancel',
        acceptClass: 'p-button-danger',
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
            <Button
                label="Add Domain"
                icon="pi pi-plus"
                size="small"
                @click="showAddDialog = true"
                class="press-animated"
            />
        </div>

        <!-- Info Banner -->
        <div class="px-6 py-3 bg-info/5 border-b border-info/20">
            <div class="flex items-start gap-2">
                <i class="pi pi-info-circle text-info text-sm mt-0.5"></i>
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
                                <i class="pi pi-globe text-foreground/40 text-sm"></i>
                                <span class="text-sm font-medium text-foreground">{{ domain.name }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-3 text-sm text-foreground/60">{{ domain.addedAt }}</td>
                        <td class="px-6 py-3 text-right">
                            <Button
                                icon="pi pi-trash"
                                text
                                severity="danger"
                                size="small"
                                @click="handleRemoveDomain(domain)"
                            />
                        </td>
                    </tr>
                    <tr v-if="domains.length === 0">
                        <td colspan="3" class="px-6 py-12 text-center">
                            <i class="pi pi-globe text-3xl text-foreground/30 mb-3 block"></i>
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
                <Button
                    label="Copy Code"
                    icon="pi pi-copy"
                    size="small"
                    text
                    @click="copyIframeCode"
                />
            </div>
            <p class="text-xs text-foreground/60 mb-2">
                Use this iframe code to embed content on your whitelisted domains.
            </p>
            <pre class="bg-surface border border-border rounded-md p-3 text-xs text-foreground/70 overflow-x-auto"><code>{{ getIframeCode() }}</code></pre>
        </div>

        <!-- Add Domain Dialog -->
        <Dialog
            v-model:visible="showAddDialog"
            header="Add Domain to Whitelist"
            :modal="true"
            :closable="true"
            class="w-full max-w-md"
        >
            <div class="space-y-4">
                <div class="grid gap-2">
                    <label for="domain" class="text-sm font-medium text-foreground">Domain Name</label>
                    <InputText
                        id="domain"
                        v-model="newDomain"
                        placeholder="example.com"
                        class="w-full"
                        @keyup.enter="handleAddDomain"
                    />
                    <p class="text-xs text-foreground/50">Enter domain without www or https:// (e.g., example.com)</p>
                </div>

                <div class="bg-warning/5 border border-warning/20 rounded-md p-3">
                    <div class="flex items-start gap-2">
                        <i class="pi pi-exclamation-triangle text-warning text-sm mt-0.5"></i>
                        <div class="text-xs text-foreground/70">
                            <p class="font-medium text-foreground mb-1">Important</p>
                            <p>Only add domains that you own and control.</p>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button
                    label="Cancel"
                    text
                    @click="showAddDialog = false"
                />
                <Button
                    label="Add Domain"
                    icon="pi pi-check"
                    @click="handleAddDomain"
                    class="press-animated"
                />
            </template>
        </Dialog>
    </div>
</template>
