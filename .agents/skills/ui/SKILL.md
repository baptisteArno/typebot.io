---
name: ui
description: Use this skill when you need to write any frontend components. It explains project's UI best practices
---

- Keep it simple. Use the least amount of class names as possible
- We like to rely mostly on Flexbox layout. Instead of `w-full` try `flex-1` instead.
- UI primitives are defined in packages/ui. Use them whenever possible. Be very careful when you add custom class names to a primitive components, it should be last resort for a very local exception: we want the design system to be respected.
- You can write `useEffect` only if syncing with external storage or with DOM event. Otherwise, just derive values from others.
- Sort component props: values first, functions last
- Never add explicit type annotations on callback parameters when the type can be inferred from the component prop. e.g. `onValueCommit={(name) =>` not `onValueCommit={(name: string) =>`
- Use `cn()` when conditionally applying Tailwind classes that may conflict (e.g. border colors).
- In React components, order declarations as follows:
  1. Context hooks (useWorkspace, useTranslate, etc.)
  2. useState / useRef
  3. useQuery
  4. useMutation
  5. Handlers
  6. Derived variables
