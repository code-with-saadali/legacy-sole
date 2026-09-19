This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Landing page shopping

Homepage category cards open the matching shop filter. Best sellers are ranked by units in confirmed, dispatched and delivered orders, showing only available products. When there is no ranking, admin-featured products appear as a curated edit instead. Public ranking returns product slugs only.

For existing databases, apply `supabase/migrations/20260919_store_bestsellers.sql`. Delivery and returns copy reflects the store's confirmed 7-day windows.

### Order management

- Open an order from `/admin` to print an invoice or packing slip. Choose **Save as PDF** in the browser print dialog to download it.
- Save a courier name and tracking number, or use **Save & mark dispatched**. Saved tracking is included in customer tracking results and WhatsApp drafts; courier status is updated manually by the store.
- Search products by name, slug, category or colour. Search also works with the **Needs stock** filter.
- For an existing database, apply `supabase/migrations/20260919_order_shipping.sql` after the earlier store migrations. The migration preserves existing orders and admin access policies.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Size stock and colour variants

In **Admin → Products → Edit → Sizes & colour variants**, enable size tracking and enter stock for UK 6–10. Zero-stock sizes cannot be ordered. Total stock is calculated from the size quantities. Existing products retain shared stock until size tracking is enabled.

For additional colours, create a separate product with its own unique slug, colour, image, price and stock. Give related products the same **Colour group** (for example `court-classic`). Their product pages show linked colour options, and orders retain the selected colour and size.

For another database, apply `supabase/migrations/20260919_product_variants.sql` before using these controls. Checkout validates and deducts size inventory in the same transaction as the order.
