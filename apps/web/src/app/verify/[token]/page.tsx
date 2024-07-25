import EmailVerification from '@/components/EmailVerification';

export default function VerifyPage({ params }: { params: { token: string } }) {
  return <EmailVerification token={params.token} />;
}
