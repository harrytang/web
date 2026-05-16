import React from "react";
import RootLayout, { metadata } from "./layout";

jest.mock("@/app/providers", () => ({
	Providers: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="providers">{children}</div>
	),
}));

jest.mock("@/components/Layout", () => ({
	Layout: ({ children }: { children: React.ReactNode }) => (
		<main data-testid="layout">{children}</main>
	),
}));

describe("app layout", () => {
	it("builds metadata from site env", () => {
		expect(metadata).toEqual({
			title: {
				template: `%s - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
				default: `${process.env.NEXT_PUBLIC_SITE_NAME}`,
			},
		});
	});

	it("renders base html structure with children", () => {
		const tree = RootLayout({
			children: <span>child-node</span>,
		}) as React.ReactElement;
		expect(tree.type).toBe("html");
		expect((tree.props as { lang: string }).lang).toBe("en");

		const [head, body] = React.Children.toArray(
			(tree.props as { children: React.ReactNode }).children,
		) as [
			React.ReactElement,
			React.ReactElement<{ children: React.ReactNode }>,
		];
		expect(head.type).toBe("head");
		expect(body.type).toBe("body");

		const providersElement = React.Children.only(
			body.props.children,
		) as React.ReactElement<{ children: React.ReactNode }>;
		expect(providersElement.type).toBeDefined();

		const wrapperDiv = React.Children.only(
			providersElement.props.children,
		) as React.ReactElement<{ children: React.ReactNode }>;
		const layoutElement = React.Children.only(
			wrapperDiv.props.children,
		) as React.ReactElement<{ children: React.ReactNode }>;
		const content = React.Children.only(
			layoutElement.props.children,
		) as React.ReactElement<{ children: React.ReactNode }>;
		expect(content.props.children).toBe("child-node");
	});

	it("renders an empty head element", () => {
		const tree = RootLayout({
			children: <span>child-node</span>,
		}) as React.ReactElement;
		const [head] = React.Children.toArray(
			(tree.props as { children: React.ReactNode }).children,
		) as [React.ReactElement<{ children: React.ReactNode }>];
		expect(head.props.children).toBeUndefined();
	});
});
