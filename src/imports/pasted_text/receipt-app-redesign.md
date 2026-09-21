I want you to redesign and prepare the attached Figma designs as a modern, polished, developer-ready frontend for a receipt and transaction management application.

IMPORTANT:
The attached Figma designs are the primary source of truth for the application's existing features, information architecture, pages, content, and user flows.

Do NOT remove existing functionality or change the business flow.
Do NOT invent unnecessary features.
Do NOT redesign the application from scratch.

The goal is to modernize and improve the existing design while preserving its functionality and overall structure.

==================================================
1. PROJECT CONTEXT
==================================================

This is a receipt and transaction management application.

The existing application contains flows and screens related to:

- Dashboard
- Transaction data
- Creating transactions
- Editing transactions
- Viewing transaction details
- Deleting transactions
- Receipt / Kwitansi management
- Receipt printing / print preview
- Nota management
- Nota item management
- Success notifications
- Confirmation dialogs
- Forms
- Tables
- Search and filtering
- Transaction summaries

Analyze all attached designs carefully and identify all existing pages, screens, components, states, and repeated UI patterns.

Preserve the existing information architecture and user journey.

==================================================
2. VISUAL REDESIGN
==================================================

Modernize the existing interface so it feels like a contemporary professional desktop business application.

Visual direction:

- Modern
- Clean
- Elegant
- Professional
- Minimal
- Slightly premium
- Comfortable for long-term daily use
- Clear visual hierarchy
- Strong readability
- Practical rather than decorative

Improve:

- Typography hierarchy
- Spacing
- Alignment
- Layout proportions
- Sidebar
- Header
- Cards
- Tables
- Forms
- Buttons
- Input fields
- Modal dialogs
- Notifications
- Status badges
- Empty states
- Loading states
- Error states
- Hover states
- Focus states

Use subtle visual depth through borders, shadows, spacing, and elevation.

Avoid:

- Excessive gradients
- Excessive glassmorphism
- Excessive rounded elements
- Large decorative illustrations that do not improve usability
- Excessive animations
- Visually noisy interfaces
- Unnecessary UI elements

The result should look modern and polished without losing its professional administrative character.

==================================================
3. PRESERVE EXISTING FUNCTIONALITY
==================================================

Do not change the existing business logic or workflow.

Keep:

- Existing pages
- Existing navigation
- Existing actions
- Existing forms
- Existing transaction fields
- Existing receipt fields
- Existing nota fields
- Existing table information
- Existing print workflow
- Existing confirmation workflow
- Existing success/error feedback

If a design contains an existing interaction or feature, preserve it.

If something is unclear from the design, do not invent a new business rule. Keep the existing structure and use a neutral UI treatment.

==================================================
4. RESPONSIVE DESIGN
==================================================

The frontend must support both:

1. Windows desktop application
2. Web application

The same frontend codebase should be reusable for both environments.

Design the UI primarily for desktop productivity, while also ensuring that it adapts properly to different browser and application window sizes.

Support:

- Large desktop screens
- Standard laptop screens
- Smaller desktop windows
- Browser environments
- Responsive layouts where appropriate

Do not create completely separate desktop and web interfaces.

Prefer reusable responsive components.

The UI should remain usable when the application window becomes smaller.

Tables should handle limited horizontal space gracefully.

Forms should adapt without becoming visually crowded.

==================================================
5. DESIGN SYSTEM
==================================================

Create a consistent design system that can be reused throughout the entire application.

Define centralized design tokens for:

Colors:
- Primary
- Secondary
- Background
- Surface
- Card
- Text
- Muted text
- Border
- Success
- Warning
- Error
- Info
- Hover states
- Focus states

Typography:
- Font family
- Heading sizes
- Body sizes
- Caption sizes
- Font weights
- Line heights
- Letter spacing

Spacing:
- xs
- sm
- md
- lg
- xl
- 2xl

Other tokens:
- Border radius
- Border widths
- Shadows
- Component heights
- Transition durations
- Breakpoints

Use these tokens consistently instead of creating arbitrary values for individual pages.

==================================================
6. REUSABLE COMPONENTS
==================================================

Identify repeated UI patterns and convert them into reusable components.

Create reusable components for:

Layout:
- AppLayout
- Sidebar
- Header
- PageHeader
- ContentContainer

Navigation:
- NavigationItem
- Breadcrumb
- Tabs

Buttons:
- PrimaryButton
- SecondaryButton
- GhostButton
- DangerButton
- IconButton

Forms:
- Input
- Select
- DatePicker
- SearchInput
- Textarea
- FormField
- FormLabel
- FormError

Data:
- Table
- TableHeader
- TableRow
- TableCell
- Pagination
- EmptyState
- LoadingState

Feedback:
- Toast
- Alert
- SuccessMessage
- ErrorMessage
- ConfirmationModal

Business UI:
- TransactionCard
- SummaryCard
- StatusBadge
- ReceiptPreview
- NotaItemTable
- TotalAmount
- PrintPreview

Use component variants rather than creating separate components for visually similar elements.

For example:

Button:
- primary
- secondary
- outline
- ghost
- danger

Badge:
- success
- warning
- error
- neutral
- info

==================================================
7. COMPONENT STATES
==================================================

Every interactive component should have clearly defined states.

Include where appropriate:

- Default
- Hover
- Active
- Focus
- Disabled
- Loading
- Error
- Success

Forms should clearly communicate validation errors.

Buttons should have loading states.

Tables should have loading and empty states.

Destructive actions should have confirmation states.

Notifications should have success and error variants.

==================================================
8. GLOBAL STYLING
==================================================

Use a centralized styling architecture.

Do not create unnecessary page-specific CSS.

Global visual rules should be defined centrally so that changing the design system later updates the entire application consistently.

Avoid duplicated styles.

Avoid hardcoding the same colors, spacing, radius, typography, or shadows repeatedly across individual components.

The generated frontend should have a clear separation between:

- Global design tokens
- Layout styles
- Reusable component styles
- Page-specific composition

The design should be easy for developers to maintain and extend.

==================================================
9. FRONTEND TECHNOLOGY TARGET
==================================================

Prepare the design for implementation using:

- React
- TypeScript
- Tailwind CSS

Prefer:

- Reusable React components
- Type-safe component props
- Centralized design tokens
- Consistent Tailwind utility patterns
- Clean component composition
- Maintainable folder structure
- Minimal duplicated code

Do not create a separate implementation for every screen when the same component can be reused.

==================================================
10. DESKTOP + WEB ARCHITECTURE
==================================================

The frontend should be designed as a shared UI codebase.

The intended architecture is:

Shared React Frontend
        |
        |----------------------|
        |                      |
Windows Desktop              Web
        |                      |
Tauri                      Browser
        |                      |
SQLite                    Supabase
        |                      |
Windows .exe               Vercel

The UI and reusable components should be independent from the underlying data source.

Do not tightly couple UI components to SQLite, Supabase, Tauri, or browser-specific APIs.

The UI should be able to consume data through clean interfaces or services.

For example:

TransactionService
ReceiptService
NotaService

The UI should not need to know whether the data comes from SQLite or Supabase.

==================================================
11. PRINTING
==================================================

The application contains receipt and nota printing workflows.

Design the print preview experience clearly and professionally.

Separate:

- Application UI
- Print preview
- Printable document layout

The printable receipt and nota should remain visually clean and suitable for actual printing.

Avoid adding unnecessary application navigation or UI elements to the printable document.

==================================================
12. ACCESSIBILITY AND USABILITY
==================================================

Prioritize practical usability.

Ensure:

- Clear text hierarchy
- Good contrast
- Clearly identifiable buttons
- Clear form labels
- Visible focus states
- Understandable error messages
- Consistent interaction patterns
- Sufficient clickable areas
- Logical keyboard navigation where appropriate

Do not sacrifice usability for visual decoration.

==================================================
13. ANIMATION AND INTERACTION
==================================================

Use subtle and professional animations only where they improve the experience.

Examples:

- Modal opening
- Toast appearing
- Sidebar interaction
- Button feedback
- Dropdown transitions
- Table state changes
- Page transitions

Animations should be short, subtle, and appropriate for a professional business application.

Do not use excessive animations.

==================================================
14. DEVELOPER-FRIENDLY STRUCTURE
==================================================

The final design should make frontend implementation straightforward.

Identify:

- Reusable components
- Component variants
- Design tokens
- Layout patterns
- Page patterns
- Responsive behavior
- Interactive states

Avoid creating visually unique components when an existing reusable component can be used.

Prioritize consistency across the entire application.

==================================================
15. IMPORTANT DESIGN PRINCIPLE
==================================================

Do not optimize only for visual appearance.

Optimize for:

- Maintainability
- Reusability
- Consistency
- Scalability
- Accessibility
- Developer implementation
- Desktop usability
- Web compatibility

The result should be a design system and frontend foundation that can grow with the application.

==================================================
16. FINAL OUTPUT
==================================================

After analyzing the attached designs:

1. Preserve all existing pages and flows.
2. Modernize the visual design.
3. Identify reusable patterns.
4. Create reusable components.
5. Establish a centralized design system.
6. Establish consistent design tokens.
7. Define component variants.
8. Define interaction states.
9. Make the layout responsive.
10. Prepare the design for React + TypeScript + Tailwind CSS.
11. Keep the frontend reusable between Tauri desktop and web.
12. Avoid unnecessary features.
13. Avoid duplicated styling.
14. Keep the result practical and production-oriented.

The final result should feel like a modern, polished, professional receipt and transaction management application while remaining faithful to the original functionality and information architecture.