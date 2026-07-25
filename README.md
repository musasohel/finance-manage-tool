# Client Ledger 💼

A modern, minimal, responsive web application designed specifically for freelance graphic designers to manage clients, track partial payments, and generate professional A4 PDF invoices.

Designed with an Apple-inspired minimal aesthetic: lots of whitespace, crisp typography, clean status badges, soft shadows, and fast interaction.

---

## 🌟 Key Features

- **Authentication**: Firebase Authentication supporting Google One-Tap Sign In, Email & Password, Password Reset, and instant Guest Demo Mode.
- **Client Management**: Store client contact details, phone, email, company, and custom design preferences/notes with quick search.
- **Project Tracking**: Manage multiple projects per client with automated payment status calculation (`Unpaid`, `Partial`, `Paid`).
- **Partial Payment Engine**: Record unlimited partial payments with strict validation ensuring received payments never exceed project totals.
- **A4 PDF Invoice Generation**: One-click generation and download of branded PDF invoices using `pdf-lib` featuring studio logo, itemized services, payment history breakdown, and amount due summary.
- **Business Settings**: Customizable business name, phone, email, address, logo image, invoice prefix (e.g. `INV-0001`), and currency code (`BDT`, `$`, `€`, `£`).
- **Data Isolation**: Strict multi-tenant security rules ensuring each designer accesses only their own clients and project records.

---

## 🏗️ Folder Structure

```
├── firebase-applet-config.json # Firebase connection credentials
├── firestore.rules            # Security rules for multi-tenant isolation
├── index.html                 # Main SPA HTML template
├── package.json               # Package manifests and scripts
├── src/
│   ├── components/
│   │   ├── auth/              # AuthModal (Google & Email Login)
│   │   ├── clients/           # ClientsView & AddClientModal
│   │   ├── common/            # Badge & Pagination
│   │   ├── dashboard/         # DashboardView & Summary Metrics
│   │   ├── invoices/          # InvoicesView & InvoicePreviewModal
│   │   ├── layout/            # Sidebar & Navbar
│   │   ├── payments/          # AddPaymentModal
│   │   ├── projects/          # AddProjectModal & ProjectDetailModal
│   │   └── settings/          # SettingsView (Studio branding)
│   ├── context/
│   │   └── AuthContext.tsx    # Firebase Auth & Business Settings Context
│   ├── firebase/
│   │   ├── auth.ts            # Auth helper methods
│   │   └── config.ts          # Firebase SDK initialization
│   ├── services/
│   │   ├── clientService.ts   # Firestore CRUD for clients
│   │   ├── demoDataService.ts # 1-click sample dataset seeder
│   │   ├── paymentService.ts  # Partial payment & status recalculation
│   │   ├── pdfService.ts      # A4 PDF invoice generator with pdf-lib
│   │   ├── projectService.ts  # Firestore CRUD for projects
│   │   └── settingsService.ts # Business settings persistence
│   ├── types/
│   │   └── index.ts           # Shared TypeScript interfaces
│   ├── utils/
│   │   └── formatters.ts      # Currency, date, and phone validators
│   ├── App.tsx                # Primary application container
│   ├── index.css              # Tailwind CSS imports
│   └── main.tsx               # Vite entry point
├── tsconfig.json
└── vite.config.ts
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (based on `.env.example`):

```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-app"
VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
```

---

## 🚀 Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will run on `http://localhost:3000`.

3. **Build Production Application**:
   ```bash
   npm run build
   ```

---

## 🔒 Firebase Configuration

1. Enable **Authentication** in Firebase Console:
   - Enable **Google Provider**.
   - Enable **Email / Password Provider**.

2. Create a **Firestore Database**:
   - Deploy `firestore.rules` for data protection:
   ```rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /settings/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /clients/{clientId} {
         allow read, write: if request.auth != null && (resource == null || resource.data.userId == request.auth.uid);
         allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
       }
       match /projects/{projectId} {
         allow read, write: if request.auth != null && (resource == null || resource.data.userId == request.auth.uid);
         allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
       }
       match /payments/{paymentId} {
         allow read, write: if request.auth != null && (resource == null || resource.data.userId == request.auth.uid);
         allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
       }
     }
   }
   ```

---

## ☁️ Deployment on Vercel

1. Push your repository to **GitHub**.
2. Go to [Vercel](https://vercel.com) and select **Add New Project** -> **Import Repository**.
3. Select Framework Preset: **Vite**.
4. Configure Environment Variables (`VITE_FIREBASE_*`).
5. Click **Deploy**.

---

## 🔮 Future Improvements

- Automated recurring invoice schedules for retainer clients.
- Multi-currency conversion for international freelance projects.
- Export financial transaction records to CSV / Excel format.
- Send invoice PDF directly to client via email integration.
