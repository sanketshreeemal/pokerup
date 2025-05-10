// Root page (landing/redirect)

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/new-game');
} 