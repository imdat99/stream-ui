import type { ModelVideo } from "@/api/client";

export const mockVideos: ModelVideo[] = [
    {
        id: '1',
        title: 'Getting Started with Stream UI',
        description: 'A comprehensive guide to using the new Stream UI platform for your daily tasks.',
        thumbnail: 'https://picsum.photos/seed/video1/640/360',
        duration: 345, // 5m 45s
        status: 'ready',
        size: 1024 * 1024 * 45, // 45MB
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        views: 12500,
        url: '#'
    },
    {
        id: '2',
        title: 'Advanced Editing Techniques',
        description: 'Learn how to edit your videos like a pro using our built-in tools.',
        thumbnail: 'https://picsum.photos/seed/video2/640/360',
        duration: 890, // 14m 50s
        status: 'processing',
        processing_status: '75%',
        size: 1024 * 1024 * 128, // 128MB
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        views: 0,
        url: '#'
    },
    {
        id: '3',
        title: 'Project Alpha Demo',
        description: 'Internal demonstration of the upcoming Project Alpha features.',
        thumbnail: 'https://picsum.photos/seed/video3/640/360',
        duration: 120, // 2m 00s
        status: 'ready',
        size: 1024 * 1024 * 25, // 25MB
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
        views: 340,
        url: '#'
    },
    {
        id: '4',
        title: 'Weekly Team Standup',
        description: 'Recording of the weekly engineering team standup meeting.',
        thumbnail: 'https://picsum.photos/seed/video4/640/360',
        duration: 1800, // 30m 00s
        status: 'ready',
        size: 1024 * 1024 * 350, // 350MB
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 2 weeks ago
        views: 12,
        url: '#'
    },
    {
        id: '5',
        title: 'Funny Cat Compilation',
        description: 'A collection of the funniest cat videos found on the internet.',
        thumbnail: 'https://picsum.photos/seed/video5/640/360',
        duration: 600, // 10m 00s
        status: 'failed',
        size: 1024 * 1024 * 80, // 80MB
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        views: 0,
        url: '#'
    },
    {
        id: '6',
        title: 'Product Launch Event 2024',
        description: 'Full coverage of our annual product launch event in San Francisco.',
        thumbnail: 'https://picsum.photos/seed/video6/640/360',
        duration: 5400, // 1h 30m
        status: 'ready',
        size: 1024 * 1024 * 1024 * 2.5, // 2.5GB
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 1 month ago
        views: 45000,
        url: '#'
    },
     {
        id: '7',
        title: 'Tutorial: React vs Vue',
        description: 'Comparing the two most popular frontend frameworks.',
        thumbnail: 'https://picsum.photos/seed/video7/640/360',
        duration: 1540, 
        status: 'ready',
        size: 1024 * 1024 * 200, 
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        views: 8900,
        url: '#'
    },
     {
        id: '8',
        title: 'Nature Documentary - 4K',
        description: 'Breathtaking views of mountains and rivers.',
        thumbnail: 'https://picsum.photos/seed/video8/640/360',
        duration: 3200, 
        status: 'ready',
        size: 1024 * 1024 * 800, 
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        views: 1500,
        url: '#'
    },
     {
        id: '9',
        title: 'Nature Documentary - 4K',
        description: 'Breathtaking views of mountains and rivers.',
        thumbnail: 'https://picsum.photos/seed/video8/640/360',
        duration: 3200, 
        status: 'ready',
        size: 1024 * 1024 * 800, 
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        views: 1500,
        url: '#'
    },
     {
        id: '10',
        title: 'Nature Documentary - 4K',
        description: 'Breathtaking views of mountains and rivers.',
        thumbnail: 'https://picsum.photos/seed/video8/640/360',
        duration: 3200, 
        status: 'ready',
        size: 1024 * 1024 * 800, 
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        views: 1500,
        url: '#'
    },
     {
        id: '11',
        title: 'Nature Documentary - 4K',
        description: 'Breathtaking views of mountains and rivers.',
        thumbnail: 'https://picsum.photos/seed/video8/640/360',
        duration: 3200, 
        status: 'ready',
        size: 1024 * 1024 * 800, 
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        views: 1500,
        url: '#'
    },
     {
        id: '12',
        title: 'Nature Documentary - 4K',
        description: 'Breathtaking views of mountains and rivers.',
        thumbnail: 'https://picsum.photos/seed/video8/640/360',
        duration: 3200, 
        status: 'ready',
        size: 1024 * 1024 * 800, 
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        views: 1500,
        url: '#'
    },
     {
        id: '13',
        title: 'Nature Documentary - 4K',
        description: 'Breathtaking views of mountains and rivers.',
        thumbnail: 'https://picsum.photos/seed/video8/640/360',
        duration: 3200, 
        status: 'ready',
        size: 1024 * 1024 * 800, 
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        views: 1500,
        url: '#'
    },
     {
        id: '14',
        title: 'Nature Documentary - 4K',
        description: 'Breathtaking views of mountains and rivers.',
        thumbnail: 'https://picsum.photos/seed/video8/640/360',
        duration: 3200, 
        status: 'ready',
        size: 1024 * 1024 * 800, 
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        views: 1500,
        url: '#'
    },
     {
        id: '15',
        title: 'Nature Documentary - 4K',
        description: 'Breathtaking views of mountains and rivers.',
        thumbnail: 'https://picsum.photos/seed/video8/640/360',
        duration: 3200, 
        status: 'ready',
        size: 1024 * 1024 * 800, 
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        views: 1500,
        url: '#'
    },
     {
        id: '16',
        title: 'Nature Documentary - 4K',
        description: 'Breathtaking views of mountains and rivers.',
        thumbnail: 'https://picsum.photos/seed/video8/640/360',
        duration: 3200, 
        status: 'ready',
        size: 1024 * 1024 * 800, 
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        views: 1500,
        url: '#'
    },
     {
        id: '17',
        title: 'Nature Documentary - 4K',
        description: 'Breathtaking views of mountains and rivers.',
        thumbnail: 'https://picsum.photos/seed/video8/640/360',
        duration: 3200, 
        status: 'ready',
        size: 1024 * 1024 * 800, 
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        views: 1500,
        url: '#'
    },
     {
        id: '18',
        title: 'Nature Documentary - 4K',
        description: 'Breathtaking views of mountains and rivers.',
        thumbnail: 'https://picsum.photos/seed/video8/640/360',
        duration: 3200, 
        status: 'ready',
        size: 1024 * 1024 * 800, 
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        views: 1500,
        url: '#'
    },
     {
        id: '19',
        title: 'Nature Documentary - 4K',
        description: 'Breathtaking views of mountains and rivers.',
        thumbnail: 'https://picsum.photos/seed/video8/640/360',
        duration: 3200, 
        status: 'ready',
        size: 1024 * 1024 * 800, 
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        views: 1500,
        url: '#'
    },
     {
        id: '20',
        title: 'Nature Documentary - 4K',
        description: 'Breathtaking views of mountains and rivers.',
        thumbnail: 'https://picsum.photos/seed/video8/640/360',
        duration: 3200, 
        status: 'ready',
        size: 1024 * 1024 * 800, 
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        views: 1500,
        url: '#'
    },
     {
        id: '21',
        title: 'Nature Documentary - 4K',
        description: 'Breathtaking views of mountains and rivers.',
        thumbnail: 'https://picsum.photos/seed/video8/640/360',
        duration: 3200, 
        status: 'ready',
        size: 1024 * 1024 * 800, 
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        views: 1500,
        url: '#'
    },
     {
        id: '22',
        title: 'Nature Documentary - 4K',
        description: 'Breathtaking views of mountains and rivers.',
        thumbnail: 'https://picsum.photos/seed/video8/640/360',
        duration: 3200, 
        status: 'ready',
        size: 1024 * 1024 * 800, 
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        views: 1500,
        url: '#'
    },
     {
        id: '23',
        title: 'Nature Documentary - 4K',
        description: 'Breathtaking views of mountains and rivers.',
        thumbnail: 'https://picsum.photos/seed/video8/640/360',
        duration: 3200, 
        status: 'ready',
        size: 1024 * 1024 * 800, 
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        views: 1500,
        url: '#'
    },
]

interface FetchVideosParams {
    page: number;
    limit: number;
    searchQuery?: string;
    status?: string;
}

export const fetchMockVideos = async ({ page, limit, searchQuery, status }: FetchVideosParams) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    let filtered = [...mockVideos];

    // Filter by search query
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(v =>
            v.title?.toLowerCase().includes(query) ||
            v.description?.toLowerCase().includes(query)
        );
    }

    // Filter by status
    if (status && status !== 'all') {
        filtered = filtered.filter(v => v.status?.toLowerCase() === status.toLowerCase());
    }

    const total = filtered.length;

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = filtered.slice(start, end);

    return {
        data,
        total
    };
};
