import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { bookmarkId } = await req.json();

    if (!bookmarkId) {
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 });
    }

    // Call your backend API to trigger the summarization
    const authHeader = req.headers.get('Authorization');
    console.log("Next.js API Route: Authorization header received from frontend:", authHeader ? "Exists" : "Does not exist");
    console.log("Next.js API Route: Forwarding Authorization header to backend:", authHeader ? "Exists" : "Does not exist");

    const backendResponse = await fetch(`http://localhost:8080/api/agent/summarize/${bookmarkId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json({ error: errorData.error || 'Failed to summarize bookmark' }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error summarizing bookmark:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
