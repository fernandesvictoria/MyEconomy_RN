import Layout from './Layout';
import { AuthProvider } from './src/contexts/authContext.tsx'

export default function App() {
  return (
    <AuthProvider>
      <Layout></Layout>
    </AuthProvider>
  );
}