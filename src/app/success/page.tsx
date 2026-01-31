import { redirect } from 'next/navigation';

export default function SuccessRedirect() {
  redirect('/billing/success');
}
