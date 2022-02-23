/**
 * Removes all messages sent by a given user from the overlay.
 * Called when a user is banned.
 *
 * @param {string} username - account whose messages to remove from the overlay
 */
export function removeAllMessagesFromUser(username) {
	const undeletedMessagesSelector = `[data-twitch-sender="${username}" i]:not([data-twitch-message-status="deleting])`;
	const messagesFromUser = document.querySelectorAll(undeletedMessagesSelector);
	const messageIds = messagesFromUser.map((message) =>
		message.getAttribute('data-twitch-message')
	);
	messageIds.forEach(removeMessage);
}

/**
 * Removes a specified message from the overlay.
 *
 * @param {Element} messageToDelete - list item containing a message to be removed from the overlay
 */
function _removeMessageFromDomAndShiftOthers(messageToDelete) {
	// If this message was the first in a cluster sent by one person, mark the next message in the group as the first
	const wasFirstInGroup = messageToDelete.getAttribute(
		'data-twitch-first-message-in-group'
	);
	const group = messageToDelete.getAttribute('data-twitch-message-group');
	const hasNextInGroup =
		messageToDelete.nextSibling &&
		messageToDelete.nextSibling.getAttribute('data-twitch-message-group') ===
			group;
	if (wasFirstInGroup && hasNextInGroup) {
		messageToDelete.nextSibling.setAttribute(
			'data-twitch-first-message-in-group',
			true
		);
	}

	// Remove the deleted message
	messageToDelete.remove();
}

/**
 * Removes a specified message from the overlay, respecting themes' transitions.
 *
 * @param {string} messageId - unique identifier of message getting deleted
 */
export function removeMessage(messageId) {
	const messageToDelete = document.querySelector(
		`[data-twitch-message="${messageId}"]:not([data-twitch-message-status="deleting"])`
	);
	console.log({messageId, messageToDelete});

	// Message has already been deleted through another means, or is in the process of getting deleted
	if (!messageToDelete) return;

	// Apply style hook for themes' outbound transitions
	messageToDelete.setAttribute('data-twitch-message-status', 'deleting');

	// Give animation a chance
	messageToDelete.addEventListener('transitionend', () => {
		let remainingMessageToDelete = document.querySelector(
			`[data-twitch-message="${messageId}"]`
		);
		if (remainingMessageToDelete) {
			_removeMessageFromDomAndShiftOthers(messageToDelete);
		}
	});

	messageToDelete.addEventListener('animationend', () => {
		let remainingMessageToDelete = document.querySelector(
			`[data-twitch-message="${messageId}"]`
		);
		if (remainingMessageToDelete) {
			_removeMessageFromDomAndShiftOthers(messageToDelete);
		}
	});

	// If no animation, delete anyways
	setTimeout(() => {
		let remainingMessageToDelete = document.querySelector(
			`[data-twitch-message="${messageId}"]`
		);
		if (remainingMessageToDelete) {
			_removeMessageFromDomAndShiftOthers(messageToDelete);
		}
	}, 1200);
}
