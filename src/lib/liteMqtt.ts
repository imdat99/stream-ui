import { ITinyMqttClient } from "./interface";

export type MessageCallback = (topic: string, payload: string) => void;
export class TinyMqttClient implements ITinyMqttClient {
    private ws: WebSocket | null = null;
    private encoder = new TextEncoder();
    private decoder = new TextDecoder();
    private worker: Worker | null = null;

    constructor(
        private url: string,
        private topics: string[],
        private onMessage: MessageCallback
    ) {}

    public connect(): void {
        this.ws = new WebSocket(this.url, 'mqtt');
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
            this.sendConnect();
        };

        this.ws.onmessage = (e) => this.handlePacket(new Uint8Array(e.data));
        this.ws.onclose = () => this.stopHeartbeatWorker();
    }
    public disconnect(): void {
        this.ws?.close();
        this.stopHeartbeatWorker();
    }
    private sendConnect(): void {
        const clientId = `ws_worker_${Math.random().toString(16).slice(2, 8)}`;
        const idBytes = this.encoder.encode(clientId);
        // Keep-alive 60s
        const packet = new Uint8Array([
            0x10, 12 + idBytes.length,
            0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, 0x04, 0x02, 0x00, 0x3c,
            0x00, idBytes.length, ...idBytes
        ]);
        this.ws?.send(packet);
    }

    private startHeartbeatWorker(): void {
        if (this.worker) return;

        // Tạo nội dung Worker dưới dạng chuỗi
        const workerCode = `
            let timer = null;
            self.onmessage = (e) => {
                if (e.data === 'START') {
                    timer = setInterval(() => self.postMessage('TICK'), 30000);
                } else if (e.data === 'STOP') {
                    clearInterval(timer);
                }
            };
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));

        this.worker.onmessage = (e) => {
            if (e.data === 'TICK' && this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(new Uint8Array([0xC0, 0x00])); // Gửi PINGREQ
            }
        };

        this.worker.postMessage('START');
    }

    private stopHeartbeatWorker(): void {
        if (this.worker) {
            this.worker.postMessage('STOP');
            this.worker.terminate();
            this.worker = null;
            console.log('🛑 Worker stopped');
        }
    }

    private handlePacket(data: Uint8Array): void {
        const type = data[0] & 0xF0;
        switch (type) {
            case 0x20: // CONNACK
                this.startHeartbeatWorker();
                this.subscribe();
                break;
            case 0xD0: // PINGRESP
                break;
            case 0x30: // PUBLISH QoS 0
            case 0x32: // PUBLISH QoS 1
            case 0x34: // PUBLISH QoS 2
                this.parsePublish(data);
                break;
        }
    }

    private subscribe(): void {
        let payload: number[] = [];
        this.topics.forEach(t => {
            const b = this.encoder.encode(t);
            payload.push(0x00, b.length, ...Array.from(b), 0x00);
        });
        const packet = new Uint8Array([0x82, 2 + payload.length, 0x00, 0x01, ...payload]);
        this.ws?.send(packet);
    }

    private parsePublish(data: Uint8Array): void {
        let multiplier = 1;
        let remainingLength = 0;
        let offset = 1;
        let encodedByte = 0;

        do {
            encodedByte = data[offset++];
            remainingLength += (encodedByte & 127) * multiplier;
            multiplier *= 128;
        } while ((encodedByte & 128) !== 0 && offset < data.length);

        const variableHeaderStart = offset;
        const topicLength = (data[offset] << 8) | data[offset + 1];
        offset += 2;

        const topic = this.decoder.decode(data.slice(offset, offset + topicLength));
        offset += topicLength;

        const qos = (data[0] >> 1) & 0x03;
        if (qos > 0) {
            offset += 2; // packet identifier
        }

        const consumedFromVariableHeader = offset - variableHeaderStart;
        const payloadLength = Math.max(0, remainingLength - consumedFromVariableHeader);
        const payload = this.decoder.decode(data.slice(offset, offset + payloadLength));
        this.onMessage(topic, payload);
    }
}

// --- Cách dùng ---
// const client = new TinyMqttClient(
//     'ws://your-emqx:8083', 
//     ['sensor/temp', 'sensor/humi', 'system/ping'], 
//     (topic, msg) => {
//         console.log(`[${topic}]: ${msg}`);
//     }
// );
// client.connect();