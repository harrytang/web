import type { Media } from "@/types/media";
import { fetchAPI } from "./strapi";

export interface Work {
	id: number;
	attributes: {
		company: string;
		title: string;
		logo: {
			data: Media;
		};
		place: string;
		start: string;
		end: string | null;
	};
}

export async function getWorks() {
	const res = fetchAPI<Work[]>("/works", {
		populate: ["logo"],
		sort: "start:DESC",
	});
	return res;
}
