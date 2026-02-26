import { computed, ref } from 'vue';

export interface QueueItem {
    id: string;
    name: string;
    type: 'local' | 'remote';
    status: 'uploading' | 'processing' | 'fetching' | 'complete' | 'error' | 'pending';
    progress?: number;
    uploaded?: string;
    total?: string;
    speed?: string;
    thumbnail?: string;
    file?: File; // Keep reference to file for local uploads
    url?: string; // Keep reference to url for remote uploads
    // Upload chunk tracking
    activeChunks?: number;
    uploadedUrls?: string[];
    cancelled?: boolean;
}

const items = ref<QueueItem[]>([]);

// Chunk upload configuration
const CHUNK_SIZE = 90 * 1024 * 1024; // 90MB per chunk
const MAX_PARALLEL = 3;
const MAX_RETRY = 3;

export function useUploadQueue() {
    
    const addFiles = (files: FileList) => {
        const newItems: QueueItem[] = Array.from(files).map((file) => ({
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            type: 'local',
            status: 'pending',
            progress: 0,
            uploaded: '0 MB',
            total: formatSize(file.size),
            speed: '0 MB/s',
            file: file,
            thumbnail: undefined,
            activeChunks: 0,
            uploadedUrls: [],
            cancelled: false
        }));

        items.value.push(...newItems);
    };

    const addRemoteUrls = (urls: string[]) => {
        const newItems: QueueItem[] = urls.map((url) => ({
            id: Math.random().toString(36).substring(2, 9),
            name: url.split('/').pop() || 'Remote File',
            type: 'remote',
            status: 'pending',
            progress: 0,
            uploaded: '0 MB',
            total: 'Unknown',
            speed: '0 MB/s',
            url: url,
            activeChunks: 0,
            uploadedUrls: [],
            cancelled: false
        }));

        items.value.push(...newItems);
    };

    const removeItem = (id: string) => {
        const item = items.value.find(i => i.id === id);
        if (item) {
            item.cancelled = true;
        }
        const index = items.value.findIndex(item => item.id === id);
        if (index !== -1) {
            items.value.splice(index, 1);
        }
    };
    
    const cancelItem = (id: string) => {
        const item = items.value.find(i => i.id === id);
        if (item) {
            item.cancelled = true;
            item.status = 'error';
        }
    };
    
    const startQueue = () => {
        items.value.forEach(item => {
            if (item.status === 'pending') {
                if (item.type === 'local') {
                    startChunkUpload(item.id);
                } else {
                    startMockRemoteFetch(item.id);
                }
            }
        });
    };

    // Real Chunk Upload Logic
    const startChunkUpload = async (id: string) => {
        const item = items.value.find(i => i.id === id);
        if (!item || !item.file) return;

        item.status = 'uploading';
        item.activeChunks = 0;
        item.uploadedUrls = [];
        
        const file = item.file;
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const progressMap = new Map<number, number>(); // chunk index -> uploaded bytes
        const queue: number[] = Array.from({ length: totalChunks }, (_, i) => i);
        
        const updateProgress = () => {
            let totalUploaded = 0;
            progressMap.forEach(value => {
                totalUploaded += value;
            });
            const percent = Math.min((totalUploaded / file.size) * 100, 100);
            item.progress = parseFloat(percent.toFixed(1));
            item.uploaded = formatSize(totalUploaded);
            
            // Calculate speed (simplified)
            const currentSpeed = item.activeChunks ? item.activeChunks * 2 * 1024 * 1024 : 0;
            item.speed = formatSize(currentSpeed) + '/s';
        };

        const processQueue = async () => {
            if (item.cancelled) return;

            const activePromises: Promise<void>[] = [];

            while ((item.activeChunks || 0) < MAX_PARALLEL && queue.length > 0) {
                const index = queue.shift()!;
                item.activeChunks = (item.activeChunks || 0) + 1;
                
                const promise = uploadChunk(index, file, progressMap, updateProgress, item)
                    .then(() => {
                        item.activeChunks = (item.activeChunks || 0) - 1;
                    });
                activePromises.push(promise);
            }

            if (activePromises.length > 0) {
                await Promise.all(activePromises);
                await processQueue();
            }
        };

        try {
            await processQueue();
            
            if (!item.cancelled) {
                item.status = 'processing';
                await completeUpload(item);
            }
        } catch (error) {
            item.status = 'error';
            console.error('Upload failed:', error);
        }
    };

    const uploadChunk = (
        index: number,
        file: File,
        progressMap: Map<number, number>,
        updateProgress: () => void,
        item: QueueItem
    ): Promise<void> => {
        return new Promise((resolve, reject) => {
            let retry = 0;

            const attempt = () => {
                if (item.cancelled) return resolve();

                const start = index * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);

                const formData = new FormData();
                formData.append('file', chunk, file.name);

                const xhr = new XMLHttpRequest();
                xhr.open('POST', 'https://tmpfiles.org/api/v1/upload');

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        progressMap.set(index, e.loaded);
                        updateProgress();
                    }
                };

                xhr.onload = function() {
                    if (xhr.status === 200) {
                        try {
                            const res = JSON.parse(xhr.responseText);
                            if (res.status === 'success') {
                                progressMap.set(index, chunk.size);
                                if (item.uploadedUrls) {
                                    item.uploadedUrls[index] = res.data.url;
                                }
                                updateProgress();
                                resolve();
                                return;
                            }
                        } catch {
                            handleError();
                        }
                    }
                    handleError();
                };

                xhr.onerror = handleError;

                function handleError() {
                    retry++;
                    if (retry <= MAX_RETRY) {
                        setTimeout(attempt, 2000);
                    } else {
                        item.status = 'error';
                        reject(new Error(`Failed to upload chunk ${index + 1}`));
                    }
                };

                xhr.send(formData);
            };

            attempt();
        });
    };

    const completeUpload = async (item: QueueItem) => {
        if (!item.file || !item.uploadedUrls) return;

        try {
            const response = await fetch('/merge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: item.file.name,
                    chunks: item.uploadedUrls
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Merge failed');
            }

            item.status = 'complete';
            item.progress = 100;
            item.uploaded = item.total;
            item.speed = '0 MB/s';
        } catch (error) {
            item.status = 'error';
            console.error('Merge failed:', error);
        }
    };

    // Mock Remote Fetch Logic
    const startMockRemoteFetch = (id: string) => {
         const item = items.value.find(i => i.id === id);
        if (!item) return;
        
        item.status = 'fetching';

         setTimeout(() => {
             item.status = 'complete';
             item.progress = 100;
         }, 3000 + Math.random() * 3000);
    };


    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const totalSize = computed(() => {
        let total = 0;
        items.value.forEach(item => {
            if (item.file) total += item.file.size;
        });
        return formatSize(total);
    });

    const completeCount = computed(() => {
        return items.value.filter(i => i.status === 'complete').length;
    });

    const pendingCount = computed(() => {
        return items.value.filter(i => i.status === 'pending').length;
    });

    return {
        items,
        addFiles,
        addRemoteUrls,
        removeItem,
        cancelItem,
        startQueue,
        totalSize,
        completeCount,
        pendingCount
    };
}
