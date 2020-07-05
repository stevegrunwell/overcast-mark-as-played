(function () {
	'use strict';

	/**
	 * Handle a click event from the "Mark as Played" button.
	 *
	 * @param {Event} ev - The click event.
	 */
	function handleButtonClicks(ev) {
		ev.preventDefault();

		const link = findParentWithTag('A', ev.target);

		if (null === link) {
			window.console.error('Unable to find link for podcast', el);
		}

		getEpisodeId(link.href)
			.then(markEpisodeAsPlayed)
			.then(function () {
				const parent = ev.target.parentElement;

				ev.target.remove();
				parent.innerText = parent.innerText.replace(/\s*•.+$/, '') + ' • Played';
				link.classList.add('userdeletedepisode');
				link.classList.remove('usernewepisode');
			})
			.catch(err => {
				window.console.error('Unable to mark episode as played:', err);
			});
	}

	/**
	 * Find a parent element with the given tag name.
	 *
	 * @param {string} tag - The HTML element name we're looking for.
	 * @param {Element} el - The element to work up from.
	 */
	function findParentWithTag(tag, el) {
		tag = tag.toUpperCase();

		while (el.parentNode) {
			el = el.parentNode;

			if (el.tagName === tag) {
				return el;
			}
		}
		return null;
	}

	/**
	 * Given an episode URL, retrieve the episode ID.
	 *
	 * @param {string} href The episode URL.
	 *
	 * @return {Promise}
	 */
	function getEpisodeId(href) {
		return fetch(href)
			.then(resp => resp.text())
			.then(data => {
				const episodeId = data.match(/data-item-id="(\d+)"/);

				return episodeId[1];
			})
			.catch(err => {
				window.console.error(`Unable to get episode ID for URL ${href}:`, err);
			});
	}

	/**
	 * Send a request to the [private] Overcast API to mark an episode as played.
	 *
	 * @param {int} episodeId - The podcast episode ID.
	 *
	 * @return {Promise}
	 */
	function markEpisodeAsPlayed(episodeId) {
		return fetch(`https://overcast.fm/podcasts/set_progress/${episodeId}`, {
			method: 'POST',
			credentials: 'same-origin',
			body: 'p=2147483647&speed=0&v=0',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			}
		})
			.catch(err => {
				window.console.error(`Unable to mark episode ${episodeID} as played:`, err);
			});
	}

	const playedRegex = /played$/i;
	const markAsPlayedBtn = document.createElement('button');
	markAsPlayedBtn.innerText = 'Mark as Played';
	markAsPlayedBtn.classList.add('overcast-mark-as-played-btn');

	// Inject "Mark as Played" buttons into episode listings.
	document.querySelectorAll('.titlestack .title + .caption2').forEach(el => {
		if (playedRegex.test(el.innerText)) {
			return;
		}

		const btn = markAsPlayedBtn.cloneNode(true);
		btn.onclick = handleButtonClicks;

		el.appendChild(btn);
	});
}());
