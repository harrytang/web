import { getByRole, queryByRole } from "@testing-library/dom";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Work } from "@/lib/works";
import Role from "./Role";

jest.mock("next/image", () => ({
	__esModule: true,
	default: (props: Record<string, unknown>) =>
		React.createElement(
			"picture",
			null,
			React.createElement(
				"img",
				props as unknown as React.ImgHTMLAttributes<HTMLImageElement>,
			),
		),
}));

jest.mock("next/link", () => ({
	__esModule: true,
	default: ({
		href,
		children,
		...props
	}: {
		href: string;
		children: React.ReactNode;
	}) => React.createElement("a", { href, ...props }, children),
}));

const mockRole: Work = {
	id: 1,
	attributes: {
		title: "Senior Developer",
		company: "Tech Corp",
		place: "San Francisco",
		start: "2020-01-01",
		end: "2023-12-31",
		url: {
			href: "https://example.com/company",
			label: "Tech Corp",
		},
		logo: {
			data: {
				id: 1,
				attributes: {
					url: "https://example.com/logo.png",
					caption: "Company Logo",
					width: 100,
					height: 100,
					name: "logo",
					mime: "image/png",
					size: 1000,
					previewUrl: null,
					alternativeText: "Logo",
					formats: {},
					hash: "abc123",
					ext: ".png",
					provider: "local",
					provider_metadata: null,
					createdAt: "2024-01-01",
					updatedAt: "2024-01-01",
				},
			},
		},
	},
};

describe("Role", () => {
	const mount = async (role: Work) => {
		const component = await Role({ role });
		const html = renderToStaticMarkup(component);
		document.body.innerHTML = html;
		return document.body;
	};

	it("renders role title", async () => {
		const body = await mount(mockRole);
		expect(body.textContent).toContain("Senior Developer");
	});

	it("renders company and location", async () => {
		const body = await mount(mockRole);
		expect(body.textContent).toContain("Tech Corp | San Francisco");
	});

	it("uses external anchor behavior for external urls", async () => {
		const body = await mount(mockRole);
		const link = getByRole(body, "link", { name: "Visit Tech Corp" });
		expect(link).toHaveAttribute("href", "https://example.com/company");
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", "noreferrer");
	});

	it("uses Next link behavior for internal urls", async () => {
		const roleWithInternalUrl: Work = {
			...mockRole,
			attributes: {
				...mockRole.attributes,
				url: {
					href: "/projects",
					label: "Tech Corp",
				},
			},
		};

		const body = await mount(roleWithInternalUrl);
		const link = getByRole(body, "link", { name: "Visit Tech Corp" });
		expect(link).toHaveAttribute("href", "/projects");
		expect(link).not.toHaveAttribute("target");
		expect(link).not.toHaveAttribute("rel");
	});

	it("falls back to company name when url label is empty", async () => {
		const roleWithEmptyLabel: Work = {
			...mockRole,
			attributes: {
				...mockRole.attributes,
				url: {
					href: "https://example.com/fallback",
					label: "",
				},
			},
		};

		const body = await mount(roleWithEmptyLabel);
		const link = getByRole(body, "link", { name: "Visit Tech Corp" });
		expect(link).toHaveAttribute("href", "https://example.com/fallback");
	});

	it("renders plain company text when work url is not provided", async () => {
		const roleWithoutUrl: Work = {
			...mockRole,
			attributes: {
				...mockRole.attributes,
				url: null,
			},
		};

		const body = await mount(roleWithoutUrl);
		expect(queryByRole(body, "link", { name: "Visit Tech Corp" })).toBeNull();
		expect(body.textContent).toContain("Tech Corp");
	});

	it("renders plain company text when work url is undefined", async () => {
		const roleWithoutUrlProperty: Work = {
			...mockRole,
			attributes: {
				...mockRole.attributes,
				url: undefined,
			},
		};

		const body = await mount(roleWithoutUrlProperty);
		expect(queryByRole(body, "link", { name: "Visit Tech Corp" })).toBeNull();
		expect(body.textContent).toContain("Tech Corp");
	});

	it("renders start and end dates", async () => {
		const body = await mount(mockRole);
		expect(body.textContent).toContain("2020-01-01");
		expect(body.textContent).toContain("2023-12-31");
	});

	it("renders company logo image", async () => {
		const body = await mount(mockRole);
		const img = body.querySelector('img[alt="Company Logo"]');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute("src", "https://example.com/logo.png");
	});

	it("renders Present when end date is not provided", async () => {
		const roleWithoutEnd: Work = {
			...mockRole,
			attributes: {
				...mockRole.attributes,
				end: null,
			},
		};

		const body = await mount(roleWithoutEnd);
		expect(body.textContent).toContain("Present");
	});

	it("renders as list item", async () => {
		const body = await mount(mockRole);
		expect(body.querySelector("li")).toBeInTheDocument();
	});

	it("renders semantic date range with time elements", async () => {
		const body = await mount(mockRole);
		const timeElements = body.querySelectorAll("time");
		expect(timeElements).toHaveLength(2);
		expect(timeElements[0]).toHaveAttribute("datetime", "2020-01-01");
		expect(timeElements[1]).toHaveAttribute("datetime", "2023-12-31");
	});

	it("has sr-only labels for accessibility", async () => {
		const body = await mount(mockRole);
		const srOnlyElements = body.querySelectorAll(".sr-only");
		expect(srOnlyElements.length).toBeGreaterThan(0);
	});
});
