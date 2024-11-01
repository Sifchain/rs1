// components/withWalletCheck.js
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';

const withWalletCheck = (WrappedComponent) => {
  return (props) => {
    const { address, isConnected } = useAccount();
    const router = useRouter();

    const createUser = async (address) => {
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address }),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('user', JSON.stringify(data));
        } else {
          console.error('Failed to create or fetch user', data);
        }
      } catch (error) {
        console.error('Error creating or fetching user:', error);
      }
    };

    useEffect(() => {
      if (isConnected && address) {
        createUser(address);
      } else {
        if (
          router.pathname !== '/' &&
          router.pathname !== '/backrooms' &&
          router.pathname !== '/about' &&
          router.pathname !== '/agents'
        ) {
          router.push('/');
        }
      }
    }, [isConnected, address, router]);

    if (
      router.pathname === '/' ||
      router.pathname === '/backrooms' ||
      router.pathname === '/about' ||
      router.pathname === '/agents'
    ) {
      return <WrappedComponent {...props} />;
    }

    return isConnected ? <WrappedComponent {...props} /> : null;
  };
};

export default withWalletCheck;