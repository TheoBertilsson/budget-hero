# Budget Hero

**Budget Hero** is a gamified personal finance web application designed to help you track expenses, set savings goals, gain insights into your financial habits and also COMPETE WIH YOUR FRIENDS!
Built with **Next.js** and **Firebase**, it combines clean UI, responsive performance, and modern development practices to deliver a smooth user experience.

<a href="https://www.budget-hero.app">www.budget-hero.app</a>

<img width="4286" height="3528" alt="image" src="https://github.com/user-attachments/assets/8726fda2-eea7-478d-82f0-8226c063b295" />

---

## Features

- **Expense Tracking** – Log your daily, weekly, and monthly expenses.
- **Categories** – Organize spending into categories.
- **Savings Goals** – Set and track long-term financial targets with automatic monthly breakdowns.
- **Internationalization** – Multi-language support with Next.js i18n and Negotiator.
- **Modern UI** – Built with React components and Tailwind CSS for a clean, responsive design.
- **Gameified** – Level up your character by completing goals, holding budget add reaching milestones! (not yet implemented)

---

## Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) (App Router, Server Components, i18n)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Auth:** [Firebase](https://firebase.google.com/) (Firestore, Auth, Hosting, Storage)
- **Database:** Firebase Firestore
- **Other Tools:**
  - TypeScript for type-safety
  - ESLint & Prettier for consistent code style
  - Negotiator for locale detection

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A Firebase project (Firestore + Auth enabled)

### Installation

```bash
# Clone the repository
git clone https://github.com/theobertilsson/budget-hero.git

# Navigate to the project folder
cd budget-hero

# Install dependencies
npm install
# or
yarn install
```

### Running the app

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start
```

---

## Enviorment Varibles

Create a `.env.local` file in the root with your Firebase Config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## Contributing

Contributions, issues and feature requests are welcome!
Feel free to open a Pr or submit issues in the app!

---

## License

MIT License © 2025 Theo Bertilsson
