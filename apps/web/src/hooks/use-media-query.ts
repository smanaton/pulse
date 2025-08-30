import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);
		if (media.matches !== matches) {
			setMatches(media.matches);
		}

		const listener = () => setMatches(media.matches);

		// Add listener
		if (media.addEventListener) {
			media.addEventListener("change", listener);
		} else {
			// Fallback for older browsers
			media.addListener(listener);
		}

		return () => {
			if (media.removeEventListener) {
				media.removeEventListener("change", listener);
			} else {
				// Fallback for older browsers
				media.removeListener(listener);
			}
		};
	}, [matches, query]);

	return matches;
}
