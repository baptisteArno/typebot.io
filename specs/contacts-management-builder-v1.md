# Contacts Management In Builder — V1 Specification

## 1. Summary

V1 adds a workspace-level contacts area in Builder with three routes: `/contacts`, `/contacts/properties`, and `/contacts/segments`. The feature lets a user manage contacts, define reusable contact properties, and organize contacts into segments from one shared surface, while still respecting the current space filter.

The scope is intentionally narrow. Contacts are created manually from email addresses or phone numbers, a contact must always keep at least one of those identifiers, property definitions support only `STRING` and `NUMBER`, and segments are simple named groups that can be reused by contacts and campaigns. All three tabs support server-side search, share the same space filter, and use URL state so the current tab and filters are restorable and shareable.

## 2. Detailed User Journey

### Shared navigation and scoping

1. The user opens `/contacts`, `/contacts/properties`, or `/contacts/segments`.
2. The page shows the Builder dashboard header, the `Contacts` title, the three tabs, and a shared space filter.
3. The user switches between tabs through navigation, not local tab state. The route and query params stay the source of truth, so browser back and forward restore the same view.
4. The user chooses either `All spaces` or one specific space. `All spaces` shows workspace-level and space-level records together. Choosing a specific space narrows the list and also becomes the default scope for new contacts, properties, and segments created from that view.

### Contacts tab

1. When the user lands on `/contacts` with no contacts yet, the page shows an empty state with `Add contacts`. Once contacts exist, the page shows a list with the main identifiers, segment pills, creation date, and row actions.
2. The user can type in the search input to find contacts. The search runs server-side. The user can also filter the list by one segment at a time. If the selected segment no longer matches the current space filter, that segment filter is cleared.
3. The user clicks `Add contacts` to open a dialog. The dialog contains a space selector prefilled from the current page scope, a textarea for comma-separated identifiers, and an optional segment multi-select.
4. In that textarea, the user can paste emails and phone numbers. Empty tokens are ignored, invalid tokens are rejected, and each valid token creates one contact in the selected scope. V1 does not capture names during creation. If the submission contains a mix of valid entries, invalid entries, or scoped duplicates, the dialog reports which entries failed while still allowing valid contacts to be created.
5. The user clicks `Edit` on a row to open a contact form. The form contains first name, last name, email, phone, the segment multi-select, and all property definitions available in the current scope. Property inputs are rendered from their definition type. Clearing a property input removes the stored value instead of saving an empty string. Saving updates the base contact fields, memberships, and property values together, but the user cannot save a contact with both email and phone empty.
6. The user clicks `Delete` on a row, confirms the action, and the contact is hard-deleted. Its segment memberships and stored property values are removed with it.
7. The list supports infinite scroll. If the current search or segment filter returns no rows, the page shows a filtered empty state with an action to clear the filters.

### Properties tab

1. The user opens `/contacts/properties`. With no properties defined yet, the page shows an empty state with `Add property`. Otherwise it shows a searchable list with the property name, type, fallback value, creation date, and row actions.
2. The user clicks `Add property` to open a dialog with `Name`, `Type`, and optional `Fallback value`. The property is created in the current scope. V1 supports only `STRING` and `NUMBER`, and the fallback value must match the selected type.
3. After creation, the property becomes available in the contact edit form for contacts in the same workspace or space scope.
4. The user clicks `Edit` to update the property name or fallback value. The type is read-only after creation. Changing the fallback value updates the definition only; it does not backfill or rewrite contact values.
5. The user clicks `Delete`, confirms, and the property definition is hard-deleted. All stored contact values attached to that definition are deleted as well.

### Segments tab

1. The user opens `/contacts/segments`. With no segments yet, the page shows an empty state with `Add segment`. Otherwise it shows a searchable list with the segment name, contact count, creation date, and row actions.
2. The user clicks `Add segment` to create a segment in the current scope. V1 keeps this simple: a segment is just a name and contacts can belong to multiple segments.
3. The user clicks `Edit` to rename a segment.
4. The user clicks a segment row to jump to `/contacts` with that segment already selected as the active filter. If a space filter was active, it is preserved in the URL.
5. The user clicks `Delete`, confirms, and the segment is hard-deleted. Its contact memberships are removed, and any `Campaign.recipientSegmentId` pointing to that segment is cleared.

## 3. Data Model Changes And Why

`Contact` becomes explicitly scoped by `workspaceId` and optional `spaceId`. Uniqueness moves to `[workspaceId, spaceId, email]` and `[workspaceId, spaceId, phone]`, and the listing index also includes `spaceId`. This is required because contacts are managed from a workspace-level Builder area, but creation, filtering, and duplicate handling still depend on the selected space.

`ContactPropertyDefinition` becomes a scoped workspace or space record with timestamps, a string id, a typed `type`, and typed fallback storage (`fallbackValueString` and `fallbackValueNumber`). Its key is unique per scope. This supports a reusable property catalog for contacts without allowing cross-scope collisions, and it keeps fallback values on the definition instead of materializing them onto each contact.

`ContactProperty` keeps the current “one stored value per contact and property definition” shape, with typed value columns and a composite id on `(contactId, definitionId)`. This keeps contact values sparse and typed while letting the contact edit form save or remove values atomically.

`Segment` gains timestamps, optional `spaceId`, scoped uniqueness on `name`, and a relation to `Campaign`. This is needed because segments are managed alongside contacts, can be reused across many contacts, and deleting a segment must also clear campaign references cleanly. The segment membership table remains the many-to-many link between contacts and segments so a contact can belong to several segments even though the contacts list filters by only one segment at a time in V1.

`ContactPropertyType` remains limited to `STRING` and `NUMBER` for this version so the property UI, validation, and storage model stay small and predictable.
