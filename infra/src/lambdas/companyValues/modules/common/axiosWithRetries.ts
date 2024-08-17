import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function axiosWithRetries(url: string, config: AxiosRequestConfig = {}, retries: number = 5): Promise<AxiosResponse> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios(url, config);
            return response;
        } catch (error) {
            if (attempt === retries) {
                throw error; 
            }
            console.log(`Attempt ${attempt} failed. Retrying...`);

            await delay(3000);
        }
    }

    throw new Error('Unexpected error: Retries exceeded without throwing.');
}