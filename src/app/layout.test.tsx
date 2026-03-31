import React from "react";
import { getProfile } from "@/lib/profile";
import RootLayout, { metadata } from "./layout";

jest.mock("@/lib/profile", () => ({
	getProfile: jest.fn(),
}));

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

jest.mock("next/script", () => ({
	__esModule: true,
	default: (props: React.ComponentProps<"script">) => <script {...props} />,
}));

describe("app layout", () => {
	beforeEach(() => {
		(getProfile as jest.Mock).mockResolvedValue({
			data: {
				attributes: {
					title: "Builder",
					seo: { metaDescription: "Profile page description" },
				},
			},
		});
	});

	it("builds metadata from profile and site env", async () => {
		await expect(metadata()).resolves.toEqual({
			title: {
				template: `%s - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
				default: `${process.env.NEXT_PUBLIC_SITE_NAME} - Builder`,
			},
			description: "Profile page description",
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

	it("renders umami script when env vars are present", () => {
		type UmamiScriptProps = React.ComponentProps<"script"> & {
			"data-website-id"?: string;
		};

		const tree = RootLayout({
			children: <span>child-node</span>,
		}) as React.ReactElement;
		const [head] = React.Children.toArray(
			(tree.props as { children: React.ReactNode }).children,
		) as [React.ReactElement<{ children: React.ReactNode }>];
		const scripts = React.Children.toArray(
			head.props.children,
		) as React.ReactElement<UmamiScriptProps>[];

		expect(scripts).toHaveLength(1);
		expect(scripts[0].props.src).toBe(process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL);
		expect(scripts[0].props["data-website-id"]).toBe(
			process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
		);
	});
});
