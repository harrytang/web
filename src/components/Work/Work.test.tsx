import { render, screen } from "@testing-library/react";
import type { Work as WorkType } from "@/lib/works";
import Work from "./Work";

jest.mock("@/lib/works", () => ({
	getWorks: jest.fn(() =>
		Promise.resolve({
			data: [
				{
					id: 1,
					attributes: {
						title: "Senior Developer",
						company: "Tech Corp",
						place: "San Francisco",
						start: "2020-01-01",
						end: "2023-12-31",
						logo: {
							data: {
								attributes: {
									url: "https://example.com/logo1.png",
									caption: "Tech Corp Logo",
									width: 100,
									height: 100,
								},
							},
						},
					},
				},
				{
					id: 2,
					attributes: {
						title: "Developer",
						company: "Start Up Inc",
						place: "New York",
						start: "2018-06-01",
						end: "2019-12-31",
						logo: {
							data: {
								attributes: {
									url: "https://example.com/logo2.png",
									caption: "Start Up Logo",
									width: 100,
									height: 100,
								},
							},
						},
					},
				},
			],
		}),
	),
}));

jest.mock("@heroicons/react/20/solid", () => ({
	BriefcaseIcon: () => <div data-testid="briefcase-icon" />,
}));

jest.mock("./Role", () => {
	return function MockRole({ role }: { role: WorkType }) {
		return <li data-testid={`role-${role.id}`}>{role.attributes.title}</li>;
	};
});

describe("Work", () => {
	it("renders Work heading", async () => {
		const component = await Work();
		render(component);

		expect(screen.getByText("Work")).toBeInTheDocument();
	});

	it("renders briefcase icon", async () => {
		const component = await Work();
		render(component);

		expect(screen.getByTestId("briefcase-icon")).toBeInTheDocument();
	});

	it("renders list of roles", async () => {
		const component = await Work();
		render(component);

		expect(screen.getByText("Senior Developer")).toBeInTheDocument();
		expect(screen.getByText("Developer")).toBeInTheDocument();
	});

	it("renders ordered list", async () => {
		const component = await Work();
		const { container } = render(component);

		expect(container.querySelector("ol")).toBeInTheDocument();
	});

	it("renders correct number of roles", async () => {
		const component = await Work();
		render(component);

		expect(screen.getByTestId("role-1")).toBeInTheDocument();
		expect(screen.getByTestId("role-2")).toBeInTheDocument();
	});

	it("applies spacing style to list", async () => {
		const component = await Work();
		const { container } = render(component);

		const ol = container.querySelector("ol");
		expect(ol).toHaveClass("space-y-4");
	});

	it("renders within a card container", async () => {
		const component = await Work();
		const { container } = render(component);

		const cardDiv = container.querySelector(".rounded-2xl");
		expect(cardDiv).toBeInTheDocument();
	});
});
