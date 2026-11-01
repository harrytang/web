import type { Metadata } from "next";
import Image from "next/image";

// local imports
import { Biography } from "@/components/Biography";
import { Container } from "@/components/Container";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { SocialLink } from "@/components/SocialLink";
import { splitHeadline } from "@/lib/headline";
import { generateProfilePageJsonLd, generateSeoMeta } from "@/lib/helper";
import { getProfile } from "@/lib/profile";
import { BLUR_IMAGE } from "../../../const";

export async function generateMetadata(): Promise<Metadata> {
	const profile = await getProfile();
	return generateSeoMeta("about", profile.data.seo, "profile", "en");
}

const About: React.FC = async () => {
	console.info("Rendering /about");
	const profile = await getProfile();
	const jsonld = generateProfilePageJsonLd(profile.data);
	const [aboutLead, aboutAccent] = splitHeadline(profile.data.about);
	return (
		<div className="relative isolate overflow-hidden">
			<HeroBackdrop />
			<Container className="pt-16 pb-8 sm:pt-24">
				<div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
					<div className="lg:pl-20">
						<div className="relative max-w-xs px-2.5 lg:max-w-none">
							<div
								aria-hidden="true"
								className="absolute inset-x-2.5 inset-y-0 -rotate-3 rounded-3xl ring-1 ring-accent/40"
							/>
							<Image
								src={profile.data.portraitPhoto.url}
								alt={profile.data.portraitPhoto.caption}
								width={profile.data.portraitPhoto.width}
								height={profile.data.portraitPhoto.height}
								sizes="(min-width: 1024px) 32rem, 20rem"
								className="relative aspect-square rotate-3 rounded-3xl bg-surface object-cover shadow-2xl shadow-black/20 ring-1 ring-ink/10"
								priority={true}
								placeholder="blur"
								blurDataURL={BLUR_IMAGE}
							/>
						</div>
					</div>
					<div className="lg:order-first lg:row-span-2">
						<h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance text-ink sm:text-5xl">
							{aboutLead}
							{aboutAccent && (
								<span className="bg-linear-to-r from-accent to-accent-2 bg-clip-text text-transparent">
									{aboutAccent}
								</span>
							)}
						</h1>
						<Biography content={profile.data.biography} className="mt-8" />
					</div>
					<div className="lg:pl-20">
						<ul className="space-y-3">
							{profile.data.socials.map((social) => (
								<SocialLink
									key={social.href}
									href={social.href}
									icon={social.icon}
								>
									{social.title}
								</SocialLink>
							))}
						</ul>
					</div>
				</div>
				<script type="application/ld+json">{JSON.stringify(jsonld)}</script>
			</Container>
		</div>
	);
};

export default About;
