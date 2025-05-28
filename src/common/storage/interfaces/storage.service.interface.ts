export abstract class IStorageService {
  abstract uploadFile(buffer: Buffer, key: string, mimeType: string): Promise<string>;
  abstract getFile(key: string): Promise<Buffer>;
  abstract deleteFile(key: string): Promise<void>;
  abstract updateFile(buffer: Buffer, key: string, mimeType: string): Promise<string>;
}
