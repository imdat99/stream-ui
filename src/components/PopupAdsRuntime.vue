<script setup lang="ts">
import { client as rpcClient } from '@/api/rpcclient';
import ClientOnly from '@/components/ClientOnly';
import { onMounted, onBeforeUnmount } from 'vue';

let activeItem: any | null = null;
let clickHandler: ((event: MouseEvent) => void) | null = null;
let scriptNode: HTMLScriptElement | null = null;
let triggerCount = 0;

const triggerKey = (id: string) => `popup_ad_triggers:${id}`;

const cleanupScript = () => {
  if (scriptNode?.parentNode) {
    scriptNode.parentNode.removeChild(scriptNode);
  }
  scriptNode = null;
};

const attachUrlHandler = () => {
  if (!activeItem?.id || typeof window === 'undefined') return;
  const maxTriggers = Number(activeItem.maxTriggersPerSession || 1);
  triggerCount = Number(sessionStorage.getItem(triggerKey(activeItem.id)) || '0');

  clickHandler = () => {
    if (!activeItem?.value || triggerCount >= maxTriggers) return;
    triggerCount += 1;
    sessionStorage.setItem(triggerKey(activeItem.id), String(triggerCount));
    window.open(activeItem.value, '_blank', 'noopener,noreferrer');
  };

  window.addEventListener('click', clickHandler, { capture: true });
};

const attachScript = () => {
  if (!activeItem?.value || typeof document === 'undefined') return;
  cleanupScript();
  scriptNode = document.createElement('script');
  scriptNode.async = true;
  scriptNode.text = activeItem.value;
  document.body.appendChild(scriptNode);
};

onMounted(async () => {
  try {
    const response = await rpcClient.getActivePopupAd();
    activeItem = response.item || null;
    if (!activeItem?.isActive) return;

    if (activeItem.type === 'script') {
      attachScript();
      return;
    }

    if (activeItem.type === 'url') {
      attachUrlHandler();
    }
  } catch (error) {
    console.error(error);
  }
});

onBeforeUnmount(() => {
  if (clickHandler && typeof window !== 'undefined') {
    window.removeEventListener('click', clickHandler, { capture: true } as EventListenerOptions);
  }
  cleanupScript();
});
</script>

<template>
  <ClientOnly>
    <span class="hidden" />
  </ClientOnly>
</template>
