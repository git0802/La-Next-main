// import { apiServerCall } from "../../../utils/apiClient"
import { apiServerCall } from '@/utils/apiClient';
import { NextResponse } from 'next/server'


export async function GET(request: Request) {

    //@ts-ignore
    const id = request.nextUrl.searchParams.get('id');
    //@ts-ignore
    const token = request.nextUrl.searchParams.get('token');
    console.log(token)
    let res = {};
    try {
        res = await apiServerCall(id, {
            token: token,
            method: "GET"
        });
        console.log("res", res)
        return NextResponse.json(res)
    }
    catch (ex) {
        console.log("ex", ex)
        return NextResponse.json(ex)
    }


}