import { Analytics } from '@vercel/analytics/react';
import OpenSynt from './pages/OpenSynt';

export default function App() {
  return (
    <>
      <OpenSynt />
      <Analytics />
    </>
  );
}