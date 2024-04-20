import { json } from '@sveltejs/kit';
import { comments } from '$lib/comments.js';

export function GET() {
	return json(comments);
}

export async function POST(RequestEvent) {
	const { request } = RequestEvent;
	const { text } = await request.json();
	const newComment = {
		id: comments.length + 1,
		text
	};
	comments.push(newComment);
	return json(comments, { status: 201 });
}
