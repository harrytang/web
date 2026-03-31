import { render, screen } from "@testing-library/react";
import BMC from "./BMC";

jest.mock("@heroicons/react/20/solid", () => ({
	InformationCircleIcon: () => <div data-testid="info-icon" />,
}));

jest.mock("next/link", () => {
	return function MockLink({
		children,
		href,
		...props
	}: {
		children: React.ReactNode;
		href: string;
		[key: string]: unknown;
	}) {
		return (
			<a href={href} {...props}>
				{children}
			</a>
		);
	};
});

const mockBmcUrl = "https://buymeacoffee.com/test";

describe("BMC", () => {
	beforeEach(() => {
		process.env.NEXT_PUBLIC_BMC_URL = mockBmcUrl;
	});

	afterEach(() => {
		process.env.NEXT_PUBLIC_BMC_URL = mockBmcUrl;
	});

	it("renders Buy Me a Coffee info box with icon and link", () => {
		render(<BMC />);

		expect(screen.getByTestId("info-icon")).toBeInTheDocument();
		expect(
			screen.getByText(/If you found this useful, you can/),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /buy me a coffee/ }),
		).toHaveAttribute("href", mockBmcUrl);
	});

	it("renders link with correct attributes for accessibility", () => {
		render(<BMC />);

		const link = screen.getByRole("link", { name: /buy me a coffee/ });
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", "noopener noreferrer");
	});

	it("contains appropriate styling classes", () => {
		const { container } = render(<BMC />);

		const mainDiv = container.querySelector(".rounded-md");
		expect(mainDiv).toHaveClass("bg-blue-50", "dark:bg-blue-500/10");
	});

	it("falls back to default BMC URL when env is missing", () => {
		delete process.env.NEXT_PUBLIC_BMC_URL;
		render(<BMC />);

		expect(
			screen.getByRole("link", { name: /buy me a coffee/i }),
		).toHaveAttribute("href", "https://buymeacoffee.com");
	});
});
