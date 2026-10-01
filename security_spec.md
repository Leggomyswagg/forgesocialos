# Security Specification & Test Definitions

## 1. Data Invariants
1. **User Profile Ownership**: A user profile document `/users/{userId}` can only be created, read, and updated by the authenticated user whose `request.auth.uid == userId`.
2. **Activity and Asset Ownership**: Any document under `/users/{userId}/activities/{activityId}` or `/users/{userId}/assets/{assetId}` can only be created and accessed by the parent `userId` matching `request.auth.uid`.
3. **Feedback Submission**: A user can create a feedback record `/feedback/{feedbackId}` with their own `userId` set to `request.auth.uid`, with status initially `'open'`. Users can read their own feedback records.
4. **Id Immutability & Key Validation**: Document IDs must satisfy `isValidId(id)`. Payloads must enforce key allowlists and strict property limits (e.g., `title.size() <= 256`, `description.size() <= 2048`).
5. **No Blind Reads**: List operations must verify `resource.data.userId == request.auth.uid`.

## 2. The Dirty Dozen Payloads
1. **Spoofed User Creation**: Attempting to create `/users/{victimId}` with `auth.uid == attackerId`. (Must FAIL)
2. **Ghost Key Injection**: Attempting to write a profile with unrecognized field `isAdmin: true`. (Must FAIL)
3. **PII Query Scrape**: Unauthenticated or cross-account client attempting to list all `/users`. (Must FAIL)
4. **Cross-Tenant Activity Injection**: Attacker inserting activity into `/users/{victimId}/activities/{activityId}`. (Must FAIL)
5. **Sub-Collection Resource Poisoning**: Creating an asset with an oversized 100KB string in `business`. (Must FAIL)
6. **Cross-User Asset Read**: User A requesting a get on `/users/userB/assets/{assetId}`. (Must FAIL)
7. **Feedback ID Hijack**: Feedback payload where `incoming().userId` does not equal `request.auth.uid`. (Must FAIL)
8. **Feedback State Tampering**: Regular user attempting to update feedback `status` to `'resolved'`. (Must FAIL)
9. **Oversized Feedback Injection**: Feedback `description` exceeding 2048 characters. (Must FAIL)
10. **Path Variable ID Injection**: Using invalid regex characters or path traversal in `{userId}`. (Must FAIL)
11. **Client Delegation Query Leak**: `allow list` without matching `resource.data.userId == request.auth.uid`. (Must FAIL)
12. **Immutable Field Mutating**: Modifying `createdAt` or `id` during profile update. (Must FAIL)
