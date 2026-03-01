# StandaloneChat Changelog

## Emoji Management for Group Images

- Added modal-first removal flow for group emojis. Users open the reactions modal, select an emoji chip, then tap their own user row to remove their reaction.
- Implemented permission control: users can only remove their own reactions; other rows are non-interactive.
- Exposed `onRemoveEmoji` public API on `ChatProps` for programmatic removal. Signature: `(message, emojiObj) => void`, where `emojiObj` includes `{ emoji: string; userId?: string | number }`.
- Restored modal visibility by reverting group card tap behavior to always open the modal and relocating removal action inside the modal user list.
- Integrated theming for modal backdrop and sheet; ensured scrollable content with fixed header/footer.
- Added optional props to `ReactionBubble` (`userId`, `onRemoveEmoji`, `closeOnBackdropPress`) without breaking existing usage.
- Exported helpers: `aggregateGrouped`, `hasUserEmoji`, `canRemoveOwn`, `usersForEmoji`, `countForEmoji` to support tests and external integrations.

## Tests

- Unit tests for permissions: `hasUserEmoji` and `canRemoveOwn`.
- Modal integration tests: `aggregateGrouped`, `countForEmoji`, and `usersForEmoji`.
- Regression tests for backdrop close behavior: `shouldCloseOnBackdropPress`.

## Notes on Backward Compatibility

- All new props and exports are optional additions.
- Existing behavior is preserved unless new features are explicitly opted-in.

