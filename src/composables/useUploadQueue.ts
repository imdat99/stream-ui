import { ref, computed } from 'vue';

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
}

const items = ref<QueueItem[]>([]);

export function useUploadQueue() {
    
    const addFiles = (files: FileList) => {
        const newItems: QueueItem[] = Array.from(files).map((file) => ({
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            type: 'local',
            status: 'pending', // Start as pending
            progress: 0,
            uploaded: '0 MB',
            total: formatSize(file.size),
            speed: '0 MB/s',
            file: file,
            thumbnail: undefined // We could generate a thumbnail here if needed
        }));

        items.value.push(...newItems);
    };

    const addRemoteUrls = (urls: string[]) => {
        const newItems: QueueItem[] = urls.map((url) => ({
            id: Math.random().toString(36).substring(2, 9),
            name: url.split('/').pop() || 'Remote File',
            type: 'remote',
            status: 'fetching', // Remote URLs start fetching immediately or pending? User said "khi nao nhan upload". Let's use pending.
            progress: 0,
            uploaded: '0 MB',
            total: 'Unknown',
            speed: '0 MB/s',
            url: url
        }));
        
        // Override status to pending for consistency with user request
        newItems.forEach(i => i.status = 'pending');

        items.value.push(...newItems);
    };

    const removeItem = (id: string) => {
        const index = items.value.findIndex(item => item.id === id);
        if (index !== -1) {
            items.value.splice(index, 1);
        }
    };
    
    const startQueue = () => {
        items.value.forEach(item => {
            if (item.status === 'pending') {
                if (item.type === 'local') {
                    startMockUpload(item.id);
                } else {
                    startMockRemoteFetch(item.id);
                }
            }
        });
    };

    // Mock Upload Logic
    const startMockUpload = (id: string) => {
        const item = items.value.find(i => i.id === id);
        if (!item) return;

        item.status = 'uploading';
        let progress = 0;
        const totalSize = item.file ? item.file.size : 1024 * 1024 * 50; // Default 50MB if unknown
        
        // Random speed between 1MB/s and 5MB/s
        const speedBytesPerStep = (1024 * 1024) + Math.random() * (1024 * 1024 * 4); 
        
        const interval = setInterval(() => {
            if (progress >= 100) {
                clearInterval(interval);
                item.status = 'complete';
                item.progress = 100;
                item.uploaded = item.total;
                return;
            }

            // Increment progress randomly
            const increment = Math.random() * 5 + 1; // 1-6% increment
            progress = Math.min(progress + increment, 100);
            
            item.progress = Math.floor(progress);
             
            // Calculate uploaded size string
            const currentBytes = (progress / 100) * totalSize;
            item.uploaded = formatSize(currentBytes);
            
            // Re-randomize speed for realism
            const currentSpeed = (1024 * 1024) + Math.random() * (1024 * 1024 * 2);
            item.speed = formatSize(currentSpeed) + '/s';

        }, 500);
    };

    // Mock Remote Fetch Logic
    const startMockRemoteFetch = (id: string) => {
         const item = items.value.find(i => i.id === id);
        if (!item) return;
        
        item.status = 'fetching'; // Update status to fetching

        // Remote fetch takes some time then completes
         setTimeout(() => {
             // Switch to uploading/processing phase if we wanted, or just finish
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
        startQueue,
        totalSize,
        completeCount,
        pendingCount
    };
}
