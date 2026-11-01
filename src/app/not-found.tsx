import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { HeroBackdrop } from "@/components/HeroBackdrop";

const NotFound = () => {
	return (
		<div className="relative isolate w-full overflow-hidden">
			<HeroBackdrop />
			<Container className="pt-16 pb-24 sm:pt-32">
				<div className="flex flex-col items-center text-center">
					<p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
						404
					</p>
					<h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-balance text-ink sm:text-5xl">
						Page not found
					</h1>
					<p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
						Sorry, we couldn’t find the page you’re looking for.
					</p>
					<Button href="/" variant="primary" className="mt-6">
						Go back home
					</Button>
				</div>
			</Container>
		</div>
	);
};

export default NotFound;
