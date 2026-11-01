import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

// local imports

import { ArticleList } from "@/components/ArticleList";
import { Gallery } from "@/components/Gallery";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import Work from "@/components/Work/Work";
import { getBlogs } from "@/lib/blogs";
import { splitHeadline } from "@/lib/headline";
import { generateProfilePageJsonLd, generateSeoMeta } from "@/lib/helper";
import { getProfile } from "@/lib/profile";

export async function generateMetadata(): Promise<Metadata> {
	const profile = await getProfile();
	const seo = generateSeoMeta("", profile.data.seo, "profile", "en");
	return {
		...seo,
		title: `${process.env.NEXT_PUBLIC_SITE_NAME} - ${profile.data.title}`,
	};
}

const Home = async () => {
	const blogs = await getBlogs(
		0,
		parseInt(process.env.NEXT_PUBLIC_HOME_PAGE_SIZE ?? "6", 10),
	);
	const profile = await getProfile();

	// jsonlds
	const person = generateProfilePageJsonLd(profile.data, blogs.data);

	const [titleLead, titleAccent] = splitHeadline(profile.data.title);
	const [featured, ...others] = blogs.data;

	return (
		<>
			<div className="relative isolate overflow-hidden">
				<HeroBackdrop />
				<div className="mx-auto max-w-7xl px-6 pt-16 pb-24 sm:pt-24 lg:px-8 lg:pt-24 lg:pb-32">
					<div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
						<div className="relative w-full lg:max-w-md lg:shrink-0 xl:max-w-xl">
							<h1 className="text-5xl font-semibold tracking-[-0.045em] text-balance text-ink sm:text-6xl lg:text-5xl xl:text-[3.5rem]/[1.04]">
								{titleLead}
								{titleAccent && (
									<span className="bg-linear-to-r from-accent to-accent-2 bg-clip-text text-transparent">
										{titleAccent}
									</span>
								)}
							</h1>
							<p className="mt-8 max-w-prose text-lg/8 font-light text-pretty text-muted sm:text-xl/8">
								{profile.data.welcome}
							</p>
							<ul className="mt-10 flex items-center gap-3">
								{profile.data.socials.map((social) => (
									<li key={social.href}>
										<Link
											href={social.href}
											className="grid size-11 place-items-center rounded-xl bg-raised ring-1 ring-line transition hover:-translate-y-0.5 hover:ring-accent/40"
										>
											<Image
												src={social.icon.url}
												alt={social.icon.caption}
												className="size-5 object-contain"
												unoptimized
												width={social.icon.width}
												height={social.icon.height}
											/>
										</Link>
									</li>
								))}
							</ul>
						</div>
						<Gallery items={profile.data.photos} />
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="grid grid-cols-1 items-start gap-14 xl:grid-cols-12">
					<section
						aria-labelledby="articles-title"
						className="min-w-0 xl:col-span-7"
					>
						<div className="flex items-center gap-4">
							<h2
								id="articles-title"
								className="text-sm font-semibold tracking-[0.2em] text-accent uppercase"
							>
								Articles
							</h2>
							<div className="h-px flex-1 bg-line" />
						</div>
						{featured && (
							<div className="mt-10">
								<ArticleList article={featured} type="featured" />
							</div>
						)}
						{others.length > 0 && (
							<div className="mt-6 grid gap-6 sm:grid-cols-2">
								{others.map((blog) => (
									<ArticleList key={blog.id} article={blog} type="card" />
								))}
							</div>
						)}
					</section>
					<Work className="xl:col-span-5" />
				</div>
			</div>
			<script type="application/ld+json">{JSON.stringify(person)}</script>
		</>
	);
};

export default Home;
