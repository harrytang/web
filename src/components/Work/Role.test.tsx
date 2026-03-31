import { render, screen } from "@testing-library/react";
import React from "react";
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

const mockRole: Work = {
	id: 1,
	attributes: {
		title: "Senior Developer",
		company: "Tech Corp",
		place: "San Francisco",
		start: "2020-01-01",
		end: "2023-12-31",
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
	it("renders role title", async () => {
		const component = await Role({ role: mockRole });
		render(component);

		expect(screen.getByText("Senior Developer")).toBeInTheDocument();
	});

	it("renders company and location", async () => {
		const component = await Role({ role: mockRole });
		render(component);

		expect(screen.getByText("Tech Corp | San Francisco")).toBeInTheDocument();
	});

	it("renders start and end dates", async () => {
		const component = await Role({ role: mockRole });
		render(component);

		expect(screen.getByText("2020-01-01")).toBeInTheDocument();
		expect(screen.getByText("2023-12-31")).toBeInTheDocument();
	});

	it("renders company logo image", async () => {
		const component = await Role({ role: mockRole });
		render(component);

		const img = screen.getByAltText("Company Logo");
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

		const component = await Role({ role: roleWithoutEnd });
		render(component);

		expect(screen.getByText("Present")).toBeInTheDocument();
	});

	it("renders as list item", async () => {
		const component = await Role({ role: mockRole });
		const { container } = render(component);

		expect(container.querySelector("li")).toBeInTheDocument();
	});

	it("has accessible aria-label for date range", async () => {
		const component = await Role({ role: mockRole });
		render(component);

		expect(
			screen.getByLabelText("2020-01-01 until 2023-12-31"),
		).toBeInTheDocument();
	});

	it("has sr-only labels for accessibility", async () => {
		const component = await Role({ role: mockRole });
		const { container } = render(component);

		const srOnlyElements = container.querySelectorAll(".sr-only");
		expect(srOnlyElements.length).toBeGreaterThan(0);
	});
});
