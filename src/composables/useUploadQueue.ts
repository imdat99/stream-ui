import { client as rpcClient } from '@/api/rpcclient';
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
    file?: File;
    url?: string;
    playbackUrl?: string;
    videoId?: string;
    objectKey?: string;
    cancelled?: boolean;
}

const items = ref<QueueItem[]>([]);
const MAX_ITEMS = 5;
const MAX_RETRY = 3;

const activeXhrs = new Map<string, XMLHttpRequest>();

const abortItem = (id: string) => {
    const xhr = activeXhrs.get(id);
    if (xhr) {
        xhr.abort();
        activeXhrs.delete(id);
    }
};

export function useUploadQueue() {
    const t = (key: string, params?: Record<string, unknown>) => key;

    const remainingSlots = computed(() => Math.max(0, MAX_ITEMS - items.value.length));

    const addFiles = (files: FileList) => {
        const allowed = Array.from(files).slice(0, remainingSlots.value);
        const duplicates: File[] = [];
        const fresh: File[] = [];

        for (const file of allowed) {
            const isDupe = items.value.some(
                item => item.type === 'local' && item.name === file.name && item.file?.size === file.size
            );
            if (isDupe) duplicates.push(file);
            else fresh.push(file);
        }

        const newItems: QueueItem[] = fresh.map((file) => ({
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            type: 'local',
            status: 'pending',
            progress: 0,
            uploaded: '0 MB',
            total: formatSize(file.size),
            speed: '0 MB/s',
            file,
            thumbnail: undefined,
            cancelled: false,
        }));

        items.value.push(...newItems);
        return { added: newItems.length, skipped: files.length - allowed.length, duplicates: duplicates.length };
    };

    const addRemoteUrls = (urls: string[]) => {
        const allowed = urls.slice(0, remainingSlots.value);
        const fresh = allowed.filter(url => !items.value.some(item => item.type === 'remote' && item.url === url));
        const duplicateCount = allowed.length - fresh.length;
        const newItems: QueueItem[] = fresh.map((url) => ({
            id: Math.random().toString(36).substring(2, 9),
            name: url.split('/').pop() || t('upload.queueItem.remoteFileName'),
            type: 'remote',
            status: 'pending',
            progress: 0,
            uploaded: '0 MB',
            total: t('upload.queueItem.unknownSize'),
            speed: '0 MB/s',
            url,
            cancelled: false,
        }));

        items.value.push(...newItems);
        return { added: newItems.length, skipped: urls.length - allowed.length, duplicates: duplicateCount };
    };

    const removeItem = (id: string) => {
        abortItem(id);
        const item = items.value.find(i => i.id === id);
        if (item) item.cancelled = true;
        const index = items.value.findIndex(item => item.id === id);
        if (index !== -1) items.value.splice(index, 1);
    };

    const cancelItem = (id: string) => {
        abortItem(id);
        const item = items.value.find(i => i.id === id);
        if (item) {
            item.cancelled = true;
            item.status = 'error';
            item.speed = '0 MB/s';
        }
    };

    const startQueue = () => {
        items.value.forEach(item => {
            if (item.status === 'pending') {
                if (item.type === 'local') {
                    startUpload(item.id);
                } else {
                    startMockRemoteFetch(item.id);
                }
            }
        });
    };

    const startUpload = async (id: string) => {
        const item = items.value.find(i => i.id === id);
        if (!item || !item.file) return;

        item.status = 'uploading';
        item.progress = 0;
        item.uploaded = '0 MB';
        item.speed = '0 MB/s';

        try {
            const response = await rpcClient.getUploadUrl({ filename: item.file.name });
            if (!response.uploadUrl || !response.key) {
                throw new Error(t('upload.errors.mergeFailed'));
            }

            item.objectKey = response.key;
            await uploadFileToPresignedUrl(item, response.uploadUrl);

            if (!item.cancelled) {
                item.status = 'processing';
                await completeUpload(item);
            }
        } catch (error) {
            if (!item.cancelled) {
                item.status = 'error';
                console.error('Upload failed:', error);
            }
        }
    };

    const uploadFileToPresignedUrl = async (item: QueueItem, uploadUrl: string) => {
        if (!item.file) return;

        for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
            try {
                await sendFile(item, uploadUrl);
                return;
            } catch (error) {
                if (item.cancelled) {
                    return;
                }
                if (attempt === MAX_RETRY) {
                    throw error;
                }
            }
        }
    };

    const sendFile = (item: QueueItem, uploadUrl: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!item.file) {
                resolve();
                return;
            }

            const xhr = new XMLHttpRequest();
            const startedAt = Date.now();

            activeXhrs.set(item.id, xhr);
            xhr.open('PUT', uploadUrl);
            if (item.file.type) {
                xhr.setRequestHeader('Content-Type', item.file.type);
            }

            const cleanup = () => {
                if (activeXhrs.get(item.id) === xhr) {
                    activeXhrs.delete(item.id);
                }
            };

            xhr.upload.onprogress = (event) => {
                if (!event.lengthComputable || !item.file) return;

                const uploadedBytes = event.loaded;
                const percent = Math.min((uploadedBytes / item.file.size) * 100, 100);
                const elapsedSeconds = Math.max((Date.now() - startedAt) / 1000, 0.001);
                const speed = uploadedBytes / elapsedSeconds;

                item.progress = parseFloat(percent.toFixed(1));
                item.uploaded = formatSize(uploadedBytes);
                item.total = formatSize(item.file.size);
                item.speed = `${formatSize(speed)}/s`;
            };

            xhr.onload = () => {
                cleanup();
                if (item.cancelled) {
                    resolve();
                    return;
                }
                if (xhr.status >= 200 && xhr.status < 300) {
                    item.progress = 100;
                    item.uploaded = item.total;
                    item.speed = '0 MB/s';
                    resolve();
                    return;
                }
                reject(new Error(t('upload.errors.chunkUploadFailed', { index: 1 })));
            };

            xhr.onerror = () => {
                cleanup();
                reject(new Error(t('upload.errors.chunkUploadFailed', { index: 1 })));
            };

            xhr.onabort = () => {
                cleanup();
                resolve();
            };

            xhr.send(item.file);
        });
    };

    const completeUpload = async (item: QueueItem) => {
        if (!item.file || !item.objectKey) return;

        try {
            const createResponse = await rpcClient.createVideo({
                title: item.file.name.replace(/\.[^.]+$/, ''),
                description: '',
                url: item.objectKey,
                size: item.file.size,
                duration: 0,
                format: item.file.type || 'video/mp4',
            });

            const createdVideo = createResponse.video;
            item.videoId = createdVideo?.id;
            item.playbackUrl = createdVideo?.url || item.objectKey;
            item.url = createdVideo?.url || item.objectKey;
            item.status = 'complete';
            item.progress = 100;
            item.uploaded = item.total;
            item.speed = '0 MB/s';
        } catch (error) {
            item.status = 'error';
            console.error('Create video failed:', error);
        }
    };

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
        const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
        return `${value} ${sizes[i]}`;
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

    function removeAll() {
        items.value = [];
    }

    return {
        items,
        addFiles,
        addRemoteUrls,
        removeItem,
        cancelItem,
        removeAll,
        startQueue,
        totalSize,
        completeCount,
        pendingCount,
        remainingSlots,
        maxItems: MAX_ITEMS,
    };
}
