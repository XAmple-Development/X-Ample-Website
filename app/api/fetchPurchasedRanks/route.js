import { NextResponse } from 'next/server';

export async function GET(request) {
    if (!process.env.SERVER_SECRET) {
        return NextResponse.json([]);
    }
    const userId = request.headers.get('user-id');
    const response = await fetch(`https://plugin.tebex.io/player/${userId}/packages`, {
        method: 'GET',
        headers: {
            'X-Tebex-Secret': process.env.SERVER_SECRET,
        },
    });

    if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch purchased ranks' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
}