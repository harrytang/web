/**
 * Split a "Role & Role" headline into the lead and the part to emphasise.
 * Joining the two parts always gives back the original text. A title without
 * an ampersand followed by more text is returned whole, with an empty second part.
 */
export const splitHeadline = (title: string): [string, string] => {
	const match = /^(.*&\s+)(.+)$/.exec(title);
	return match ? [match[1], match[2]] : [title, ""];
};
