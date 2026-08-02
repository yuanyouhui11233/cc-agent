export interface ApiResponse<T = any> {
  code: number; // 0 成功 非 0 业务错误
  message: string;
  data: T;
  timestamp: number;
}
