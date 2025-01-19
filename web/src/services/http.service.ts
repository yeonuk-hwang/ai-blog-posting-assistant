export interface HttpService {
  fetch(endPoint: string, options: RequestInit): Promise<Response>;
}

export class HttpServiceImplementation implements HttpService {
  constructor(private readonly baseURL: string) {}

  async fetch(endPoint: string, options: RequestInit = {}) {
    const response = await window.fetch(this.baseURL + endPoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (response.ok) {
      return response;
    } else {
      throw response;
    }
  }
}
