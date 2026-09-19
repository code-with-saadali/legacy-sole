export type Review = { id: string; product_slug?: string; customer_name: string; rating: number; body: string; photos?: string[]; approved?: boolean; created_at: string };
export function reviewSummary(reviews: Review[]) {
  return { total: reviews.length, average: reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0, counts: [5,4,3,2,1].map(rating => ({ rating, count: reviews.filter(review => review.rating === rating).length })) };
}
