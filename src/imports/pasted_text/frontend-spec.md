Now prepare the approved design for frontend implementation.

IMPORTANT:
The visual design has already been approved.

Do not redesign the UI again.

Do not change:
- Features
- Pages
- Navigation
- Content
- Data fields
- Table columns
- User flows
- Business rules
- Visual direction

The attached ERD is the authoritative reference for the application's
data model and relationships.

The frontend must be designed so that its data structures,
TypeScript types, forms, tables, and service interfaces are consistent
with the ERD.

Do NOT invent database entities, fields, or relationships that are not
represented in the ERD.

==================================================
1. TECHNOLOGY
==================================================

Use:

- React
- TypeScript
- Tailwind CSS

Create a reusable component architecture.

The generated frontend should be suitable for both:

1. Windows desktop application using Tauri + SQLite
2. Web application using Supabase + Vercel

==================================================
2. ERD AS DATA MODEL REFERENCE
==================================================

Use the attached ERD as the source of truth for the application's
data model and relationships.

The current ERD contains the following entities:

--------------------------------------------------
ADMIN
--------------------------------------------------

Table: admin

Fields:
- id_admin
- jabatan
- username
- password

The jabatan values represented in the ERD are:
- bang_karir
- bang_tensi

--------------------------------------------------
FORMULIR TRANSAKSI
--------------------------------------------------

Table: formulir_transaksi

Fields:
- id_formulir_transaksi
- terima_dari
- jumlah_uang
- untuk_pembayaran
- penerima_uang
- tanggal_transaksi
- tanggal_input
- total_harga
- kota
- id_admin

--------------------------------------------------
DATA TRANSAKSI
--------------------------------------------------

Table: data_transaksi

Fields:
- id_data_transaksi
- id_formulir_transaksi
- id_admin

--------------------------------------------------
PRINT KWITANSI
--------------------------------------------------

Table: print_kwitansi

Fields:
- id_print_kwitansi
- id_admin
- id_data_transaksi

--------------------------------------------------
FORMULIR NOTA
--------------------------------------------------

Table: formulir_nota

Fields represented in the ERD:
- id_formulir_transaksi
- tanggal_transaksi
- nama_barang
- satuan
- harga
- jumlah_item
- sub_total_harga
- total_harga
- id_admin

IMPORTANT:
Preserve the field naming exactly as represented in the provided ERD.
Do not silently rename or reinterpret fields.

There appears to be a naming inconsistency where the primary key of
formulir_nota is shown as "id_formulir_transaksi".

Do not automatically change this field.

Treat the ERD as authoritative and flag this inconsistency for
developer review before database implementation.

--------------------------------------------------
DATA NOTA
--------------------------------------------------

Table: data_nota

Fields:
- id_data_nota
- id_admin
- id_formulir_nota

--------------------------------------------------
PRINT NOTA
--------------------------------------------------

Table: print_nota

Fields:
- id_print_nota
- id_data_nota
- id_admin

==================================================
3. RELATIONSHIPS
==================================================

Respect the relationships represented in the ERD.

The frontend data model should be capable of representing these
relationships without inventing additional relationships.

Important relationships represented by the ERD include:

- Admin → Formulir Transaksi
- Formulir Transaksi → Data Transaksi
- Admin → Data Transaksi
- Data Transaksi → Print Kwitansi
- Admin → Print Kwitansi

For nota-related data:

- Admin → Formulir Nota
- Formulir Nota → Data Nota
- Admin → Data Nota
- Data Nota → Print Nota
- Admin → Print Nota

Do not create additional entities or relationships unless they are
explicitly represented in the ERD or required by the existing UI.

==================================================
4. FRONTEND DATA CONTRACT
==================================================

Create TypeScript types/interfaces that correspond closely to the
ERD entities.

For example, create domain types representing:

- Admin
- FormulirTransaksi
- DataTransaksi
- PrintKwitansi
- FormulirNota
- DataNota
- PrintNota

Keep TypeScript property names aligned with the ERD field names.

Do not create unrelated frontend-only data models when the existing
database entity can be represented directly.

If a UI needs a derived display value, keep that transformation
explicit rather than changing the underlying data model.

==================================================
5. FORM STRUCTURE
==================================================

Existing forms must correspond to the appropriate ERD entity.

For transaction forms, use the fields represented by:

formulir_transaksi

For nota forms, use the fields represented by:

formulir_nota

Do not add fields that are not part of the approved design or ERD.

Do not remove fields represented in the approved design.

Keep the UI field names understandable to users while maintaining
clear mapping to the corresponding TypeScript/domain property.

==================================================
6. TABLE STRUCTURE
==================================================

Existing data tables must remain consistent with the approved Figma
design and underlying ERD.

Do not remove or rename existing table columns.

Represent data using the appropriate domain entity.

Keep database identifiers separate from display labels when
appropriate.

For example:

Database:
id_data_transaksi

Display:
No. Transaksi

The UI may use human-readable labels, but the underlying data model
must preserve the ERD field.

==================================================
7. PROJECT STRUCTURE
==================================================

Organize the frontend into clear reusable layers:

- components
- layouts
- pages
- types
- services
- hooks
- utilities
- styles

Use an architecture that is easy to understand and maintain.

Do not put the entire application into one large component.

Suggested organization:

src/
  components/
  layouts/
  pages/
  types/
  services/
  hooks/
  utils/
  styles/

Keep domain types separate from UI components.

==================================================
8. DESIGN SYSTEM
==================================================

Convert the approved visual design into centralized design tokens.

Centralize:

- Colors
- Typography
- Font sizes
- Font weights
- Spacing
- Border radius
- Shadows
- Borders
- Component sizes
- Transitions

Avoid hardcoding repeated visual values throughout individual
components.

Use reusable styling patterns.

==================================================
9. GLOBAL STYLING
==================================================

Create a centralized global styling system.

Avoid unnecessary page-specific CSS.

Do not duplicate styles between pages when the same component or style
can be reused.

A global change to the design system should propagate consistently
across the application.

==================================================
10. REUSABLE COMPONENTS
==================================================

Create reusable components for recurring UI patterns.

Examples:

- Button
- Input
- Select
- SearchInput
- DateInput
- Table
- TablePagination
- Card
- Badge
- Modal
- ConfirmationDialog
- Toast
- Alert
- Sidebar
- Header
- PageHeader
- EmptyState
- LoadingState

Use component variants rather than duplicating components.

==================================================
11. DATA SERVICES
==================================================

Do not implement the actual database logic yet.

However, create clean service interfaces that reflect the application's
domain entities.

Examples:

- AdminService
- TransactionService
- ReceiptService
- NotaService
- PrintKwitansiService
- PrintNotaService

The services should be designed around the entities and relationships
represented in the ERD.

For example, transaction-related operations should work with the
FormulirTransaksi and DataTransaksi domain types.

Nota-related operations should work with the FormulirNota and
DataNota domain types.

Do not directly put database queries inside React components.

==================================================
12. DATABASE INDEPENDENCE
==================================================

Do not directly couple UI components to:

- SQLite
- Supabase
- Tauri
- Browser storage
- Database queries

The UI should communicate through clean domain types and service
interfaces.

The underlying implementation can later be:

Desktop:
Tauri + SQLite

Web:
Supabase

The UI should not need to know which implementation is being used.

==================================================
13. DESKTOP + WEB
==================================================

The same React frontend must be reusable for:

Desktop:
React + TypeScript + Tailwind
+
Tauri
+
SQLite

Web:
React + TypeScript + Tailwind
+
Supabase
+
Vercel

Do not create two separate frontend implementations.

Keep the UI platform-independent.

Avoid unnecessary browser-specific or Tauri-specific logic inside
visual components.

==================================================
14. RESPONSIVE DESIGN
==================================================

Ensure the frontend works across:

- Desktop
- Laptop
- Smaller application windows
- Web browsers

Preserve the approved visual design and hierarchy.

Use responsive layouts without creating unrelated designs for
different platforms.

==================================================
15. CODE QUALITY
==================================================

Prioritize:

- Type safety
- Reusability
- Maintainability
- Clear naming
- Small focused components
- Minimal duplication
- Consistent styling
- Clear separation of concerns
- Consistent domain models
- ERD-aligned data structures

Do not over-engineer the application.

Do not implement the backend yet.

Do not implement database queries yet.

==================================================
16. IMPORTANT DATA MODEL RULE
==================================================

The ERD is the source of truth for the data model.

The Figma design is the source of truth for the UI and user
experience.

When implementing the frontend:

ERD determines:
- Entities
- Fields
- Identifiers
- Relationships
- Data structure

Figma determines:
- Pages
- Layout
- Components
- Visual design
- User interactions
- Display labels
- User experience

Do not let the generated frontend invent a different data model.

==================================================
17. FINAL REQUIREMENT
==================================================

Generate a clean React + TypeScript + Tailwind frontend foundation
that:

1. Faithfully implements the approved Figma design.
2. Preserves all existing functionality.
3. Preserves all existing information.
4. Uses reusable components.
5. Uses centralized styling.
6. Uses centralized design tokens.
7. Uses TypeScript domain types aligned with the ERD.
8. Keeps services separate from UI components.
9. Keeps the UI independent from the database.
10. Can later support Tauri + SQLite.
11. Can later support Supabase + Vercel.
12. Does not implement the database yet.
13. Does not invent entities, fields, or relationships.
14. Is easy for a developer to continue and maintain.

The result should be a real, maintainable frontend foundation rather
than a collection of independent screens.