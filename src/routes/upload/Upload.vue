<script setup lang="ts">
import PageHeader from '@/components/dashboard/PageHeader.vue';
import UploadModeToggle from './components/UploadModeToggle.vue';
import InfoTip from './components/InfoTip.vue';
import UploadDropzone from './components/UploadDropzone.vue';
import RemoteUrlForm from './components/RemoteUrlForm.vue';
import BulkActions from './components/BulkActions.vue';
import UploadQueue from './components/UploadQueue.vue';
import { ref } from 'vue';

const mode = ref<'local' | 'remote'>('local');

const handleFilesSelected = (files: FileList) => {
    console.log('Files selected:', files);
    // TODO: Handle file upload
};

const handleRemoteUrls = (urls: string[]) => {
    console.log('URLs submitted:', urls);
    // TODO: Handle remote URL import
};
</script>

<template>
    <div class="flex-1 flex items-stretch">
        <div class="flex-1 overflow-y-auto">
            <PageHeader class="block" title="Upload Videos" description="Choose your preferred method to upload videos."
                :breadcrumbs="[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Upload Videos' }
                ]" />
            <div class="flex flex-col max-w-4xl mx-auto gap-4">
                <UploadModeToggle v-model="mode" />
                <InfoTip />
                <Transition enter-active-class="transition-all duration-300 ease-in-out"
                    enter-from-class="opacity-0 transform translate-y-4"
                    enter-to-class="opacity-100 transform translate-y-0"
                    leave-active-class="transition-all duration-200 ease-in-out"
                    leave-from-class="opacity-100 transform translate-y-0"
                    leave-to-class="opacity-0 transform -translate-y-4" mode="out-in">
                    <UploadDropzone v-if="mode === 'local'" @files-selected="handleFilesSelected" />
                    <RemoteUrlForm v-else @submit="handleRemoteUrls" />
                </Transition>
                <BulkActions :visible="false" :pending-count="0" />
            </div>
        </div>
        <UploadQueue />
    </div>
</template>