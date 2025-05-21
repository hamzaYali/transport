import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { TABLES } from '@/lib/supabase';
import LoginForm from './client';

export default async function ExamplePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();

  // Fetch transports only if user is logged in
  let transports = null;
  let error = null;

  if (session) {
    const response = await supabase
      .from(TABLES.TRANSPORTS)
      .select('*')
      .order('pickup_date');
    
    transports = response.data;
    error = response.error;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Supabase SSR Example</h1>
      
      {!session ? (
        <div>
          <p className="mb-4">Please login to see transports:</p>
          <LoginForm />
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">Your Transports</h2>
          
          {error ? (
            <p className="text-red-500">{error.message}</p>
          ) : transports && transports.length === 0 ? (
            <p>No transports found.</p>
          ) : transports && (
            <ul className="space-y-2">
              {transports.map((transport) => (
                <li key={transport.id} className="border p-3 rounded">
                  <p><strong>Client:</strong> {transport.client_name}</p>
                  <p><strong>Pickup:</strong> {transport.pickup_location} at {transport.pickup_time}</p>
                  <p><strong>Status:</strong> {transport.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
} 