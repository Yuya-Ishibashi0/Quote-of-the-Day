import { Metadata } from 'next';
import QuoteDisplay from './quote-display';

interface PageProps {
  searchParams: {
    text?: string;
    author?: string;
    category?: string;
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const text = searchParams.text || 'Discover inspiring quotes';
  const author = searchParams.author || 'Quote of the Day';
  const category = searchParams.category || 'Inspiration';

  // Create the OG image URL with encoded parameters
  const ogImageUrl = new URL('/api/og', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  ogImageUrl.searchParams.set('text', text);
  ogImageUrl.searchParams.set('author', author);
  ogImageUrl.searchParams.set('category', category);

  const title = `"${text.substring(0, 60)}${text.length > 60 ? '...' : ''}" - ${author}`;
  const description = `${category} quote by ${author}. Share your wisdom with Quote of the Day.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: `Quote by ${author}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl.toString()],
    },
  };
}

export default function QuotePage({ searchParams }: PageProps) {
  return <QuoteDisplay searchParams={searchParams} />;
}