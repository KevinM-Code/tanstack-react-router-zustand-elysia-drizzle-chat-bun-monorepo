import { treaty } from '@elysiajs/eden';
import type { ElysiaAPI } from "server";

// ignore type error
export const eden = (url: string) => treaty<ElysiaAPI>('http://localhost:3080', {
    fetch: {
        credentials: 'include'
    }
});
