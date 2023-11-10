import { ApiResponse, Quiz, QuizPostData } from './types';
import axios from 'axios';
import Contant from "../context/contant";

// Function to get the current user's JWT token
export const getToken = async () => {

    const unixTimestamp = localStorage.getItem("expiry");
    if (unixTimestamp) {
        //@ts-ignore
        const date = new Date(unixTimestamp * 1000);
    
        console.log(date.toLocaleString());
        if (date < new Date() ) {

            console.log("Expire and generating new one");
            const formData = new FormData();
            formData.append('action', 'generateToken');
            const config = {
                headers: {
                    'Authorization': localStorage.getItem("token"),
                }
            };
            const user = await axios.post(Contant.API, formData, config);
            let data = user.data;
            //@ts-ignore
            if (data.success == true) {
                localStorage.setItem("token", data?.token);
                localStorage.setItem("expiry", data?.expiry);
            }
            // console.log("old token", localStorage.getItem("token"));
            // console.log("new Token", data?.token);
            return data?.token;
        }
        else {
            return localStorage.getItem("token");
        }
    }
};

// Function to get the base API URL from environment variables
const getApiUrl = (): string => {
    return process.env.NEXT_PUBLIC_API_URL || '';
};

// Main function to fetch data from the API
export const fetchData = async <T>(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<T | string> => {
    console.log("starting api call...");
    try {
        const url = `${getApiUrl()}${endpoint}`; // Construct the full URL
        const token = await getToken(); // Get the user token
        console.log(token)
        const options: RequestInit = { // Configure the fetch options
            method: method,
            headers: {
                'Content-Type': 'application/' + ((method == "GET") ? 'json' : 'x-www-form-urlencoded'),
                // specify type based on GET or POST
                'Authorization': token ? `Bearer ${token}` : ''
            },
        };

        // Add the request body if data is provided
        if (data) {
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    // if (typeof data[key] == 'string' && typeof data[key] !== 'number') {
                    if (typeof data[key] === 'object') {
                        data[key] = JSON.stringify(data[key]);
                    }
                }
            }
            options.body = new URLSearchParams(data);
        }
        console.log(url)
        console.log(data)

        const response = await fetch(url, options);
        if (!response.ok) {
            console.error(response)
            return "error";
        }

        const result: ApiResponse<T> = await response.json();
        // Check if the API response contains the data property
        console.log(result)
        if ("data" in result) {
            return result.data;
        }
        else {
            return 'nodata';
        }
    } catch (error) {
        console.error(error)
        return "error";
    }
};

// Wrapper function to call fetchData with a simplified API
export const apiCall = async <T = any>(url: string, data?: any): Promise<T | string> => {
    const response = await fetchData<T>(url, (data) ? 'POST' : 'GET', data);
    return response;
};

// This calls the API via the Next.js API route (see src/app/quiz/api/route.ts). Advantage of this one is that it has caching enabled. No need for POST as don't want to cache POST requests.
export const apiServerCall = async <T = any>(url: string, data: any): Promise<T | string> => {
    const response = await fetchServerData<T>(url, data);
    return response;
};


// Main function to fetch data from the API
export const fetchServerData = async <T>(endpoint: string, data: any): Promise<T> => {
    console.log("starting server api call...");
    const url = `${getApiUrl()}${endpoint}`; // Construct the full URL

    const options: RequestInit = { // Configure the fetch options
        method: data?.method,
        next: { revalidate: 100 },
        headers: {
            'Content-Type': 'application/json',
            'Authorization': data?.token ? `Bearer ${data?.token}` : ''
        },
    };

    // Add the request body if data is provided
    if (data?.data) {
        options.body = JSON.stringify(data?.data);
    }

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            console.error(response)
            return Promise.reject(JSON.stringify({
                status: "error",
                data: "Response error",
                code: 400,
            }))
        }

        const result: ApiResponse<T> = await response.json();
        if ("data" in result) {
            return result.data;
        } else {
            console.error(result)
            return Promise.reject(JSON.stringify({
                status: "error",
                data: "Result error",
                code: 400,
            }))
        }

    } catch (error) {
        console.error(error)
        return Promise.reject(JSON.stringify({
            status: "failed",
            data: "Exception error",
            code: 400,
        }))
    }
};

// Function to post quiz data by ID
export const postQuizById = async (id: number, data: QuizPostData): Promise<Quiz | string> => {
    const quiz = await fetchData<Quiz>(`/quizzes/${id}`, 'POST', data);
    return quiz;
}

// Specific endpoints for fetching and posting quizzes
// These are commented out, potentially for future use
/* export const getQuizzes = async (): Promise<Quiz[] | string> => {
    const quizzes = await fetchData<Quiz[]>('/quizzes');
    return quizzes;
};

export const getQuizById = async (id: number): Promise<Quiz | string> => {
    const quiz = await fetchData<Quiz>(`/quizzes/${id}`, 'GET', undefined);
    return quiz;
};

export const postQuiz = async (data: QuizPostData): Promise<Quiz | string> => {
    const quiz = await fetchData<Quiz>('/quizzes', 'POST', data);
    return quiz;
};

export const postQuizById = async (id: number, data: QuizPostData): Promise<Quiz | string> => {
    const quiz = await fetchData<Quiz>(`/quizzes/${id}`, 'POST', data);
    return quiz;
} */