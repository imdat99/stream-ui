<script setup lang="ts">
import Upload from '@/components/icons/Upload.vue';

</script>

<template>
    <main class="flex-1 flex items-stretch">
        
        <div class="flex-1 p-8 lg:p-12 overflow-y-auto">
            <div class="max-w-4xl mx-auto">
                
                <header class="mb-10">
                    <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Tải lên Video</h1>
                    <p class="text-lg text-slate-500 mt-2">Chọn phương thức tải lên để bắt đầu xử lý.</p>
                </header>

                <div class="inline-flex bg-slate-100 p-1 rounded-2xl mb-8 relative z-0">
                    <div id="pill-bg" class="absolute left-1 top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out -z-10"></div>
                    <button onclick="switchView('local')" id="btn-local" class="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-900 rounded-xl transition-colors relative z-10">
                        <hard-drive-upload class="w-5 h-5"/> Từ máy tính
                    </button>
                    <button onclick="switchView('remote')" id="btn-remote" class="flex items-center gap-2 px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-xl transition-colors relative z-10">
                        <link-icon class="w-5 h-5"/> Remote URL
                    </button>
                </div>

                <div id="view-local" class="transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] opacity-100 translate-y-0">
                    <div class="relative group cursor-pointer">
                         <input type="file" multiple class="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" onchange="simulateUploadStart()">
                        
                        <div class="bg-gradient-to-tr from-slate-50 to-white rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-200 group-hover:border-success/50 group-hover:shadow-soft transition-all duration-300 relative overflow-hidden">
                            
                            <div class="absolute top-0 left-0 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div class="absolute bottom-0 right-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            
                            <div class="relative z-10 flex flex-col items-center">
                                <div class="w-24 h-24 mb-8 rounded-3xl bg-white shadow-soft flex items-center justify-center text-accent group-hover:scale-110 group-hover:shadow-card-hover transition-all duration-300 ring-4 ring-slate-50 group-hover:ring-indigo-50">
                                    <Upload class="w-10 h-10"></Upload>
                                </div>
                                
                                <h3 class="text-2xl font-semibold text-slate-900 mb-3">Kéo thả video của bạn vào đây</h3>
                                <p class="text-slate-500 text-base mb-8 max-w-md mx-auto leading-relaxed">Hỗ trợ tải nhiều file cùng lúc. Định dạng MP4, MOV, MKV. Tối đa 10GB mỗi file.</p>
                                
                                <span class="px-8 py-3.5 btn-lg btn-primary">
                                    <i data-lucide="folder-open" class="w-5 h-5"></i>
                                    Duyệt file từ thiết bị
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                 <div id="view-remote" class="hidden transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] opacity-0 translate-y-4">
                    <div class="bg-white rounded-[2rem] shadow-soft p-10 border border-slate-100/50">
                        <label class="block text-lg font-semibold text-slate-900 mb-4">Nhập đường dẫn Video</label>
                        
                        <div class="flex gap-4 items-start">
                            <div class="flex-1 relative group">
                                <div class="absolute left-4 top-4 text-slate-400 group-focus-within:text-accent transition-colors">
                                    <i data-lucide="globe" class="w-6 h-6"></i>
                                </div>
                                <textarea placeholder="Dán một hoặc nhiều link (mỗi link một dòng)...&#10;https://drive.google.com/file/..." 
                                    class="w-full pl-12 pr-4 py-4 h-32 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-accent focus:bg-white focus:ring-0 transition-all resize-none text-slate-800 placeholder:text-slate-400 text-base leading-relaxed font-medium"></textarea>
                            </div>
                        </div>
                        
                         <div class="mt-6 flex items-center justify-between">
                             <div class="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-full">
                                <i data-lucide="info" class="w-4 h-4"></i> Tự động phát hiện Google Drive, Dropbox
                             </div>
                             <button onclick="simulateUploadStart()" class="px-8 py-3.5 bg-slate-900 hover:bg-black text-white font-medium rounded-xl shadow-xl shadow-slate-200/50 transition-all active:scale-95 flex items-center gap-2">
                                <i data-lucide="sparkles" class="w-5 h-5 text-yellow-300"></i>
                                Phân tích & Tải về
                            </button>
                        </div>
                    </div>
                </div>

                 <div id="bulk-actions" class="mt-10 hidden opacity-0 translate-y-4 transition-all duration-500">
                    <div class="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex items-center justify-between">
                        <div>
                            <h4 class="text-lg font-semibold text-slate-900">Thiết lập nhanh</h4>
                            <p class="text-slate-500 text-sm">Áp dụng cho 2 file đang chờ</p>
                        </div>
                        <div class="flex gap-3">
                            <select class="px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:border-accent outline-none transition">
                                <option>Chọn chuyên mục...</option>
                                <option>Học tập</option>
                                <option>Giải trí</option>
                            </select>
                            <select class="px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:border-accent outline-none transition">
                                <option>Công khai (Public)</option>
                                <option>Riêng tư (Private)</option>
                            </select>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <aside class="w-[420px] bg-slate-50 border-l border-slate-100/80 flex flex-col h-[calc(100vh-64px)] sticky top-16">
            
            <div class="p-6 border-b border-slate-100/80 flex items-center justify-between shrink-0">
                <div>
                    <h2 class="text-lg font-bold text-slate-900">Hàng chờ tải lên</h2>
                    <p class="text-sm text-slate-500 mt-1" id="queue-status">Chưa có tác vụ nào</p>
                </div>
                <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <i data-lucide="list-video" class="w-5 h-5"></i>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5 relative" id="queue-list">
                
                <div id="empty-queue" class="absolute inset-0 flex flex-col items-center justify-center p-8 text-center opacity-40">
                    <img src="https://cdn-icons-png.flaticon.com/512/7486/7486747.png" alt="Empty" class="w-32 h-32 mb-4 grayscale opacity-50 drop-shadow-xl">
                    <p class="text-slate-400 font-medium">Danh sách trống</p>
                </div>

                <div class="queue-item hidden bg-white rounded-2xl p-5 shadow-soft border border-slate-100/50 relative group overflow-hidden transition-all hover:shadow-md">
                    <div class="flex gap-4 relative z-10">
                        <div class="w-20 h-16 bg-slate-800 rounded-xl shrink-0 relative overflow-hidden shadow-sm">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                            <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&q=80" class="w-full h-full object-cover opacity-80" alt="">
                             <div class="absolute bottom-1 left-2 z-20">
                                <i data-lucide="play-circle" class="w-4 h-4 text-white/90"></i>
                             </div>
                        </div>
                        
                        <div class="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                            <div class="flex justify-between items-start gap-2">
                                <h4 class="text-sm font-bold text-slate-800 truncate">Introduction_to_React_v18.mp4</h4>
                                <button class="text-slate-300 hover:text-red-500 transition p-1 -mr-2 -mt-2 opacity-0 group-hover:opacity-100">
                                    <i data-lucide="x" class="w-4 h-4"></i>
                                </button>
                            </div>
                            
                            <div>
                                <div class="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
                                    <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span> Uploading...</span>
                                    <span class="text-accent font-bold">72%</span>
                                </div>
                                <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                                    <div class="absolute inset-0 bg-accent/20 animate-pulse w-full"></div>
                                    <div class="h-full bg-accent rounded-full w-[72%] relative z-10 shadow-[0_0_12px_rgba(99,102,241,0.6)] transition-all duration-500"></div>
                                </div>
                                <div class="flex justify-between mt-2 text-[11px] text-slate-400 font-medium">
                                    <span>345 MB of 520 MB</span>
                                    <span>4.2 MB/s</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                 <div class="queue-item hidden bg-[#F0F3FF] rounded-2xl p-5 shadow-soft border border-indigo-100/50 relative overflow-hidden group transition-all hover:shadow-md">
                    <div class="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#6366F1_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    
                    <div class="flex gap-4 relative z-10">
                        <div class="w-20 h-16 bg-indigo-100 rounded-xl shrink-0 flex items-center justify-center text-accent shadow-sm">
                            <i data-lucide="link-2" class="w-8 h-8 opacity-80"></i>
                        </div>
                        
                        <div class="flex-1 min-w-0 py-1 flex flex-col justify-center">
                             <div class="flex justify-between items-start gap-2">
                                <h4 class="text-sm font-bold text-slate-800 truncate">Advanced_NodeJS_Patterns.mkv</h4>
                                <button class="text-slate-400 hover:text-red-500 transition p-1 -mr-2 -mt-2 opacity-0 group-hover:opacity-100">
                                    <i data-lucide="x" class="w-4 h-4"></i>
                                </button>
                            </div>
                            
                            <div class="flex items-center gap-3 mt-3">
                                <div class="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-white py-1.5 px-3 rounded-lg shadow-sm">
                                    <i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i>
                                    Fetching from Google Drive...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div class="p-6 border-t border-slate-100/80 bg-white shrink-0">
                <div class="flex items-center justify-between text-sm mb-4 font-medium">
                    <span class="text-slate-500">Tổng dung lượng:</span>
                    <span class="text-slate-900">865 MB</span>
                </div>
                <button class="w-full py-4 bg-accent hover:bg-accentHover text-white text-sm font-bold rounded-2xl shadow-xl shadow-indigo-200 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed" id="btn-publish" disabled>
                    <i data-lucide="check-circle-2" class="w-5 h-5"></i>
                    Hoàn tất & Xuất bản (0)
                </button>
            </div>

        </aside>

    </main>
</template>