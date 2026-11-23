// Shared Tailwind classes, so buttons, inputs and cards look the same everywhere.
// Every interactive element has a visible focus ring for keyboard users.

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950";

const buttonBase = `inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

export const buttonPrimary = `${buttonBase} bg-blue-600 text-white hover:bg-blue-700`;

export const buttonSecondary = `${buttonBase} border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800`;

export const buttonDanger = `${buttonBase} px-3 py-1 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950`;

export const link = `font-medium text-blue-700 underline-offset-4 hover:underline dark:text-blue-400 ${focusRing} rounded`;

export const input = `w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:[color-scheme:dark] ${focusRing}`;

export const label = "mb-1 block text-sm font-medium";

export const card =
  "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900";

export const mutedText = "text-gray-600 dark:text-gray-400";

export const errorText = "text-sm text-red-700 dark:text-red-400";

export const successText = "text-sm text-green-700 dark:text-green-400";
