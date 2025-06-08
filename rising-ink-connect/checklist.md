Firebase Migration Checklist (v1 branch)
[x] 1. Prep & Planning
 Create and switch to v1 branch in your repo.

 Push branch to GitHub and set as your working branch.

 Make note of all integrations/files using Supabase or Lovable.

🔹 2. Dependency Cleanup
 Remove Supabase dependencies (@supabase/supabase-js) from package.json (after code is migrated).

 Remove Lovable-specific code/assets/integrations.

🔹 3. Set Up Firebase
 Install Firebase SDK: npm install firebase

 Add your firebaseConfig (from your earlier message) in a new file: /src/integrations/firebase/client.ts

 Initialize Firebase app in client.ts

🔹 4. AuthContext Migration
 Replace all Supabase auth logic with Firebase Auth (username/password).

 Refactor /contexts/AuthContext.tsx:

 signIn with Firebase

 signUp with Firebase (plus saving user profile info to Firestore)

 signOut with Firebase

 Manage user state with Firebase user objects

🔹 5. Profile & Role Data
 Migrate profile storage from Supabase DB to Firestore (Firebase).

 Refactor user role management (store roles in Firestore user doc).

 Refactor any custom claims or role checks.

🔹 6. Pages & Features Using Supabase
 Update all pages/components using Supabase queries to use Firebase:

 AdminPortal

 ArtistPortal

 ClientPortal

 AppointmentsPage

 Messaging, Scheduling, Payment, Artwork Galleries, etc.

🔹 7. Storage (Image Uploads, Galleries)
 Switch from Supabase Storage to Firebase Storage for:

 Profile images

 Gallery artwork/images

 Any file uploads

🔹 8. Scheduling, Messaging, Payments
 Migrate any database logic from Supabase tables to Firestore collections.

 Update CRUD operations for appointments, messages, payments, etc.

🔹 9. Clean Up
 Remove /integrations/supabase/ folder and unused code.

 Remove all Supabase imports/usages throughout codebase.

🔹 10. Test & Polish
 Test authentication, sign-up, login, sign-out flows.

 Test gallery and file uploads.

 Test scheduling, messaging, and payments.

 Verify role-based access everywhere.

 Review for any Lovable/Supabase code leftovers.

 Document new Firebase structure for future devs.

Optional: PWA & SEO
 Update manifest, icons, and metadata to reflect new stack if needed.