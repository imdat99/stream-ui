interface TextTransformStreamOptions {
  encoding?: string;
  handleSplitChunks?: boolean;
  bufferSize?: number;
  onError?: (error: Error) => void;
}

/**
 * Class Transformer để xử lý text transform
 */
class TextTransformer implements Transformer<Uint8Array, Uint8Array> {
  private buffer: string = '';
  private decoder: TextDecoder;
  private encoder: TextEncoder;
  
  constructor(
    private transformFn: (text: string) => string,
    private options: Required<Omit<TextTransformStreamOptions, 'onError'>> & {
      onError?: (error: Error) => void;
    }
  ) {
    this.decoder = new TextDecoder(this.options.encoding);
    this.encoder = new TextEncoder();
  }
  
  transform(
    chunk: Uint8Array, 
    controller: TransformStreamDefaultController<Uint8Array>
  ): void {
    try {
      const chunkText = this.decoder.decode(chunk, { stream: true });
      const fullText = this.buffer + chunkText;
      this.buffer = '';
      
      let processedText: string;
      try {
        processedText = this.transformFn(fullText);
      } catch (transformError) {
        this.handleError(transformError);
        processedText = fullText;
      }
      
      if (this.options.handleSplitChunks) {
        this.handleSplitChunks(processedText, controller);
      } else {
        controller.enqueue(this.encoder.encode(processedText));
      }
    } catch (error) {
      this.handleError(error);
      controller.enqueue(chunk);
    }
  }
  
  flush(controller: TransformStreamDefaultController<Uint8Array>): void {
    try {
      if (this.buffer) {
        const finalText = this.decoder.decode();
        const remainingText = this.buffer + finalText;
        
        if (remainingText) {
          let processedText: string;
          try {
            processedText = this.transformFn(remainingText);
          } catch (transformError) {
            this.handleError(transformError);
            processedText = remainingText;
          }
          controller.enqueue(this.encoder.encode(processedText));
        }
      }
    } catch (error) {
      this.handleError(error);
    }
  }
  
  private handleSplitChunks(
    text: string, 
    controller: TransformStreamDefaultController<Uint8Array>
  ): void {
    const lastNewline = text.lastIndexOf('\n');
    const lastSpace = text.lastIndexOf(' ');
    const lastBreak = Math.max(lastNewline, lastSpace);
    
    if (lastBreak > text.length - this.options.bufferSize && lastBreak > 0) {
      const safePart = text.slice(0, lastBreak + 1);
      this.buffer = text.slice(lastBreak + 1);
      controller.enqueue(this.encoder.encode(safePart));
    } else {
      controller.enqueue(this.encoder.encode(text));
    }
  }
  
  private handleError(error: unknown): void {
    if (this.options.onError) {
      this.options.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}

/**
 * Cách 2: Sử dụng class Transformer
 */
export function createTextTransformStreamClass(
  inputStream: ReadableStream<Uint8Array>,
  transformFn: (text: string) => string,
  options: TextTransformStreamOptions = {}
): ReadableStream<Uint8Array> {
  const {
    encoding = 'utf-8',
    handleSplitChunks = true,
    bufferSize = 1024,
    onError
  } = options;
  
  const transformer = new TextTransformer(transformFn, {
    encoding,
    handleSplitChunks,
    bufferSize,
    onError
  });
  
  return inputStream.pipeThrough(new TransformStream(transformer));
}