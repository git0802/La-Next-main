// GET Function
// import { apiServerCall } from "../../../utils/apiClient"
import { apiServerCall } from '@/utils/apiClient';
import { NextResponse } from 'next/server'

interface RequestData {
    id: string;
    token: string;
}

export async function GetChild({ id, token }: RequestData) {
    let res = {};
    try {
        // Add this line to check for null
        if(id !== null && token !== null) {
            res = await apiServerCall(id, {
                token: token,
                method: "GET"
            });
            console.log("res", res)
            return NextResponse.json(res)
        }
        else {
            throw new Error('Either id or token is null.');
        }
    }
    catch (ex) {
        console.log("ex", ex)
        return NextResponse.json(ex)
    }
}