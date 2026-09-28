import { llmsIndex } from '../../docs/llms.js';

export const prerender = true;

export function GET() {
	return new Response(llmsIndex(), {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
}
