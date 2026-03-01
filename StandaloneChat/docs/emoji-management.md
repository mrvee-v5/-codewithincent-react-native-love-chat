# Emoji Management (Group Images)

## Overview
Implements modal-first emoji removal for group messages and exposes a public API for programmatic removal, with strict permission controls and backward compatibility.

## User Flow
- Tap the group emoji card to open the reactions modal.
- Select an emoji chip to filter the user list.
- Tap your own row to remove your reaction to the selected emoji. Other rows are non-interactive.

## Public API
- `onRemoveEmoji?: (message, emojiObj) => void` on `ChatProps`
  - `emojiObj`: `{ emoji: string; userId?: string | number }`
  - Trigger removal and propagate across clients via your real-time layer.

## Component Props
- `ReactionBubble`
  - `userId?: string | number`
  - `onRemoveEmoji?: (emojiObj) => void`
  - `closeOnBackdropPress?: boolean` (opt-in backdrop press-to-close)

## Helpers
- `aggregateGrouped(reactions)`
- `hasUserEmoji(reactions, userId, emoji)`
- `canRemoveOwn(targetUserId, currentUserId)`
- `usersForEmoji(reactions, participants, emoji)`
- `countForEmoji(reactions, emoji)`

## Compatibility
- No breaking changes; new props and exports are optional.
- Existing implementations continue to function without modification.

