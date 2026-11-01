"use client";
import {
	Popover,
	PopoverBackdrop,
	PopoverButton,
	PopoverPanel,
	Transition,
	TransitionChild,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";
import type { Menu } from "@/lib/menus";
import MobileNavItem from "./MobileNavItem";

type MobileNavigationProps = {
	items: Menu[];
} & React.ComponentPropsWithoutRef<typeof Popover>;

const MobileNavigation: React.FC<MobileNavigationProps> = ({
	items,
	...props
}) => {
	return (
		<Popover {...props}>
			<PopoverButton className="group flex h-10 cursor-pointer items-center rounded-full bg-raised/70 px-4 text-sm font-medium text-ink ring-1 ring-line transition hover:ring-accent/40">
				Menu
				<Bars3Icon className="ml-2 h-auto w-4 text-muted transition group-hover:text-accent" />
			</PopoverButton>
			<Transition>
				<TransitionChild
					as={Fragment}
					enter="duration-150 ease-out"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="duration-150 ease-in"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<PopoverBackdrop className="fixed inset-0 z-50 bg-canvas/70 backdrop-blur-xs" />
				</TransitionChild>
				<TransitionChild
					as={Fragment}
					enter="duration-150 ease-out"
					enterFrom="opacity-0 scale-95"
					enterTo="opacity-100 scale-100"
					leave="duration-150 ease-in"
					leaveFrom="opacity-100 scale-100"
					leaveTo="opacity-0 scale-95"
				>
					<PopoverPanel
						focus
						className="fixed inset-x-4 top-8 z-50 origin-top rounded-3xl bg-raised p-8 shadow-2xl ring-1 ring-line"
					>
						<div className="flex flex-row-reverse items-center justify-between">
							<PopoverButton aria-label="Close menu" className="-m-1 p-1">
								<XMarkIcon className="h-6 w-6 text-muted" />
							</PopoverButton>
							<h2 className="text-sm font-medium text-muted">Navigation</h2>
						</div>
						<nav aria-label="Mobile" className="mt-6">
							<ul className="-my-2 divide-y divide-line text-base text-ink">
								{items.map((item) => (
									<MobileNavItem key={item.path} href={item.path}>
										{item.name}
									</MobileNavItem>
								))}
							</ul>
						</nav>
					</PopoverPanel>
				</TransitionChild>
			</Transition>
		</Popover>
	);
};

export default MobileNavigation;
