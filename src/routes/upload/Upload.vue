<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Upload Video</h1>
    
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div v-if="!file" class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-10 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" @drop.prevent="handleDrop" @dragover.prevent>
        <input type="file" id="fileInput" class="hidden" accept="video/*" @change="handleFileSelect">
        <label for="fileInput" class="cursor-pointer">
          <span class="i-heroicons-cloud-arrow-up text-6xl text-gray-400 mb-4 inline-block"></span>
          <p class="text-xl font-medium text-gray-700 dark:text-gray-200">Drag & drop your video here</p>
          <p class="text-sm text-gray-500 mt-2">or click to browse</p>
        </label>
      </div>

      <div v-else class="space-y-6">
        <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded">
           <div class="flex items-center space-x-3 overflow-hidden">
                <span class="i-heroicons-video-camera text-2xl text-primary-500 flex-shrink-0"></span>
                <span class="truncate font-medium">{{ file.name }}</span>
                <span class="text-xs text-gray-500 flex-shrink-0">({{ formatBytes(file.size) }})</span>
           </div>
           <button @click="resetFile" class="text-red-500 hover:text-red-700 flex-shrink-0" :disabled="uploading">
               <span class="i-heroicons-x-mark text-xl"></span>
           </button>
        </div>

        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">Title</label>
                <input v-model="form.title" type="text" class="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-2" placeholder="My Awesome Video">
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Description</label>
                <textarea v-model="form.description" class="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-2" rows="3" placeholder="Describe your video..."></textarea>
            </div>
        </div>

        <div v-if="uploadError" class="text-red-500 text-sm">
            {{ uploadError }}
        </div>

        <div v-if="uploading" class="space-y-2">
            <div class="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{{ uploadProgress }}%</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-primary-600 transition-all duration-300" :style="{ width: `${uploadProgress}%` }"></div>
            </div>
        </div>

        <button 
            @click="startUpload" 
            class="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="uploading || !form.title"
        >
            {{ uploading ? 'Uploading...' : 'Upload Video' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { client } from '@/api/client';

const router = useRouter();

const file = ref<File | null>(null);
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadError = ref<string | null>(null);

const form = reactive({
    title: '',
    description: ''
});

const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        file.value = target.files[0];
        form.title = file.value.name.replace(/\.[^/.]+$/, ""); // Default title from filename
    }
};

const handleDrop = (event: DragEvent) => {
    if (event.dataTransfer?.files.length) {
        file.value = event.dataTransfer.files[0];
        form.title = file.value.name.replace(/\.[^/.]+$/, "");
    }
};

const resetFile = () => {
    file.value = null;
    form.title = '';
    form.description = '';
    uploadError.value = null;
    uploadProgress.value = 0;
};

const startUpload = async () => {
    if (!file.value || !form.title) return;
    
    uploading.value = true;
    uploadError.value = null;
    uploadProgress.value = 0;

    try {
        // 1. Get Presigned URL
        const presignedResponse = await client.videos.uploadUrlCreate({
            filename: file.value.name,
            content_type: file.value.type,
            size: file.value.size
        });
        
        // Check for data in response
        const data = (presignedResponse.data as any).data || presignedResponse.data;
        if (!data || !data.url) {
            throw new Error('Failed to get upload URL');
        }

        const uploadUrl = data.url;
        const finalVideoUrl = data.key || uploadUrl.split('?')[0]; // Assuming key is returned or can be derived

        // 2. Upload file to S3 (using XMLHttpRequest for progress)
        await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', uploadUrl, true);
            xhr.setRequestHeader('Content-Type', file.value!.type);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    uploadProgress.value = Math.round((e.loaded / e.total) * 100);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error('Network error during upload'));
            xhr.send(file.value);
        });

        // 3. Create Video Record
        await client.videos.videosCreate({
            title: form.title,
            description: form.description,
            size: file.value.size,
            format: file.value.type,
            url: finalVideoUrl,
            // duration is optional, server might process it
        });

        // Redirect to videos page
        router.push({ name: 'video' });

    } catch (err: any) {
        console.error(err);
        uploadError.value = err.message || 'Upload failed';
    } finally {
        uploading.value = false;
    }
};

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>
