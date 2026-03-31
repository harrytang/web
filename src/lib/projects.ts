import type { Media } from "@/types/media";
import { fetchAPI } from "./strapi";

export interface Project {
	id: number;
	attributes: {
		name: string;
		description: string;
		createdAt: string;
		updatedAt: string;
		publishedAt: string;
		icon: {
			data: Media;
		};
		link: {
			href: string;
			label: string;
		};
	};
}

export async function getProjects() {
	return fetchAPI<Project[]>("/projects", {
		populate: ["icon", "link"],
		sort: "publishedAt:desc",
	});
}
