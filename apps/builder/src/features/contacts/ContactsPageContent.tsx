// import {
//   keepPreviousData,
//   useMutation,
//   useQuery,
//   useQueryClient,
// } from "@tanstack/react-query";
// import { AddContactForm } from "@typebot.io/contacts/react/AddContactForm";
// import { ContactsDataTable } from "@typebot.io/contacts/react/ContactsDataTable";
// import { createContactsColumns } from "@typebot.io/contacts/react/contactsColumns";
// import { EmptyContacts } from "@typebot.io/contacts/react/EmptyContacts";
// import { isDefined } from "@typebot.io/lib/utils";
// import { AlertDialog } from "@typebot.io/ui/components/AlertDialog";
// import { Button } from "@typebot.io/ui/components/Button";
// import { Dialog } from "@typebot.io/ui/components/Dialog";
// import { Input } from "@typebot.io/ui/components/Input";
// import { Kbd } from "@typebot.io/ui/components/Kbd";
// import { Select } from "@typebot.io/ui/components/Select";
// import { useCopyToClipboard } from "@typebot.io/ui/hooks/useCopyToClipboard";
// import { Copy01Icon } from "@typebot.io/ui/icons/Copy01Icon";
// import { TickIcon } from "@typebot.io/ui/icons/TickIcon";
// import { useRouter } from "next/router";
// import { parseAsInteger, useQueryState } from "nuqs";
// import { useCallback, useMemo, useRef, useState } from "react";
// import { useDebouncedCallback } from "use-debounce";
// import { Seo } from "@/components/Seo";
// import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
// import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
// import { orpc } from "@/lib/queryClient";
// import { toast } from "@/lib/toast";

// const PAGE_LIMIT = 20;

// type Props = {
//   workspaceId: string;
//   spaceId?: string;
// };

// export const ContactsPageContent = ({ workspaceId, spaceId }: Props) => {
//   // Router & context
//   const router = useRouter();
//   const { workspace } = useWorkspace();
//   const queryClient = useQueryClient();

//   // Refs
//   const addContactFocusRef = useRef<HTMLTextAreaElement | null>(null);
//   const deleteCancelRef = useRef<HTMLButtonElement | null>(null);

//   // State
//   const [deleteConfirmLoading, setDeleteConfirmLoading] = useState(false);
//   const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
//   const [deletingState, setDeletingState] = useState<
//     { ids: string[]; singleLabel?: string; confirmValue?: string } | undefined
//   >();
//   const [confirmInput, setConfirmInput] = useState("");
//   const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

//   // Query state (URL)
//   const [searchQuery, setSearchQuery] = useQueryState("q", {
//     defaultValue: "",
//   });
//   const [page, setPage] = useQueryState(
//     "page",
//     parseAsInteger.withDefault(1).withOptions({ shallow: false }),
//   );
//   const [searchInput, setSearchInput] = useState(searchQuery);

//   // Custom hooks
//   const { copied, copy } = useCopyToClipboard();
//   const debouncedSetSearchQuery = useDebouncedCallback((value) => {
//     setSearchQuery(value || null);
//     setPage(1);
//   }, 300);

//   // Mutations
//   const { mutateAsync: deleteContact } = useMutation(
//     orpc.contacts.delete.mutationOptions({
//       onSuccess: () => {
//         queryClient.invalidateQueries({
//           queryKey: orpc.contacts.list.key(),
//         });
//       },
//     }),
//   );

//   const { mutateAsync: createContact } = useMutation(
//     orpc.contacts.create.mutationOptions({
//       onSuccess: () => {
//         queryClient.invalidateQueries({
//           queryKey: orpc.contacts.list.key(),
//         });
//       },
//     }),
//   );

//   const { mutateAsync: deleteManyContacts } = useMutation(
//     orpc.contacts.deleteMany.mutationOptions({
//       onSuccess: () => {
//         queryClient.invalidateQueries({
//           queryKey: orpc.contacts.list.key(),
//         });
//       },
//     }),
//   );

//   // Queries
//   const { data: propertyDefinitionsData } = useQuery(
//     orpc.contacts.listPropertyDefinitions.queryOptions({
//       input: { workspaceId, ...(spaceId !== undefined && { spaceId }) },
//       enabled: !!workspaceId,
//     }),
//   );
//   const propertyDefinitions =
//     propertyDefinitionsData?.propertyDefinitions ?? [];

//   const { data: spacesData } = useQuery(
//     orpc.spaces.list.queryOptions({
//       input: { workspaceId },
//       enabled: !!workspaceId,
//     }),
//   );
//   const spaces = spacesData?.spaces ?? [];

//   const cursor = page > 1 ? (page - 1) * PAGE_LIMIT : undefined;
//   const { data, isLoading } = useQuery({
//     ...orpc.contacts.list.queryOptions({
//       input: {
//         workspaceId,
//         ...(spaceId !== undefined && { spaceId }),
//         limit: PAGE_LIMIT,
//         cursor,
//         ...(searchQuery.trim() !== "" && { q: searchQuery.trim() }),
//       },
//     }),
//     enabled: !!workspaceId,
//     placeholderData: keepPreviousData,
//   });
//   const contacts = data?.contacts ?? [];
//   const hasNextPage = isDefined(data?.nextCursor);
//   const hasPreviousPage = page > 1;

//   // Event handlers & derived values
//   const handleSearchChange = useCallback(
//     (value) => {
//       setSearchInput(value);
//       debouncedSetSearchQuery(value);
//     },
//     [debouncedSetSearchQuery],
//   );

//   const onNextPage = useCallback(() => {
//     if (data?.nextCursor !== undefined) setPage(page + 1);
//   }, [data?.nextCursor, page, setPage]);

//   const onPreviousPage = useCallback(() => {
//     setPage(page > 1 ? page - 1 : 1);
//   }, [page, setPage]);

//   const onAddContact = useCallback(() => {
//     setIsAddContactDialogOpen(true);
//   }, []);

//   const onEdit = useCallback(() => {
//     // TODO: navigate to /contacts/[id]/edit
//   }, []);

//   const onDelete = useCallback(
//     (contact: {
//       id: string;
//       name?: string | null;
//       properties: readonly {
//         key: string;
//         type: string;
//         value: string | number;
//       }[];
//     }) => {
//       const firstPropValue = contact.properties[0]?.value;
//       const confirmValue = contact.name ?? firstPropValue ?? undefined;
//       setDeletingState({
//         ids: [contact.id],
//         singleLabel: contact.name ?? firstPropValue ?? "this contact",
//         confirmValue,
//       });
//       setConfirmInput("");
//       setIsDeleteDialogOpen(true);
//     },
//     [],
//   );

//   const onBulkDelete = useCallback((contactIds: string[]) => {
//     setDeletingState({
//       ids: contactIds,
//       confirmValue: "Delete all",
//     });
//     setConfirmInput("");
//     setIsDeleteDialogOpen(true);
//   }, []);

//   const columns = useMemo(
//     () =>
//       createContactsColumns({
//         propertyDefinitions,
//         onEdit,
//         onDelete,
//       }),
//     [propertyDefinitions, onEdit, onDelete],
//   );

//   // Derived values
//   const showEmptyState =
//     contacts.length === 0 &&
//     cursor === undefined &&
//     searchQuery.trim() === "" &&
//     !isLoading;

//   const buildContactsUrl = useCallback(
//     (spaceIdValue, resetPage = false) => {
//       const searchParams = new URLSearchParams();
//       if (searchQuery) searchParams.set("q", searchQuery);
//       if (!resetPage && page > 1) searchParams.set("page", String(page));
//       const queryString = searchParams.toString();
//       const base =
//         spaceIdValue !== null
//           ? `/w/${workspaceId}/s/${spaceIdValue}/contacts`
//           : `/w/${workspaceId}/contacts`;
//       return queryString ? `${base}?${queryString}` : base;
//     },
//     [workspaceId, searchQuery, page],
//   );

//   const currentSpaceValue = spaceId ?? "__all__";

//   const isDeleteActionDisabled =
//     deleteConfirmLoading ||
//     (isDefined(deletingState?.confirmValue) &&
//       confirmInput !== deletingState.confirmValue);

//   const handleDeleteContacts = useCallback(async () => {
//     if (!deletingState?.ids.length || !workspaceId || isDeleteActionDisabled)
//       return;
//     setDeleteConfirmLoading(true);
//     const idsToDelete = deletingState.ids;
//     if (idsToDelete.length === 1) {
//       await deleteContact({
//         workspaceId,
//         ...(spaceId !== undefined && { spaceId }),
//         contactId: idsToDelete[0],
//       });
//     } else {
//       await deleteManyContacts({
//         workspaceId,
//         ...(spaceId !== undefined && { spaceId }),
//         contactIds: idsToDelete,
//       });
//     }
//     setRowSelection((prev) => {
//       const next = { ...prev };
//       for (const id of idsToDelete) delete next[id];
//       return next;
//     });
//     setIsDeleteDialogOpen(false);
//   }, [
//     deletingState?.ids,
//     workspaceId,
//     spaceId,
//     isDeleteActionDisabled,
//     deleteContact,
//     deleteManyContacts,
//   ]);

//   const onSpaceChange = useCallback(
//     (value: string | null) => {
//       const url =
//         value === "__all__"
//           ? buildContactsUrl(null, true)
//           : buildContactsUrl(value, true);
//       router.push(url);
//     },
//     [buildContactsUrl, router],
//   );

//   return (
//     <div className="flex flex-col min-h-screen">
//       <Seo
//         title={workspace?.name ? `${workspace.name} | Contacts` : "Contacts"}
//       />
//       <DashboardHeader />
//       <div className="flex flex-1 w-full bg-gray-1 justify-center">
//         <div className="flex w-full max-w-5xl flex-col gap-4 pb-12 pt-6">
//           <div className="flex flex-col gap-2">
//             {spaces.length > 0 && (
//               <Select.Root
//                 value={currentSpaceValue}
//                 onValueChange={onSpaceChange}
//               >
//                 <Select.Trigger className="w-[200px]" size="sm">
//                   <Select.Value />
//                 </Select.Trigger>
//                 <Select.Content>
//                   <Select.Item value="__all__">All spaces</Select.Item>
//                   {spaces.map((space) => (
//                     <Select.Item key={space.id} value={space.id}>
//                       {space.name}
//                     </Select.Item>
//                   ))}
//                 </Select.Content>
//               </Select.Root>
//             )}
//             {showEmptyState ? (
//               <EmptyContacts onAddClick={onAddContact} className="py-12" />
//             ) : (
//               <ContactsDataTable
//                 contacts={contacts}
//                 columns={columns}
//                 onAddContact={onAddContact}
//                 onBulkDelete={onBulkDelete}
//                 hasNextPage={hasNextPage}
//                 hasPreviousPage={hasPreviousPage}
//                 onNextPage={onNextPage}
//                 onPreviousPage={onPreviousPage}
//                 isLoading={isLoading}
//                 searchValue={searchInput}
//                 onSearchChange={handleSearchChange}
//                 rowSelection={rowSelection}
//                 onRowSelectionChange={(updater) =>
//                   setRowSelection((prev) =>
//                     typeof updater === "function" ? updater(prev) : prev,
//                   )
//                 }
//               />
//             )}
//           </div>
//         </div>
//       </div>
//       <Dialog.Root
//         isOpen={isAddContactDialogOpen}
//         onClose={() => setIsAddContactDialogOpen(false)}
//       >
//         <Dialog.Popup initialFocus={addContactFocusRef}>
//           <Dialog.Title>Add contacts</Dialog.Title>
//           <Dialog.CloseButton />
//           <AddContactForm
//             key={isAddContactDialogOpen ? "open" : "closed"}
//             propertyDefinitions={propertyDefinitions}
//             onSubmit={async (partialContacts) => {
//               try {
//                 for (const partial of partialContacts) {
//                   await createContact({
//                     ...partial,
//                     workspaceId,
//                     ...(spaceId !== undefined && { spaceId }),
//                   });
//                 }
//                 setIsAddContactDialogOpen(false);
//               } catch (error) {
//                 toast({
//                   type: "error",
//                   title: "Failed to add contacts",
//                   details:
//                     error instanceof Error ? error.message : String(error),
//                 });
//               }
//             }}
//             initialFocusRef={addContactFocusRef}
//           />
//         </Dialog.Popup>
//       </Dialog.Root>

//       <AlertDialog.Root
//         isOpen={isDeleteDialogOpen && deletingState !== undefined}
//         onClose={() => setIsDeleteDialogOpen(false)}
//         onCloseComplete={() => {
//           setDeletingState(undefined);
//           setDeleteConfirmLoading(false);
//           setConfirmInput("");
//         }}
//       >
//         <AlertDialog.Content
//           initialFocus={deleteCancelRef}
//           size="lg"
//           onKeyDown={(e) => {
//             if (
//               (e.metaKey || e.ctrlKey) &&
//               e.key === "Enter" &&
//               !isDeleteActionDisabled
//             ) {
//               e.preventDefault();
//               void handleDeleteContacts();
//             }
//           }}
//         >
//           <AlertDialog.Header>
//             <AlertDialog.Title>
//               {deletingState?.ids.length === 1
//                 ? "Delete contact"
//                 : "Delete contacts"}
//             </AlertDialog.Title>
//             <AlertDialog.Description className="text-left">
//               {isDefined(deletingState?.confirmValue) ? (
//                 <div className="flex flex-col gap-4">
//                   <p>
//                     {deletingState.ids.length === 1
//                       ? "Are you sure you want to delete this contact and remove it from all segments? "
//                       : `Are you sure you want to delete ${deletingState.ids.length} contacts and remove them from all segments? `}
//                     <span className="text-destructive">
//                       This can not be undone.
//                     </span>
//                   </p>
//                   <p className="text-sm">
//                     Type{" "}
//                     <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-mono text-foreground align-middle">
//                       {deletingState.confirmValue}
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="icon"
//                         className="h-6 w-6 shrink-0 -mr-1"
//                         onClick={() => copy(deletingState.confirmValue!)}
//                       >
//                         <span className="relative inline-flex size-4">
//                           <span
//                             className={`absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out origin-center ${
//                               copied ? "scale-0" : "scale-100"
//                             }`}
//                           >
//                             <Copy01Icon className="size-4" />
//                           </span>
//                           <span
//                             className={`absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out origin-center ${
//                               copied ? "scale-100" : "scale-0"
//                             }`}
//                           >
//                             <TickIcon className="size-4 text-green-11" />
//                           </span>
//                         </span>
//                       </Button>
//                     </span>{" "}
//                     to confirm.
//                   </p>
//                   <Input
//                     size="sm"
//                     className="text-foreground"
//                     placeholder={
//                       deletingState.confirmValue === "Delete all"
//                         ? "Enter Delete all to confirm"
//                         : deletingState.confirmValue?.includes("@")
//                           ? "Enter contact email"
//                           : "Enter contact phone"
//                     }
//                     value={confirmInput}
//                     onValueChange={(value) => setConfirmInput(value)}
//                   />
//                 </div>
//               ) : (
//                 <>
//                   Are you sure you want to delete{" "}
//                   <strong>
//                     {deletingState?.singleLabel ?? "this contact"}
//                   </strong>
//                   ?
//                 </>
//               )}
//             </AlertDialog.Description>
//           </AlertDialog.Header>
//           <AlertDialog.Footer>
//             <AlertDialog.Cancel>
//               Cancel
//               <Kbd.Key>Esc</Kbd.Key>
//             </AlertDialog.Cancel>
//             <AlertDialog.Action
//               variant="destructive"
//               size="sm"
//               disabled={isDeleteActionDisabled}
//               onClick={() => void handleDeleteContacts()}
//             >
//               {deletingState?.ids.length === 1
//                 ? "Delete contact"
//                 : "Delete contacts"}
//               <Kbd.Group>
//                 <Kbd.Key className="text-destructive-foreground/90 bg-destructive">
//                   ⌘
//                 </Kbd.Key>
//                 <Kbd.Key className="text-destructive-foreground/90 bg-destructive">
//                   ↩
//                 </Kbd.Key>
//               </Kbd.Group>
//             </AlertDialog.Action>
//           </AlertDialog.Footer>
//         </AlertDialog.Content>
//       </AlertDialog.Root>
//     </div>
//   );
// };
