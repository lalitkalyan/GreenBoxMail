# GreenBoxMail

GreenBoxMail is a lightweight, privacy‑first disposable email service. It lets you generate a random temporary email address that lasts for ten minutes, view incoming messages in a simple inbox, and reset at any time. It's perfect for protecting your real inbox from spam or for quick sign‑ups.

## Features

- Generate a temporary email address that expires after 10 minutes
- Copy email address to clipboard
- Reset the inbox and timer at any time
- Live inbox viewer with subject, sender, and message content
- Responsive design with light/dark modes
- Clearly marked ad slots for easy monetisation
- Multilingual UI (English default with Polish option)

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router) with TypeScript
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Mail.tm API](https://api.mail.tm/) for mailbox creation, authentication and message retrieval
- [Vercel](https://vercel.com/) for hosting (you can also use Netlify)
- No server‑side state; all mailboxes are anonymous and deleted after expiration

## Getting Started

Clone the repository and install dependencies:

```
bash
pnpm install
# or: npm install
```

Run the development server:

```
bash
pnpm dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser. A new mailbox is created automatically when you visit the page.

### Environment

No API keys are required to use the Mail.tm API. If you add other services (analytics, etc.), create `.env.local` with the necessary variables.

## Deployment

The project is configured for deployment on Vercel. A sample `vercel.json` is provided. To deploy:

1. Sign in to [Vercel](https://vercel.com/) and link your GitHub repository.
2. Use the **dev** branch for previews and **main** for production.
3. Set any environment variables in the Vercel dashboard if needed.
4. Add your custom domain after testing (optional).

Alternatively, you can deploy to Netlify or another platform.

## Ads Integration

This project includes three ad placeholders (`AdTop`, `AdSidebar`, `AdBottom`) with identifiable IDs (`ads-top`, `ads-sidebar`, `ads-bottom`). To monetise with Google AdSense or another network:

1. Apply for and obtain ad code snippets.
2. Replace the contents of the placeholder components or insert your script tags into the `div` elements with the matching IDs.
3. Ensure you comply with the ad network's policies regarding temporary email services.

See `src/config/ads.ts` for a central place to configure your ad placeholder identifiers.

## Mail.tm Caveats

Mail.tm imposes rate limits on account creation and message polling. If you exceed these limits, the API will return errors or delay responses. Some websites block disposable email domains, so the generated addresses may not be accepted everywhere. All messages and accounts are deleted after expiry; we do not store any personal data.

## License

This project is licensed under the [MIT License](LICENSE).
