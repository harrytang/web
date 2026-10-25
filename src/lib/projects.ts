import type { Media } from "@/types/media";
import { fetchAPI } from "./strapi";

export interface Project {
	id: number;
	documentId: string;
	name: string;
	description: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	icon: Media;
	link: {
		href: string;
		label: string;
	};
}

export async function getProjects() {
	return fetchAPI<Project[]>("/projects", {
		populate: ["icon", "link"],
		sort: "publishedAt:desc",
	});
}
