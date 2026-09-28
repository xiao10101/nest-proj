export interface RequestContextStore {
  requestId: string;
  userId?: string; // 阶段 4 才会赋值，先占位
}
